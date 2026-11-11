import random
import datetime

from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.utils.mixins import BaseResponseMixin
from apps.accounts.tasks import (
    send_password_reset_email_task,
    send_otp_email_task,
    send_welcome_email_task,
)
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    ChangePasswordSerializer,
    CreateNewPasswordSerializer,
    UserSerializer,
    DeleteAccountSerializer,
    SocialLoginSerializer,
)
from .models import OTPVerification

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(BaseResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if email:
            try:
                user = User.objects.get(email=email)
                if user.is_verified:
                    return self.success_response(
                        data={
                            'email': email,
                            'is_sent': False,
                        },
                        message='User with this email already exists and is verified.',
                        status_code=status.HTTP_200_OK,
                    )
                else:
                    serializer = RegisterSerializer()
                    code = serializer.send_verification_otp(user)
                    return self.success_response(
                        data={
                            'email': email,
                            'is_sent': True,
                            'otp_code': code,
                        },
                        message='User not verified. New OTP sent.',
                        status_code=status.HTTP_200_OK,
                    )
            except User.DoesNotExist:
                pass

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        last_otp = user.otps.filter(
            purpose=OTPVerification.PURPOSE_VERIFICATION, is_used=False,
        ).order_by('-created_at').first()
        code = last_otp.code if last_otp else None

        return self.created_response(
            data={
                'user': UserSerializer(user, context={'request': request}).data,
                'otp_code': code,
                'is_sent': True,
            },
            message='Registration successful. Please verify your email with the OTP code.',
        )


class LoginView(BaseResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if not user:
            return self.error_response(
                message="Invalid credentials.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data
        data = {
            'user': user_data,
            'tokens': tokens,
        }
        return self.success_response(
            data=data,
            message="Login successful.",
        )


class SocialLoginView(BaseResponseMixin, APIView):
    """
    Instant social login / registration endpoint (Google, Apple, etc.).
    Takes email (and optional full_name / phone).
    Automatically creates the user if they do not exist yet (is_verified=True),
    or retrieves the existing user.
    Instantly returns user profile and JWT access & refresh tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SocialLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].strip().lower()
        full_name = serializer.validated_data.get('full_name', '').strip()
        phone = serializer.validated_data.get('phone', '').strip()

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'full_name': full_name or None,
                'phone': phone or None,
                'is_verified': True,
                'is_active': True,
            }
        )

        if created:
            user.set_unusable_password()
            user.save()
            try:
                send_welcome_email_task.delay(
                    user_id=user.id,
                    email=user.email,
                    full_name=user.full_name or user.email,
                )
            except Exception:
                pass
        else:
            updated = False
            if full_name and not user.full_name:
                user.full_name = full_name
                updated = True
            if phone and not user.phone:
                user.phone = phone
                updated = True
            if not user.is_verified:
                user.is_verified = True
                updated = True
            if not user.is_active:
                user.is_active = True
                updated = True
            if updated:
                user.save()

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data

        return self.success_response(
            data={
                'user': user_data,
                'tokens': tokens,
                'is_new_user': created,
            },
            message="Account created and logged in successfully." if created else "Login successful.",
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )



class LogoutView(BaseResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
        if not refresh_token:
            return self.bad_request_response(message="Refresh token is required.")
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return self.bad_request_response(message=str(e))
        return self.success_response(message="Logged out successfully.")


class OTPRequestView(BaseResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        purpose = serializer.validated_data.get('purpose')
        if not purpose:
            if 'forgot-password' in request.path:
                purpose = OTPVerification.PURPOSE_PASSWORD_RESET
            else:
                purpose = OTPVerification.PURPOSE_VERIFICATION
        user = get_object_or_404(User, email=email)
        code = str(random.randint(100000, 999999))
        OTPVerification.objects.create(
            user=user,
            code=code,
            purpose=purpose,
            expires_at=timezone.now() + datetime.timedelta(minutes=10),
        )
        full_name = getattr(user, 'full_name', '') or user.email
        if purpose == OTPVerification.PURPOSE_PASSWORD_RESET:
            send_password_reset_email_task.delay(email=user.email, code=code, full_name=full_name)
        else:
            send_otp_email_task.delay(email=user.email, code=code, full_name=full_name)

        return self.success_response(data={'otp_code': code}, message="OTP sent successfully.")


class OTPVerifyView(BaseResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        user = get_object_or_404(User, email=email)
        otp = OTPVerification.objects.filter(
            user=user, code=code, purpose=OTPVerification.PURPOSE_VERIFICATION,
            is_used=False, expires_at__gte=timezone.now()
        ).order_by('-created_at').first()
        if not otp:
            return self.error_response(message="Invalid or expired OTP.")
        otp.is_used = True
        otp.save()
        user.is_verified = True
        user.save()
        try:
            send_welcome_email_task.delay(
                user_id=user.id,
                email=user.email,
                full_name=getattr(user, 'full_name', '') or user.email,
            )
        except Exception:
            pass
        tokens = get_tokens_for_user(user)
        data = {'tokens': tokens}
        return self.success_response(
            data=data,
            message="Email verified successfully.",
        )


class ChangePasswordView(BaseResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return self.error_response(message="Old password is incorrect.")
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return self.success_response(message="Password changed successfully.")


class CreateNewPasswordView(BaseResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateNewPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['otp']
        user = get_object_or_404(User, email=email)
        otp = OTPVerification.objects.filter(
            user=user, code=code, purpose=OTPVerification.PURPOSE_PASSWORD_RESET,
            is_used=False, expires_at__gte=timezone.now()
        ).order_by('-created_at').first()
        if not otp:
            return self.error_response(message="Invalid or expired OTP.")
        otp.is_used = True
        otp.save()
        user.set_password(serializer.validated_data['password'])
        user.save()
        return self.success_response(message="Password reset successful.")


class UserProfileView(BaseResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserSerializer(request.user, context={'request': request}).data
        return self.success_response(data=data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.updated_response(data=serializer.data)


class LanguageUpdateView(BaseResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        lang = request.data.get('language')
        if not lang:
            return self.bad_request_response(message="Language field is required.")
        request.user.language = lang
        request.user.save()
        return self.success_response(message="Language updated successfully.")


class DeleteAccountView(BaseResponseMixin, APIView):
    """
    Deletes the authenticated user's account and all associated personal data.
    Required by Apple App Store Guideline 5.1.1(v) & Google Play Store User Data Policy.
    Accepts POST or DELETE.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return self._delete_account(request)

    def delete(self, request):
        return self._delete_account(request)

    def _delete_account(self, request):
        user = request.user
        email = user.email

        # If user has an avatar file on disk, remove it
        if getattr(user, 'avatar', None):
            try:
                user.avatar.delete(save=False)
            except Exception:
                pass

        # Blacklist tokens if blacklist app is available
        try:
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            pass

        # Delete user record (cascades related otps, custom scripts, training sessions, etc.)
        user.delete()

        return self.success_response(
            message=f"Account and all associated personal data for {email} have been permanently deleted.",
            data={"deleted": True, "email": email}
        )

