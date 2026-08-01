
import logging
import jwt
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
 
logger = logging.getLogger(__name__)
 
@database_sync_to_async
def get_user_from_token(token_str: str):
    from apps.accounts.models import User
    try:
        try:
            decoded = jwt.decode(token_str, options={"verify_signature": False})
            logger.info(f"WS token decoded payload (no verify): {decoded}")
            logger.info(f"token_type={decoded.get('token_type')} exp={decoded.get('exp')} user_id={decoded.get('user_id')}")
        except Exception as decode_exc:
            decoded = {"error": str(decode_exc)}
            logger.warning(f"WS token decode failed (no verify): {decode_exc}")

        token = AccessToken(token_str)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except Exception as exc:
        logger.warning(f"WS auth token parsing failed: {exc.__class__.__name__}: {exc}")
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
            token_value = token_list[0]
            logger.info(f"WS auth token received: {token_value[:20]}... (length {len(token_value)})")
            scope['user'] = await get_user_from_token(token_value)
            logger.info(f"WS auth user: {scope['user']} ({type(scope['user']).__name__})")
        else:
            logger.warning("WS auth missing token in query string")
            scope['user'] = AnonymousUser()
 
        return await super().__call__(scope, receive, send)
 
