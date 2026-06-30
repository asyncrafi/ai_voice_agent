from django.db import models
from apps.accounts.models import User


class PolicyDocument(models.Model):
    PDF      = 'pdf'
    DOCX     = 'docx'
    TXT      = 'txt'
    FILE_TYPE_CHOICES = [(PDF, 'PDF'), (DOCX, 'Docs'), (TXT, 'TXT')]

    ACTIVE      = 'active'
    IN_PROGRESS = 'in_progress'
    CANCELED    = 'canceled'
    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (IN_PROGRESS, 'In Progress'),
        (CANCELED, 'Canceled'),
    ]

    name        = models.CharField(max_length=255)
    category    = models.CharField(max_length=100)
    tags        = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    file        = models.FileField(upload_to='policy_docs/')
    image       = models.ImageField(upload_to='policy_images/', blank=True, null=True)
    file_type   = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    file_size   = models.PositiveIntegerField(default=0)  # in bytes
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=IN_PROGRESS)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name