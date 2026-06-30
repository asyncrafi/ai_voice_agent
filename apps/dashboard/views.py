from django.shortcuts import render
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.training.models import TrainingSession
from apps.accounts.models import User
from django.db.models import Avg, Count, Sum, Q
from .serializers import (
    AdminDashboardSerializer,
    AgentTrainerListSerializer,
)
from apps.training.serializers import TrainingSessionSerializer
from django.utils import timezone


# Create your views here.
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models.functions import TruncMonth
        import calendar

        total_agents   = User.objects.filter(role='agent').count()
        total_sessions = TrainingSession.objects.count()
        ai_usage_rate  = TrainingSession.objects.filter(
            status=TrainingSession.COMPLETED
        ).count()
        ai_usage_pct   = round((ai_usage_rate / total_sessions * 100) if total_sessions else 0, 1)

        # Monthly activity trend for current year
        from django.db.models.functions import TruncMonth
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
            "total_agents":         total_agents,
            "total_sessions":       total_sessions,
            "ai_usage_rate":        ai_usage_pct,
            "activity_trend":       trend,
            "recent_user_sessions": AgentTrainerListSerializer(recent_sessions, many=True).data,
        })


class AgentTrainerListView(APIView):
    """Admin: list all agent training records."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        sessions = TrainingSession.objects.select_related('agent', 'script').order_by('-started_at')

        status_filter = request.query_params.get('status')
        date_from     = request.query_params.get('date_from')
        date_to       = request.query_params.get('date_to')
        search        = request.query_params.get('search')

        if status_filter and status_filter != 'all':
            sessions = sessions.filter(status=status_filter)
        if date_from:
            sessions = sessions.filter(started_at__date__gte=date_from)
        if date_to:
            sessions = sessions.filter(started_at__date__lte=date_to)
        if search:
            sessions = sessions.filter(
                Q(agent__full_name__icontains=search) |
                Q(script__title__icontains=search)
            )

        return Response(AgentTrainerListSerializer(sessions, many=True).data)


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
        return Response(TrainingSessionSerializer(session).data)
