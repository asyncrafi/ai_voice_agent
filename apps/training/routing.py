from django.urls import re_path
from . import consumers
 
websocket_urlpatterns = [
    re_path(
        r'ws/training/chat/(?P<session_id>\d+)/$',
        consumers.TrainingChatConsumer.as_asgi()
    ),
]
