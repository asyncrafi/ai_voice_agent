from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.core.utils.mixins import BaseResponseMixin
from .models import AppSetting
from .serializers import AppSettingSerializer

DEFAULT_PRIVACY_POLICY = """
<h2>1. Information We Collect</h2>
<p>Peak Agent ("we", "our", or "us") provides AI-powered training, voice practice, and agent coaching tools. To provide our services, we may collect:</p>
<ul>
  <li><strong>Account Information:</strong> Name, email address, password, phone number, and profile details provided during registration.</li>
  <li><strong>Training & Session Data:</strong> Transcripts of practice conversations, audio recordings, script selections, performance scores, and session duration.</li>
  <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, app version, and interaction telemetry.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the collected information for the following purposes:</p>
<ul>
  <li>To authenticate and manage your account.</li>
  <li>To deliver real-time AI prospect interactions and automated coaching feedback.</li>
  <li>To analyze your performance over time and generate progress dashboards.</li>
  <li>To ensure security, prevent fraud, and comply with legal requirements.</li>
  <li>To maintain and improve the reliability of our mobile and web applications.</li>
</ul>

<h2>3. Data Retention and Account Deletion</h2>
<p>You have full control over your data. You may request the deletion of your account and all associated data at any time directly through the Peak Agent mobile app settings or via our data deletion endpoint:</p>
<p><code>POST /api/auth/delete-account/</code></p>
<p>Upon request, your user account, custom practice scripts, training histories, audio sessions, and authentication tokens are permanently removed from our active databases.</p>

<h2>4. Third-Party Services</h2>
<p>We work with trusted third-party service providers for infrastructure, including AI inference engines (OpenAI), transactional email delivery (Brevo), and cloud hosting. These providers only process data as strictly necessary to operate our service.</p>

<h2>5. Security of Your Information</h2>
<p>We implement industry-standard encryption in transit (HTTPS / TLS 1.3) and at rest, alongside role-based access controls to safeguard your information against unauthorized access, alteration, or disclosure.</p>

<h2>6. Children's Privacy</h2>
<p>Our services are strictly intended for professional agents and are not directed to individuals under the age of 18.</p>

<h2>7. Changes to This Policy</h2>
<p>We may update this Privacy Policy periodically. We will notify you of material changes by updating the "Last updated" date above or via email notification.</p>

<h2>8. Contact Us</h2>
<p>If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at:</p>
<p><strong>Email:</strong> <a href="mailto:support@peak-agent.app">support@peak-agent.app</a><br>
<strong>Website:</strong> <a href="https://peak-agent.app">https://peak-agent.app</a></p>
"""

DEFAULT_TERMS_OF_SERVICE = """
<h2>1. Acceptance of Terms</h2>
<p>By downloading, installing, or accessing the Peak Agent mobile or web application, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the application.</p>

<h2>2. Description of Service</h2>
<p>Peak Agent provides an interactive AI voice training platform designed to assist sales and insurance agents in practicing phone and in-person presentation scripts, receiving automated feedback, and tracking performance metrics.</p>

<h2>3. User Accounts and Security</h2>
<p>To use our services, you must register for an account with a valid email address. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>

<h2>4. Acceptable Use Policy</h2>
<p>You agree not to:</p>
<ul>
  <li>Use the service for any unlawful, harassing, defamatory, or abusive purpose.</li>
  <li>Attempt to reverse-engineer, decompile, or tamper with our AI models or server infrastructure.</li>
  <li>Upload malicious files, viruses, or policy documents containing unauthorized proprietary information.</li>
  <li>Share account access with unauthorized third parties.</li>
</ul>

<h2>5. AI Content and Disclaimers</h2>
<p>Peak Agent uses advanced artificial intelligence to simulate prospect conversations and generate practice feedback. While designed to be educational, AI responses are for simulation purposes only and do not constitute legal, financial, or regulatory advice.</p>

<h2>6. Intellectual Property</h2>
<p>All software, brand marks, logos, interfaces, and proprietary training scripts provided by Peak Agent are the exclusive property of Peak Agent and its licensors. You retain ownership of custom scripts you author.</p>

<h2>7. Termination and Account Deletion</h2>
<p>We reserve the right to suspend or terminate accounts that violate these terms. You may terminate your account at any time by utilizing the in-app deletion feature or calling our delete-account API.</p>

<h2>8. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, Peak Agent shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>

<h2>9. Governing Law</h2>
<p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the company operates, without regard to conflict of law principles.</p>

<h2>10. Contact Us</h2>
<p>For inquiries regarding these Terms of Service, please contact:</p>
<p><strong>Email:</strong> <a href="mailto:support@peak-agent.app">support@peak-agent.app</a><br>
<strong>Website:</strong> <a href="https://peak-agent.app">https://peak-agent.app</a></p>
"""


