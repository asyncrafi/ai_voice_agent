# PeakAgent Backend (AI Voice Agent)

Welcome to the **PeakAgent** backend! This system powers real-time AI-driven training sessions for insurance agents. Agents connect via WebSockets and converse with an AI prospect tailored by customizable training scripts.

## 🚀 Tech Stack
- **Framework:** Django 5.1 & Django REST Framework
- **WebSockets:** Django Channels (Daphne)
- **Database:** PostgreSQL 16
- **Cache & Message Broker:** Redis 7
- **Background Tasks:** Celery & Celery Beat
- **AI Integration:** OpenAI (Whisper for STT, GPT-4o-mini for Chat)
- **Containerization:** Docker & Docker Compose

---

## 🛠️ Local Development Setup

1. **Clone the repository** and navigate to the root directory.
2. **Create the `.env` file** based on the required environment variables:
   ```env
   DJANGO_SECRET_KEY=your_secret_key_here
   DJANGO_ALLOWED_HOSTS=*
   DJANGO_DEBUG=True
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
   # Database and Redis settings are handled automatically by docker-compose
   ```
3. **Build and start the containers:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```
4. **Apply database migrations** (if not auto-applied):
   ```bash
   docker exec aivoice-app-1 python manage.py migrate
   ```
5. **Create a superuser (Admin):**
   ```bash
   docker exec -it aivoice-app-1 python manage.py createsuperuser
   ```

The API will now be accessible at `http://localhost:8000/`.

---

## ☁️ VPS Deployment Guide (Production)

To deploy this on a VPS (like DigitalOcean, AWS, or Linode):
1. **Prepare the server:** SSH into your VPS and install Docker & Docker Compose.
2. **Clone the repo:** Clone this repository onto the server.
3. **Configure Environment:** Update the `.env` file with production values. Set `DJANGO_DEBUG=False`, restrict `DJANGO_ALLOWED_HOSTS` to your domain, and add your real `OPENAI_API_KEY`.
4. **Deploy Containers:** Run the docker-compose stack in detached mode:
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```
5. **Reverse Proxy & SSL:** It is critical to expose port `8000` behind an Nginx reverse proxy and secure it with an SSL Certificate (via Certbot/Let's Encrypt). This enables secure WebSockets (`wss://`) and secure API requests (`https://`), which modern mobile apps require.

---

## 🤖 WebSockets: The Real-Time AI Training Flow

Agents practice their scripts by speaking to an AI prospect.

**WebSocket Endpoint:**
```
ws://<your-domain>/ws/training/chat/<session_id>/?token=<jwt_access_token>
```

**Message Structure:**
The Flutter frontend should send JSON payloads. For text messages:
```json
{
    "type": "text_message",
    "text": "Hello! I am calling about your mortgage protection inquiry."
}
```
For voice messages (which the backend will transcribe using Whisper):
```json
{
    "type": "audio_message",
    "audio_base64": "UklGRiQAAABXRQ..."
}
```

---

## 📝 Managing Training Scripts (API)

You do **not** need to touch the code or the VPS to update the agent training scripts! You can manage them entirely via Postman or your Admin Dashboard. 

*Note: All endpoints below require an Admin/Staff JWT Bearer Token.*

- **List all scripts:** `GET /api/training/scripts/`
- **Create a new script:** `POST /api/training/scripts/`
- **Update a script:** `PATCH /api/training/scripts/<id>/`
- **Delete a script:** `DELETE /api/training/scripts/<id>/`

### Example POST / PATCH Payload:
```json
{
    "title": "JD Rogers Group Face-to-Face MP Phone Script",
    "category": "Mortgage Protection",
    "difficulty": "medium",
    "content": "Agent script text goes here...",
    "system_prompt": "You are a homeowner who recently inquired...",
    "is_default": true
}
```
*The `system_prompt` tells the AI how to act and roleplay, while `content` gives context on what topics the agent is supposed to cover during the call.*
