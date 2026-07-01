from django.utils import timezone
from django.db.models import Avg
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import TrainingScript, AgentScript, TrainingSession
from .serializers import (
    TrainingScriptSerializer,
    TrainingScriptListSerializer,
    AgentScriptSerializer,
    TrainingSessionStartSerializer,
    TrainingSessionEndSerializer,
    TrainingSessionSerializer,
    TrainingSessionListSerializer,
)
# FIX: reuse the SAME persona prompts as the WebSocket consumer instead of keeping a
# second, slightly different copy in this file. Previously this file had its own
# DIFFICULTY_SYSTEM_PROMPTS dict that didn't match consumers.py — meaning the prompt
# returned by /sessions/start/ (for reference/debugging) could drift out of sync with
# the prompt actually used inside the live WebSocket chat.
from .consumers import build_full_system_prompt


def calculate_performance_score(session: TrainingSession) -> float:
    """
    Simple scoring logic — expand later.
    Based on: duration (longer = more engagement) + questions asked.
    Returns 0-100.
    """
    duration_score = min(session.duration_seconds / 600 * 50, 50)  # max 50pts for 10min
    questions_score = min(session.questions_asked * 5, 50)         # max 50pts for 10 questions
    return round(duration_score + questions_score, 1)


# ─── Admin: Training Script CRUD ──────────────────────────
class TrainingScriptListCreateView(APIView):
    """
    GET is also used by the agent-facing 'choose difficulty / choose training' screen
    that was missing from the Figma export — pass ?difficulty=easy|medium|hard to
    filter, which is what that screen's cards should call.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        scripts = TrainingScript.objects.filter(is_draft=False).order_by('-created_at')

        difficulty = request.query_params.get('difficulty')
        category = request.query_params.get('category')
        if difficulty:
            scripts = scripts.filter(difficulty=difficulty)
        if category:
            scripts = scripts.filter(category__icontains=category)

        serializer = TrainingScriptListSerializer(scripts, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        # Support the "Save as Draft" button vs "Create Training" button
        is_draft = str(request.data.get('is_draft', 'false')).lower() == 'true'

        serializer = TrainingScriptSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user, is_draft=is_draft)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainingScriptDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, pk):
        try:
            return TrainingScript.objects.get(pk=pk)
        except TrainingScript.DoesNotExist:
            return None

    def get(self, request, pk):
        script = self.get_object(pk)
        if not script:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TrainingScriptSerializer(script).data)

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        script = self.get_object(pk)
        if not script:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TrainingScriptSerializer(script, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        script = self.get_object(pk)
        if not script:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        script.delete()
        return Response({"message": "Deleted."}, status=status.HTTP_204_NO_CONTENT)


# ─── Agent: Custom Scripts ─────────────────────────────────
class AgentScriptListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scripts = AgentScript.objects.filter(agent=request.user).order_by('-created_at')
        return Response(AgentScriptSerializer(scripts, many=True).data)

    def post(self, request):
        serializer = AgentScriptSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgentScriptDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return AgentScript.objects.get(pk=pk, agent=user)
        except AgentScript.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk, request.user)
        if not obj:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AgentScriptSerializer(obj).data)

    def patch(self, request, pk):
        obj = self.get_object(pk, request.user)
        if not obj:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AgentScriptSerializer(obj, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user)
        if not obj:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({"message": "Deleted."}, status=status.HTTP_204_NO_CONTENT)


# ─── Training Sessions ─────────────────────────────────────
class StartTrainingSessionView(APIView):
    """
    Agent starts a session (this is the API behind the missing 'Choose Difficulty' +
    'Start Training' screens).

    Returns session_id + the system_prompt actually used (for debugging/reference).
    Frontend then opens the WebSocket at:
        ws/training/chat/<session_id>/?token=<access_token>
    and streams audio_message frames; see consumers.py for the full contract
    (now includes audio_base64 TTS replies).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TrainingSessionStartSerializer(data=request.data)
        if serializer.is_valid():
            script = TrainingScript.objects.get(id=serializer.validated_data['script_id'])
            difficulty = serializer.validated_data['difficulty']
            prompt = build_full_system_prompt(
                difficulty=difficulty,
                script_content=script.content,
                extra_prompt=script.system_prompt,
            )

            session = TrainingSession.objects.create(
                agent=request.user,
                script=script,
                difficulty=difficulty,
                status=TrainingSession.IN_PROGRESS,
            )

            return Response({
                "session_id": session.id,
                "system_prompt": prompt,
                "difficulty": difficulty,
                "script_title": script.title,
                "websocket_url": f"ws/training/chat/{session.id}/",
                "message": "Session started. Connect to WebSocket with session_id.",
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EndTrainingSessionView(APIView):
    """Agent ends session, sends transcript + stats.

    NOTE: In the live-chat flow, the WebSocket 'end_session' message already does this
    (see consumers.py -> _end_session). This REST endpoint is a fallback for cases
    where the socket already dropped and Flutter needs to close out the session from
    its locally cached transcript instead.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            session = TrainingSession.objects.get(pk=pk, agent=request.user)
        except TrainingSession.DoesNotExist:
            return Response({"error": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        if session.status == TrainingSession.COMPLETED:
            return Response({"error": "Session already ended."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TrainingSessionEndSerializer(data=request.data)
        if serializer.is_valid():
            session.transcript = serializer.validated_data.get('transcript', [])
            session.duration_seconds = serializer.validated_data['duration_seconds']
            session.questions_asked = serializer.validated_data['questions_asked']
            session.status = TrainingSession.COMPLETED
            session.ended_at = timezone.now()
            session.performance_score = calculate_performance_score(session)
            session.save()

            return Response({
                "message": "Session completed.",
                "performance_score": session.performance_score,
                "duration_seconds": session.duration_seconds,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainingSessionListView(APIView):
    """Agent's own session history."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = TrainingSession.objects.filter(agent=request.user).order_by('-started_at')

        status_filter = request.query_params.get('status')
        difficulty = request.query_params.get('difficulty')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if status_filter:
            sessions = sessions.filter(status=status_filter)
        if difficulty:
            sessions = sessions.filter(difficulty=difficulty)
        if date_from:
            sessions = sessions.filter(started_at__date__gte=date_from)
        if date_to:
            sessions = sessions.filter(started_at__date__lte=date_to)

        return Response(TrainingSessionListSerializer(sessions, many=True).data)


class TrainingSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # agents see own sessions; admins see all
            if request.user.is_staff:
                session = TrainingSession.objects.get(pk=pk)
            else:
                session = TrainingSession.objects.get(pk=pk, agent=request.user)
        except TrainingSession.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TrainingSessionSerializer(session).data)


class AgentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        all_sessions = TrainingSession.objects.filter(agent=user)
        today_sessions = all_sessions.filter(started_at__date=today)

        today_completed = today_sessions.filter(status=TrainingSession.COMPLETED).count()
        today_goal = 5  # configurable later
        today_percent = int((today_completed / today_goal) * 100) if today_goal else 0

        avg_score = all_sessions.filter(
            performance_score__isnull=False
        ).aggregate(avg=Avg('performance_score'))['avg'] or 0

        avg_duration = all_sessions.filter(
            status=TrainingSession.COMPLETED
        ).aggregate(avg=Avg('duration_seconds'))['avg'] or 0

        recent = all_sessions.order_by('-started_at')[:5]

        return Response({
            "today_sessions_completed": today_completed,
            "today_sessions_goal": today_goal,
            "today_completion_percent": min(today_percent, 100),
            "overall_accuracy": round(avg_score, 1),
            "avg_session_minutes": round(avg_duration / 60, 1),
            "total_sessions": all_sessions.count(),
            "recent_sessions": TrainingSessionListSerializer(recent, many=True).data,
        })