import secrets
import string

from django.db.models import Q, Avg, Count, Max
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.training.models import TrainingSession
from apps.accounts.models import User
from .serializers import (
    AgentTrainerListSerializer,
)
from apps.training.serializers import AgentAggregateSerializer


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        total_agents = User.objects.filter(is_staff=False).count()
        total_sessions = TrainingSession.objects.count()
        ai_usage_count = TrainingSession.objects.filter(
            status=TrainingSession.COMPLETED
        ).count()
        ai_usage_pct = round((ai_usage_count / total_sessions * 100) if total_sessions else 0, 1)

        # Monthly activity trend for current year
        year = timezone.now().year
        monthly = (
            TrainingSession.objects
            .filter(started_at__year=year)
            .annotate(month=TruncMonth('started_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        trend = [
            {
                "month": entry['month'].strftime('%b'),
                "count": entry['count'],
                "percent": min(round(entry['count'] / max(total_sessions, 1) * 100), 100)
            }
            for entry in monthly
        ]

        recent_sessions = TrainingSession.objects.select_related(
            'agent', 'script'
        ).order_by('-started_at')[:10]

        return Response({
            "total_agents": total_agents,
            "total_sessions": total_sessions,
            "ai_usage_rate": ai_usage_pct,
            "activity_trend": trend,
            "recent_user_sessions": AgentTrainerListSerializer(recent_sessions, many=True).data,
        })


class AgentTrainerListView(APIView):
    """
    Admin: 'Agent Trainer' table.

    FIX (previous bug): this used to return one row PER SESSION, so a single agent
    with 42 sessions showed up as 42 identical-looking rows all displaying the same
    "42" — which is exactly the symptom you flagged from the Figma table. Now this
    aggregates properly: ONE ROW PER AGENT, with total session count, average
    performance score, and their most recent session's status/date/topic.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        status_filter = request.query_params.get('status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        search = request.query_params.get('search')

        sessions = TrainingSession.objects.select_related('agent', 'script')

        if date_from:
            sessions = sessions.filter(started_at__date__gte=date_from)
        if date_to:
            sessions = sessions.filter(started_at__date__lte=date_to)
        if search:
            sessions = sessions.filter(
                Q(agent__full_name__icontains=search) |
                Q(script__title__icontains=search)
            )

        # Aggregate per agent
        agents_qs = User.objects.filter(
            is_staff=False,
            sessions__in=sessions,
        ).distinct().annotate(
            session_count=Count('sessions', filter=Q(sessions__in=sessions)),
            avg_score=Avg('sessions__performance_score', filter=Q(sessions__in=sessions)),
            last_session_at=Max('sessions__started_at', filter=Q(sessions__in=sessions)),
        )

        rows = []
        for agent in agents_qs:
            last_session = sessions.filter(agent=agent).order_by('-started_at').first()
            if status_filter and status_filter != 'all':
                if not last_session or last_session.status != status_filter:
                    continue
            rows.append({
                "agent_id": agent.id,
                "agent_name": agent.full_name,
                "training_topic": last_session.script.title if last_session and last_session.script else '',
                "performance_score": round(agent.avg_score or 0, 1),
                "sessions": agent.session_count,
                "last_session_date": agent.last_session_at,
                "status": last_session.status if last_session else '',
            })

        # pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        total = len(rows)

        return Response({
            "count": total,
            "page": page,
            "pages": (total + page_size - 1) // page_size,
            "results": AgentAggregateSerializer(rows[start:end], many=True).data,
        })


class AgentTrainerDetailView(APIView):
    """Admin: view a single session in detail."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        try:
            session = TrainingSession.objects.get(pk=pk)
        except TrainingSession.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        from apps.training.serializers import TrainingSessionSerializer
        return Response(TrainingSessionSerializer(session).data)


class AddAgentView(APIView):
    """
    FIX: This endpoint was completely missing. The Figma 'Agent Trainer' page has a
    '+ Add Agent' button (top right) with no corresponding API anywhere in the
    codebase — only self-serve /accounts/register/ existed, which isn't usable by an
    admin creating an account on someone else's behalf.

    Admin fills in name/email (and optionally phone), a random temp password is
    generated, the agent account is created pre-verified, and credentials are
    returned so the admin can share them (or wire this up to an invite email later).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        full_name = request.data.get('full_name')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number', '')

        if not full_name or not email:
            return Response(
                {"error": "full_name and email are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        temp_password = ''.join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(10)
        )

        user = User.objects.create_user(
            email=email,
            full_name=full_name,
            password=temp_password,
        )
        # optional field — remove this line if your User model doesn't have phone_number
        if hasattr(user, 'phone_number'):
            user.phone_number = phone_number
        user.is_verified = True
        user.is_staff = False
        user.save()

        # TODO: wire this into your email task (like send_password_reset_email_task)
        # to actually deliver the temp password instead of returning it in the response.
        return Response({
            "message": "Agent created successfully.",
            "agent": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
            },
            "temp_password": temp_password,
        }, status=status.HTTP_201_CREATED)