from django.shortcuts import render
from django.http import HttpRequest, HttpResponse

from metropoly.models import Player, User, Room


def user_creating_page(request: HttpRequest) -> HttpResponse:
    return render(request, 'create_user.html')


def create_user(request: HttpRequest) -> HttpResponse:
    request_body: dict = eval(request.body.decode('utf-8'))
    username = request_body['username']

    room = Room()
    room.save()

    user = User(username=username)
    user.save()

    new_user = Player(user=user, position=1, current_game=room)
    new_user.save()

    return HttpResponse({'text': f'user {username} created'})


def home(request: HttpRequest) -> HttpResponse:
    players = Player.objects.all()
    return render(request, 'game_positioning_sample.html', {'players': players})
