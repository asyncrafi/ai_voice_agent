
import json
import base64
import tempfile
import os
import logging
from datetime import datetime
 
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.conf import settings
 
import openai
 
logger = logging.getLogger(__name__)
 
# ─── Difficulty System Prompts ────────────────────────────────────────────────
 
DIFFICULTY_PROMPTS = {
    'easy': """You are a friendly and cooperative insurance prospect named John Smith.
You are genuinely interested in getting mortgage protection insurance.
 
PERSONALITY:
- Warm, polite, and easy to talk to
- Answer all questions openly and honestly
- Volunteer information without much prompting
- Respond naturally to small talk and rapport building
 
INFORMATION YOU WILL SHARE WHEN ASKED:
- You own a home with a $280,000 mortgage
- You are 42 years old, married with 2 kids
- Height: 5'11", Weight: 185 lbs
- Non-smoker
- No major medical conditions
- No cancer, stroke, or heart attack history
- Currently on no medications
- You have basic life insurance but no mortgage protection
 
BEHAVIOR:
- If the agent is friendly, be very cooperative
- Answer health questions without hesitation
- Show genuine interest when coverage is explained
- Ask simple questions like "how much would that cost?"
- Never end the conversation abruptly
 
IMPORTANT: Stay in character always. You are a real prospect, not an AI.
Keep responses conversational and natural, 1-3 sentences max per turn.""",
 
    'medium': """You are a cautious insurance prospect named Sarah Johnson.
You are somewhat interested in mortgage protection insurance but not sure yet.
 
PERSONALITY:
- Polite but guarded
- Ask questions back before answering
- Need the agent to build trust before opening up
- Skeptical of salespeople but not rude
 
INFORMATION (share only when agent earns trust):
- You own a home with a $350,000 mortgage
- You are 38 years old, married
- Height: 5'6", Weight: 145 lbs
- Non-smoker (but used to smoke, quit 5 years ago)
- Mild hypertension, well controlled with medication
- No cancer, stroke, or heart attack history
- On lisinopril 10mg daily
- You've been burned by pushy salespeople before
 
BEHAVIOR:
- Ask "why do you need that?" before sharing personal info
- Say things like "I'm not sure I'm ready to share that"
- Make the agent explain the purpose of each question
- After 2-3 good explanations, start cooperating more
- Ask about costs, exclusions, and cancellation policy
- Occasionally say "let me think about it" to create mild objections
- Can be won over with patience and clear explanations
 
IMPORTANT: Stay in character. Start cautious, warm up gradually as the agent builds rapport.
Keep responses 1-3 sentences, natural conversation pace.""",
 
    'hard': """You are a highly resistant and skeptical insurance prospect named Mike Davis.
You are suspicious of insurance salespeople and very hard to crack.
 
PERSONALITY:
- Defensive and confrontational from the start
- Interrupt with objections frequently
- Question every single request for information
- Highly price-sensitive
- Had a bad experience with an insurance company before
 
INFORMATION (only share after major trust-building, if at all):
- You own a home with a $420,000 mortgage
- You are 51 years old
- Overweight: 5'9", 240 lbs
- Former smoker, quit 2 years ago
- Type 2 diabetes, controlled
- High cholesterol on medication (atorvastatin)
- Had a minor cardiac event 4 years ago (recovered fully)
- You're worried you won't qualify and don't want to be rejected
 
OBJECTIONS TO USE FREQUENTLY:
- "I already have life insurance, why do I need this?"
- "How do I know you're not going to take my money and disappear?"
- "My neighbor got insurance and they denied his claim."
- "This sounds too expensive."
- "I don't give out my medical information over the phone."
- "I need to talk to my wife first."
- "Send me something in the mail instead."
- "I'm busy, can you call back another time?"
 
BEHAVIOR:
- Start every response with mild resistance
- Challenge the agent's credibility early
- Only begin to open up after agent handles 3-4 objections well
- If agent gets frustrated or pushy, become MORE resistant
- If agent is patient and empathetic, soften slightly
- May threaten to end call: "I think I'm going to have to let you go"
- Only share medical info if agent explains exactly why and how it's used
 
IMPORTANT: This is hard mode. Make the agent work for every piece of information.
Keep responses 1-4 sentences. Be realistic, not cartoonishly rude.""",
}
 
 
def build_full_system_prompt(difficulty: str, script_content: str = '', extra_prompt: str = '') -> str:
    """Combine difficulty persona + script content into final system prompt."""
    base = DIFFICULTY_PROMPTS.get(difficulty, DIFFICULTY_PROMPTS['easy'])
 
    if script_content:
        base += f"""
 
TRAINING SCRIPT CONTEXT:
The agent has been trained on the following script. Respond in ways that allow them to practice these topics:
{script_content}"""
 
    if extra_prompt:
        base += f"""
 
ADDITIONAL INSTRUCTIONS:
{extra_prompt}"""
 
    base += """
 
GENERAL RULES:
- Never break character or admit you are an AI
- Never give advice to the agent or coach them
- Respond only as the prospect would respond
- Keep responses short and conversational (1-4 sentences)
- Use natural speech patterns, not formal language
- React emotionally to how well the agent handles the conversation"""
 
    return base
 
 
