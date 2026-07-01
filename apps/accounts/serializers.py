import random
import datetime
import uuid

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from .models import OTPVerification

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    retype_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'full_name',
            'email', 'password', 'retype_password',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['retype_password']:
            raise serializers.ValidationError(
                {'password': "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('retype_password')
        password = validated_data.pop('password')
        validated_data.setdefault('username', validated_data.get('email', str(uuid.uuid4())))
        user = User(**validated_data)
        user.is_verified = False
        user.set_password(password)
        user.save()
        
        self.send_verification_otp(user)
        return user

    def send_verification_otp(self, user):
        code = str(random.randint(100000, 999999))
        OTPVerification.objects.create(
            user=user,
            code=code,
            purpose=OTPVerification.PURPOSE_VERIFICATION,
            expires_at=timezone.now() + datetime.timedelta(minutes=10),
        )
        return code


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(
        choices=['verification', 'password_reset'], required=False
    )


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


class CreateNewPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    password = serializers.CharField(write_only=True, min_length=8)
    retype_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['retype_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'phone',
            'email', 'avatar',
            'is_verified', 'language', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            request = self.context.get('request')
            if request:
                data['avatar'] = request.build_absolute_uri(instance.avatar.url)
        return data