class SiteContentView(BaseResponseMixin, APIView):
    """
    Generic API for site settings/content.
    GET is public (AllowAny).
    PATCH/PUT is restricted to Staff/Admin.
    """
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'POST', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, settings_type):
        defaults_map = {
            'privacy': (DEFAULT_PRIVACY_POLICY, 'Privacy Policy'),
            'terms': (DEFAULT_TERMS_OF_SERVICE, 'Terms and Conditions'),
        }
        default_content, default_title = defaults_map.get(settings_type, ('', ''))
        setting, _ = AppSetting.objects.get_or_create(
            settings_type=settings_type,
            defaults={'content': default_content, 'title': default_title}
        )
        if not setting.content and default_content:
            setting.content = default_content
            if not setting.title:
                setting.title = default_title
            setting.save()

        serializer = AppSettingSerializer(setting)
        return self.success_response(data=serializer.data)

    def patch(self, request, settings_type):
        if not request.user.is_staff:
            return self.error_response(message="Admin only.", status_code=status.HTTP_403_FORBIDDEN)
        setting, _ = AppSetting.objects.get_or_create(
            settings_type=settings_type,
            defaults={'content': ''}
        )
        serializer = AppSettingSerializer(setting, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.success_response(data=serializer.data, message=f"{settings_type.replace('_', ' ').title()} updated.")


class PrivacyPolicyApiView(BaseResponseMixin, APIView):
    """
    Public API returning Privacy Policy for mobile & web apps (Play Store / App Store compliant).
    GET /api/core/privacy-policy/
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get Privacy Policy",
        description="Public endpoint to fetch the application Privacy Policy for mobile/web clients.",
        responses={200: OpenApiResponse(description="Privacy policy details")}
    )
    def get(self, request):
        setting, _ = AppSetting.objects.get_or_create(
            settings_type='privacy',
            defaults={'content': ''}
        )
        content = setting.content.strip() if setting.content else ""
        return self.success_response(
            data={
                "title": setting.title or "Privacy Policy",
                "settings_type": "privacy",
                "content": content or DEFAULT_PRIVACY_POLICY,
                "is_custom": bool(content),
                "updated_at": setting.updated_at.isoformat(),
            }
        )


class TermsConditionsApiView(BaseResponseMixin, APIView):
    """
    Public API returning Terms & Conditions for mobile & web apps (Play Store / App Store compliant).
    GET /api/core/terms/
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get Terms and Conditions",
        description="Public endpoint to fetch Terms of Service / Conditions for mobile/web clients.",
        responses={200: OpenApiResponse(description="Terms and conditions details")}
    )
    def get(self, request):
        setting, _ = AppSetting.objects.get_or_create(
            settings_type='terms',
            defaults={'content': ''}
        )
        content = setting.content.strip() if setting.content else ""
        return self.success_response(
            data={
                "title": setting.title or "Terms and Conditions",
                "settings_type": "terms",
                "content": content or DEFAULT_TERMS_OF_SERVICE,
                "is_custom": bool(content),
                "updated_at": setting.updated_at.isoformat(),
            }
        )


def public_privacy_policy_view(request):
    """
    Public HTML web page for Privacy Policy (for App Store and Google Play URL requirements).
    """
    setting, _ = AppSetting.objects.get_or_create(
        settings_type='privacy',
        defaults={'content': ''}
    )
    return render(
        request,
        'legal/document.html',
        {
            'title': setting.title or 'Privacy Policy',
            'content': setting.content if setting.content and setting.content.strip() else None,
            'default_content': DEFAULT_PRIVACY_POLICY,
            'updated_at': setting.updated_at or timezone.now(),
        }
    )


def public_terms_conditions_view(request):
    """
    Public HTML web page for Terms & Conditions (for App Store and Google Play URL requirements).
    """
    setting, _ = AppSetting.objects.get_or_create(
        settings_type='terms',
        defaults={'content': ''}
    )
    return render(
        request,
        'legal/document.html',
        {
            'title': setting.title or 'Terms and Conditions',
            'content': setting.content if setting.content and setting.content.strip() else None,
            'default_content': DEFAULT_TERMS_OF_SERVICE,
            'updated_at': setting.updated_at or timezone.now(),
        }
    )
