from rest_framework import serializers
from apps.training.models import TrainingSession


class AdminDashboardSerializer(serializers.Serializer):
    total_agents = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    ai_usage_rate = serializers.FloatField()
    activity_trend = serializers.ListField(child=serializers.DictField())  # monthly data
    recent_user_sessions = serializers.ListField(child=serializers.DictField())


class AgentTrainerListSerializer(serializers.ModelSerializer):
    """Per-session row — used for the admin dashboard's 'recent sessions' widget only.
    For the full 'Agent Trainer' table (aggregated per agent), see
    apps.training.serializers.AgentAggregateSerializer instead.
    """

    agent_name = serializers.CharField(source='agent.full_name', read_only=True)
    training_topic = serializers.CharField(source='script.title', read_only=True)
    performance_score = serializers.FloatField()

    class Meta:
        model = TrainingSession
        fields = [
            'id', 'agent_name', 'training_topic',
            'performance_score', 'questions_asked',
            'duration_seconds', 'status', 'started_at',
        ]