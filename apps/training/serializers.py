from rest_framework import serializers
from .models import TrainingScript, AgentScript, TrainingSession
from apps.accounts.serializers import UserProfileSerializer


class TrainingScriptSerializer(serializers.ModelSerializer):
    """Used by admin to create/edit scripts."""
    class Meta:
        model  = TrainingScript
        fields = [
            'id', 'title', 'category', 'difficulty',
            'content', 'system_prompt', 'image',
            'description', 'is_default', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TrainingScriptListSerializer(serializers.ModelSerializer):
    """Lightweight for list views."""
    class Meta:
        model  = TrainingScript
        fields = ['id', 'title', 'category', 'difficulty', 'image', 'description', 'is_default']


class AgentScriptSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AgentScript
        fields = ['id', 'base_script', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['agent'] = self.context['request'].user
        return super().create(validated_data)


class TrainingSessionStartSerializer(serializers.Serializer):
    """Agent picks a script + difficulty to start a session."""
    script_id  = serializers.IntegerField()
    difficulty = serializers.ChoiceField(choices=['easy', 'medium', 'hard'])

    def validate_script_id(self, value):
        if not TrainingScript.objects.filter(id=value).exists():
            raise serializers.ValidationError("Script not found.")
        return value


class TrainingSessionEndSerializer(serializers.Serializer):
    """Agent sends transcript + stats when session ends."""
    transcript       = serializers.ListField(child=serializers.DictField(), required=False)
    duration_seconds = serializers.IntegerField(min_value=0)
    questions_asked  = serializers.IntegerField(min_value=0, required=False, default=0)


class TrainingSessionSerializer(serializers.ModelSerializer):
    """Full session detail."""
    agent  = UserProfileSerializer(read_only=True)
    script = TrainingScriptListSerializer(read_only=True)

    class Meta:
        model  = TrainingSession
        fields = [
            'id', 'agent', 'script', 'difficulty', 'status',
            'transcript', 'duration_seconds', 'questions_asked',
            'performance_score', 'started_at', 'ended_at',
        ]
        read_only_fields = fields


class TrainingSessionListSerializer(serializers.ModelSerializer):
    """Lightweight for list / recent sessions."""
    script_title = serializers.CharField(source='script.title', read_only=True)

    class Meta:
        model  = TrainingSession
        fields = [
            'id', 'script_title', 'difficulty', 'status',
            'duration_seconds', 'questions_asked',
            'performance_score', 'started_at', 'ended_at',
        ]


class AgentDashboardSerializer(serializers.Serializer):
    """Agent home screen stats."""
    today_sessions_completed = serializers.IntegerField()
    today_sessions_goal      = serializers.IntegerField()
    today_completion_percent = serializers.IntegerField()
    overall_accuracy         = serializers.FloatField()
    avg_session_minutes      = serializers.FloatField()
    total_sessions           = serializers.IntegerField()
    recent_sessions          = TrainingSessionListSerializer(many=True)

