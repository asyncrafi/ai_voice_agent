import os
from rest_framework import serializers
from .models import PolicyDocument


class PolicyDocumentSerializer(serializers.ModelSerializer):
    file_size_display = serializers.SerializerMethodField()
    file_type         = serializers.CharField(read_only=True)  # auto-detected on save

    class Meta:
        model  = PolicyDocument
        fields = [
            'id', 'name', 'category', 'tags', 'description',
            'file', 'image', 'file_type', 'file_size',
            'file_size_display', 'status', 'upload_date', 'updated_at',
        ]
        read_only_fields = ['id', 'file_type', 'file_size', 'upload_date', 'updated_at', 'status']

    def get_file_size_display(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 ** 2:
            return f"{size / 1024:.1f} KB"
        return f"{size / (1024 ** 2):.1f} MB"

    def create(self, validated_data):
        file      = validated_data.get('file')
        ext       = os.path.splitext(file.name)[1].lower()
        type_map  = {'.pdf': 'pdf', '.docx': 'docx', '.doc': 'docx', '.txt': 'txt'}
        validated_data['file_type'] = type_map.get(ext, 'pdf')
        validated_data['file_size'] = file.size
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class PolicyDocumentListSerializer(serializers.ModelSerializer):
    """Lightweight for table view."""
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model  = PolicyDocument
        fields = [
            'id', 'name', 'category', 'file_type',
            'file_size_display', 'status', 'upload_date',
        ]

    def get_file_size_display(self, obj):
        size = obj.file_size
        if size < 1024 ** 2:
            return f"{size / 1024:.1f} KB"
        return f"{size / (1024 ** 2):.1f} MB"
