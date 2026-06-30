from django.db import models
# Create your models here.



class AppSetting(models.Model):
    """App settings (Privacy, Terms, About, FAQ) - multilingual"""
    
    SETTINGS_TYPE_CHOICES = [
        ('privacy', 'Privacy Policy'),
        ('terms', 'Terms of Service'),
        ('about_us', 'About Us'),
        ('faq', 'FAQ'),
    ]

    content = models.TextField(blank=True, help_text="Content of the setting (HTML allowed)") 
    
    settings_type = models.CharField(max_length=20, choices=SETTINGS_TYPE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'settings'
        verbose_name = 'Setting'
        verbose_name_plural = 'Settings'
    
    def __str__(self):
        return self.get_settings_type_display()