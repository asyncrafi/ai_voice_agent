from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.core.utils.mixins import BaseResponseMixin
from .models import AppSetting
from .serializers import AppSettingSerializer

class SiteContentView(BaseResponseMixin, APIView):
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'POST', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, settings_type):
        setting, created = AppSetting.objects.get_or_create(
            settings_type=settings_type,
            defaults={'content': ''}
        )
        serializer = AppSettingSerializer(setting)
        return self.success_response(data=serializer.data)

    def patch(self, request, settings_type):
        if not request.user.is_staff:
            return self.error_response(message="Admin only.", status_code=status.HTTP_403_FORBIDDEN)
        setting, created = AppSetting.objects.get_or_create(
            settings_type=settings_type,
            defaults={'content': ''}
        )
        serializer = AppSettingSerializer(setting, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.success_response(data=serializer.data, message=f"{settings_type.replace('_', ' ').title()} updated.")
