from django.db import models
from apps.accounts.models import User


class TrainingScript(models.Model):
    """Admin creates/edits these. Agents can fork their own version."""
    EASY   = 'easy'
    MEDIUM = 'medium'
    HARD   = 'hard'
    DIFFICULTY_CHOICES = [(EASY, 'Easy'), (MEDIUM, 'Medium'), (HARD, 'Hard')]

    title       = models.CharField(max_length=255)
    category    = models.CharField(max_length=100)
    difficulty  = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    content     = models.TextField()  # the script/questions
    system_prompt = models.TextField()  # injected into OpenAI Realtime as AI persona
    image       = models.ImageField(upload_to='training/images/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_default  = models.BooleanField(default=False)
    created_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.difficulty})"


class AgentScript(models.Model):
    """Agent's personal copy/customization of a TrainingScript."""
    agent       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_scripts')
    base_script = models.ForeignKey(TrainingScript, on_delete=models.SET_NULL, null=True, blank=True)
    title       = models.CharField(max_length=255)
    content     = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)


class TrainingSession(models.Model):
    ACTIVE      = 'active'
    IN_PROGRESS = 'in_progress'
    COMPLETED   = 'completed'
    CANCELED    = 'canceled'
    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELED, 'Canceled'),
    ]

    agent           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    script          = models.ForeignKey(TrainingScript, on_delete=models.SET_NULL, null=True)
    difficulty      = models.CharField(max_length=10, choices=TrainingScript.DIFFICULTY_CHOICES)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default=IN_PROGRESS)
    transcript      = models.JSONField(default=list, blank=True)  # store conversation turns
    duration_seconds= models.PositiveIntegerField(default=0)
    questions_asked = models.PositiveIntegerField(default=0)
    performance_score = models.FloatField(null=True, blank=True)  # 0-100
    openai_session_id = models.CharField(max_length=255, blank=True)  # from Realtime API
    started_at      = models.DateTimeField(auto_now_add=True)
    ended_at        = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.agent.full_name} - {self.difficulty} - {self.status}"