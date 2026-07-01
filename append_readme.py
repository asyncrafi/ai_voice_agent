import os

markdown_text = """

---

## 🧪 Complete API Testing Flow (Step-by-Step)

This guide walks you through the entire backend API flow in logical order, from creating an account to managing admin resources. You can test all of these using the provided `PeakAgent_Postman_Collection.json`.

### Phase 1: Authentication & Account Setup
1. **Register Agent** `POST /api/auth/register/`
   - **Body:** `{"full_name": "John Doe", "email": "john@example.com", "password": "Password123!", "retype_password": "Password123!"}`
   - **Result:** Returns `201 Created` with a 6-digit `otp_code` (in dev) and `is_sent: true`.
2. **Verify OTP** `POST /api/auth/verify-otp/`
   - **Body:** `{"email": "john@example.com", "code": "<the_6_digit_otp>"}`
   - **Result:** Account becomes verified (`is_verified: true`).
3. **Login** `POST /api/auth/login/`
   - **Body:** `{"email": "john@example.com", "password": "Password123!"}`
   - **Result:** Returns `access` (Access Token) and `refresh` (Refresh Token). **Use the `access` token as a Bearer Token for all subsequent requests.**
4. **Get Profile** `GET /api/auth/profile/` or `/api/auth/me/`
   - **Result:** Returns user details (`id`, `email`, `avatar`, `is_verified`, etc.).
5. **Update Language** `PATCH /api/auth/me/language/`
   - **Body:** `{"language": "es"}`
   - **Result:** Updates the user's preferred language.
6. **Change Password** `POST /api/auth/change-password/`
   - **Body:** `{"old_password": "Password123!", "new_password": "NewPassword123!", "retype_password": "NewPassword123!"}`
7. **Logout** `POST /api/auth/logout/`
   - **Body:** `{"refresh": "<your_refresh_token>"}`
   - **Result:** Blacklists the token.

*(Optional: Forgot Password Flow)*
- **Forgot Password** `POST /api/auth/forgot-password/` (Body: `{"email": "john@example.com"}`)
- **Verify OTP** `POST /api/auth/verify-otp/` (Body: `{"email": "john@example.com", "code": "<otp>"}`)
- **Reset Password** `POST /api/auth/reset-password/` (Body: `{"email": "john@example.com", "otp": "<otp>", "new_password": "...", "retype_password": "..."}`)

### Phase 2: Agent Training & Practice
1. **List Default Scripts** `GET /api/training/scripts/`
   - **Result:** Fetches global/admin-created practice scripts.
2. **List Custom Agent Scripts** `GET /api/training/agent-scripts/`
   - **Result:** Fetches scripts created specifically by the current agent.
3. **Create Custom Script** `POST /api/training/agent-scripts/`
   - **Body:** `{"title": "My Script", "content": "Practice text...", "difficulty": "medium"}`
4. **Start Training Session** `POST /api/training/sessions/start/`
   - **Body:** `{"script_id": 1, "difficulty": "hard"}`
   - **Result:** Creates a session and returns a `session_id`.
5. **WebSocket Chat Connection** `ws://localhost:8000/ws/training/chat/<session_id>/`
   - **Headers/Params:** Send Bearer token or pass as `?token=<access_token>`.
   - **Flow:** Send JSON text/audio messages, receive AI prospect responses.
6. **End Session** `PATCH /api/training/sessions/<session_id>/end/`
   - **Body:** `{"duration_seconds": 300, "questions_asked": 5}`
   - **Result:** Marks session as `completed` and calculates metrics.
7. **Agent Dashboard** `GET /api/training/dashboard/`
   - **Result:** Returns agents' individual stats (sessions completed, total time, etc.).
8. **List Training Sessions** `GET /api/training/sessions/`
   - **Result:** Returns history of all completed training sessions for this agent.

### Phase 3: Admin & Operations (Requires `is_staff=True`)
*To run these, ensure your user is a superuser/admin.*
1. **Admin Dashboard Overview** `GET /api/admin/dashboard/`
   - **Result:** Global metrics (total agents, AI usage rate, activity trend, etc.).
2. **Admin Agent List** `GET /api/admin/agents/`
   - **Result:** Lists all agent training histories and allows filtering by status or date.
3. **Admin Manage Default Scripts** `POST`, `PUT`, `DELETE` to `/api/training/scripts/`
   - **Result:** Full CRUD over global scripts for all agents.
4. **List/Upload Policy Documents** `GET`, `POST` `/api/policy/documents/`
   - **Body (POST):** `form-data` with `name`, `category`, `tags`, `description`, and optionally a file.
   - **Result:** Manages reference documents available in the policy library.
5. **Manage Policy Documents** `GET`, `PUT`, `DELETE` `/api/policy/documents/<id>/`

### Phase 4: General Utility
1. **Health Check** `GET /api/health/`
   - **Result:** Confirms API is running.
2. **Get Site Content** `GET /api/auth/site-content/privacy/` or `/terms/`
   - **Result:** Returns global static terms/privacy policy for the app.
"""

with open("README.md", "a") as f:
    f.write(markdown_text)

print("Updated README.md")