# ─── Consumer ────────────────────────────────────────────────────────────────
 
class TrainingChatConsumer(AsyncWebsocketConsumer):
 
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user       = self.scope.get('user')
 
        # Auth check
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return
 
        # Load session from DB
        self.session = await self.get_session(self.session_id, self.user)
        if not self.session:
            await self.close(code=4004)
            return
 
        # Build system prompt once on connect
        self.system_prompt = build_full_system_prompt(
            difficulty     = self.session['difficulty'],
            script_content = self.session['script_content'],
            extra_prompt   = self.session['script_system_prompt'],
        )
 
        # Conversation history for OpenAI (maintains context across turns)
        self.conversation_history = []
        self.turn_count           = 0
        self.questions_asked      = 0
        self.started_at           = datetime.now()
 
        await self.accept()
        logger.info(f"WS connected: session={self.session_id} user={self.user.id}")
 
        # Send welcome message so Flutter knows it's ready
        await self.send(text_data=json.dumps({
            'type':       'connected',
            'session_id': self.session_id,
            'difficulty': self.session['difficulty'],
            'message':    'Training session ready. Start speaking.',
        }))
 
    async def disconnect(self, close_code):
        logger.info(f"WS disconnected: session={self.session_id} code={close_code}")
 
    async def receive(self, text_data=None, bytes_data=None):
        try:
            data      = json.loads(text_data)
            msg_type  = data.get('type')
 
            if msg_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
 
            elif msg_type == 'text_message':
                agent_text = data.get('text', '').strip()
                if not agent_text:
                    return
                await self._handle_agent_message(agent_text)
 
            elif msg_type == 'audio_message':
                # Transcribe audio via Whisper then treat as text message
                audio_b64 = data.get('audio_base64', '')
                if not audio_b64:
                    await self._send_error('No audio data received.')
                    return
                transcript = await self._transcribe_audio(audio_b64)
                if not transcript:
                    await self._send_error('Could not transcribe audio. Please try again.')
                    return
                # Echo transcription back to Flutter so it can show what was said
                await self.send(text_data=json.dumps({
                    'type': 'transcription',
                    'text': transcript,
                }))
                await self._handle_agent_message(transcript)
 
            elif msg_type == 'end_session':
                duration = int((datetime.now() - self.started_at).total_seconds())
                score    = await self._end_session(duration)
                await self.send(text_data=json.dumps({
                    'type':              'session_ended',
                    'performance_score': score,
                    'duration_seconds':  duration,
                    'total_turns':       self.turn_count,
                    'questions_asked':   self.questions_asked,
                }))
                await self.close()
 
            else:
                await self._send_error(f'Unknown message type: {msg_type}')
 
        except json.JSONDecodeError:
            await self._send_error('Invalid JSON.')
        except Exception as e:
            logger.exception(f"WS receive error: {e}")
            await self._send_error('An unexpected error occurred.')
 
    # ─── Core AI Handler ─────────────────────────────────────────────────────
 
    async def _handle_agent_message(self, agent_text: str):
        """Add agent message to history, call OpenAI, stream response back."""
        self.turn_count += 1
 
        # Count questions asked by agent
        if '?' in agent_text:
            self.questions_asked += 1
 
        # Add to conversation history
        self.conversation_history.append({
            'role':    'user',
            'content': agent_text,
        })
 
        # Save to transcript in session
        await self.append_to_transcript({
            'role':      'agent',
            'text':      agent_text,
            'timestamp': self.turn_count,
        })
 
        try:
            ai_text = await self._get_ai_response()
        except Exception as e:
            logger.exception(f"OpenAI error: {e}")
            await self._send_error('AI response failed. Please try again.')
            return
 
        # Add AI response to history
        self.conversation_history.append({
            'role':    'assistant',
            'content': ai_text,
        })
 
        # Save AI turn to transcript
        await self.append_to_transcript({
            'role':      'ai',
            'text':      ai_text,
            'timestamp': self.turn_count,
        })
 
        # Send to Flutter
        await self.send(text_data=json.dumps({
            'type': 'ai_response',
            'text': ai_text,
            'turn': self.turn_count,
        }))
 
    # ─── OpenAI Chat ─────────────────────────────────────────────────────────
 
    async def _get_ai_response(self) -> str:
        """Call OpenAI Chat Completion with full conversation history."""
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
 
        messages = [
            {'role': 'system', 'content': self.system_prompt},
            *self.conversation_history,
        ]
 
        response = await client.chat.completions.create(
            model       = 'gpt-4o-mini',   # fast + cheap for real-time chat
            messages    = messages,
            max_tokens  = 150,             # keep responses short and conversational
            temperature = 0.85,            # some variation so it doesn't feel robotic
        )
 
        return response.choices[0].message.content.strip()
 
    # ─── Whisper Transcription ───────────────────────────────────────────────
 
    async def _transcribe_audio(self, audio_b64: str) -> str:
        """Decode base64 audio and transcribe with Whisper."""
        try:
            audio_bytes = base64.b64decode(audio_b64)
            client      = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
 
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
 
            try:
                with open(tmp_path, 'rb') as audio_file:
                    response = await client.audio.transcriptions.create(
                        model = 'whisper-1',
                        file  = audio_file,
                    )
                return response.text.strip()
            finally:
                os.unlink(tmp_path)  # always clean up
 
        except Exception as e:
            logger.exception(f"Whisper error: {e}")
            return ''
 
    # ─── DB Helpers ──────────────────────────────────────────────────────────
 
    @database_sync_to_async
    def get_session(self, session_id: int, user) -> dict | None:
        """Load session + related script data."""
        from .models import TrainingSession
        try:
            session = TrainingSession.objects.select_related('script').get(
                pk    = session_id,
                agent = user,
            )
            return {
                'id':                  session.id,
                'difficulty':          session.difficulty,
                'script_content':      session.script.content if session.script else '',
                'script_system_prompt': session.script.system_prompt if session.script else '',
            }
        except TrainingSession.DoesNotExist:
            return None
 
    @database_sync_to_async
    def append_to_transcript(self, turn: dict):
        """Append a single turn to session transcript."""
        from .models import TrainingSession
        try:
            session = TrainingSession.objects.get(pk=self.session_id)
            transcript = session.transcript or []
            transcript.append(turn)
            session.transcript = transcript
            session.save(update_fields=['transcript'])
        except TrainingSession.DoesNotExist:
            pass
 
    @database_sync_to_async
    def _end_session(self, duration_seconds: int) -> float:
        """Mark session completed, calculate score, return it."""
        from .models import TrainingSession
        try:
            session = TrainingSession.objects.get(pk=self.session_id)
            session.status           = TrainingSession.COMPLETED
            session.ended_at         = timezone.now()
            session.duration_seconds = duration_seconds
            session.questions_asked  = self.questions_asked
 
            # Performance scoring
            duration_score  = min(duration_seconds / 600 * 50, 50)   # 50pts max for 10min
            questions_score = min(self.questions_asked * 5, 50)        # 50pts max for 10 questions
            session.performance_score = round(duration_score + questions_score, 1)
 
            session.save()
            return session.performance_score
        except TrainingSession.DoesNotExist:
            return 0.0
 
    # ─── Utils ───────────────────────────────────────────────────────────────
 
    async def _send_error(self, message: str):
        await self.send(text_data=json.dumps({
            'type':    'error',
            'message': message,
        }))
 
 
