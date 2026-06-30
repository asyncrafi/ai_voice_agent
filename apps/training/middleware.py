
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
 
 
@database_sync_to_async
def get_user_from_token(token_str: str):
    from apps.accounts.models import User
    try:
        token   = AccessToken(token_str)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
        return AnonymousUser()
 
 
class JWTAuthMiddleware(BaseMiddleware):
    """
    Attach user to scope from JWT token.
    Flutter should connect with:
      ws://domain/ws/training/chat/<session_id>/?token=<access_token>
    """
 
    async def __call__(self, scope, receive, send):
        from urllib.parse import parse_qs
        query_string = scope.get('query_string', b'').decode()
        params       = parse_qs(query_string)
        token_list   = params.get('token', [])
 
        if token_list:
            scope['user'] = await get_user_from_token(token_list[0])
        else:
            scope['user'] = AnonymousUser()
 
        return await super().__call__(scope, receive, send)
 
