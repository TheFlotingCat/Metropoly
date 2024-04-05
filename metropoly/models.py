from django.db import models
from django.contrib.auth.models import User


class Room(models.Model):
    pass


class Player(models.Model):
    position = models.IntegerField()
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    current_game = models.ForeignKey(Room, on_delete=models.CASCADE)
