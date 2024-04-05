"""
ASGI config for djangoMetropoly project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""
import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter

from django.core.asgi import get_asgi_application
from django.urls import path

from metropoly.consumers import MovesConsumer


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoMetropoly.settings')

DJANGO_ASGI_APP = get_asgi_application()

application = ProtocolTypeRouter({
    'http': DJANGO_ASGI_APP,
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('ws', MovesConsumer.as_asgi())
        ])
    )
})
