from django.urls import path

from . import views


urlpatterns = [
    path('', views.home),
    path('create_user/', views.user_creating_page),
    path('create_user/create', views.create_user)
]
