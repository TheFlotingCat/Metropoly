import json

from channels.generic.websocket import AsyncWebsocketConsumer

from metropoly.models import Player, User, Room

from asgiref.sync import sync_to_async, async_to_sync


class MovesConsumer(AsyncWebsocketConsumer):
    group = 'players'
    active_users = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def websocket_connect(self, event):
        await self.channel_layer.group_add(
            self.group,
            self.channel_name
        )
        self.active_users.append({
            'id': self.scope['user'].id,
            'username': self.scope['user'].username
        })

    @sync_to_async
    def websocket_receive(self, data: dict):
        print(data)
        message_text: dict = eval(data['text'])
        print(message_text)

        print(User.objects.all())
        print(Player.objects.all())

        user = User.objects.filter(username=message_text['username']).first()
        print(user.player.position, message_text['position'], int(message_text['position']))
        user.player.position = int(message_text['position'])
        user.player.save()

        async_to_sync(self.channel_layer.group_send)(self.group, {
            'text': 'message for all'
        })

    async def websocket_disconnect(self, event):
        pass
