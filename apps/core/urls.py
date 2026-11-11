from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Dedicated Mobile / Client APIs
    path('privacy-policy/', views.PrivacyPolicyApiView.as_view(), name='privacy-policy-api'),
    path('terms/', views.TermsConditionsApiView.as_view(), name='terms-api'),
    
    # Generic settings endpoint
    path('site-content/<str:settings_type>/', views.SiteContentView.as_view(), name='site-content'),
]
