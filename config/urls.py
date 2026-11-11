from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.views.static import serve
from django.urls import re_path
from apps.core.views import public_privacy_policy_view, public_terms_conditions_view


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response(
        {
            "status": "healthy",
            "timestamp": timezone.now().isoformat(),
            "service": "peakagent-api",
        },
        status=status.HTTP_200_OK,
    )


urlpatterns = [
    # Public HTML Legal Pages (Google Play Store & Apple App Store compliance)
    path('privacy-policy/', public_privacy_policy_view, name='web-privacy-policy'),
    path('terms/', public_terms_conditions_view, name='web-terms'),
    path('legal/privacy/', public_privacy_policy_view, name='web-privacy-policy-alt'),
    path('legal/terms/', public_terms_conditions_view, name='web-terms-alt'),

    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/training/', include('apps.training.urls')),
    path('api/policy/', include('apps.docpolicy.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/admin/', include('apps.dashboard.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Serve user media uploads (avatars, audio sessions, policies)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
