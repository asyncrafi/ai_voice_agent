from rest_framework import serializers
from .models import AppSetting


class AppSettingSerializer(serializers.ModelSerializer):
    settings_type_display = serializers.CharField(
        source='get_settings_type_display', read_only=True
    )

    class Meta:
        model = AppSetting
        fields = [
            'id',
            'settings_type',
            'settings_type_display',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']