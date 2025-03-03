from typing import Annotated

from fastapi.requests import Request
from fastapi import FastAPI, WebSocket, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from api_classes import User, RoomManager, Room, RoomInit

import uvicorn

from sqlalchemy.orm import sessionmaker

from database_init import engine, Users, Rooms, Tokens

from uuid import uuid4

from json import *


app = FastAPI()

app.mount('/static', StaticFiles(directory='static', html=True), name='static')

session = sessionmaker(bind=engine)()

manager = RoomManager()


@app.get("/")
async def index_page():
    return FileResponse('static/html/index.html')


@app.get("/about")
async def description_page():
    return FileResponse('static/html/description.html')


@app.get("/signup")
async def signup_page():
    return FileResponse('static/html/signup.html')


@app.post("/signup/create")
async def signup(user: User):
    result = session.query(Users).filter(Users.name == user.username).all()

    if result:
        return JSONResponse({'info': 'User already present error.', 'created': 0})

    new_user: Users = Users(
        name=user.username,
        password=user.password
    )
    session.add(new_user)
    session.commit()

    return JSONResponse({'info': f'User {user.username} created.', 'created': 1})


@app.get("/signin")
async def signin_page():
    return FileResponse('static/html/signin.html')


@app.post("/signin/check")
async def signin(user: User):
    result = session.query(Users).filter(Users.name == user.username).all()

    if not result:
        return JSONResponse({'info': f'User {user.username} is not registered, cannot sign in.',
                             'present': 0})

    found_user = result[0]

    if user.password != found_user.password:
        return JSONResponse({'info': 'Wrong password.', 'password': 0})

    token = uuid4().hex

    found_user.token = Tokens(token=token, user_id=found_user.id)
    session.add(found_user)
    session.commit()

    return JSONResponse({'info': 'Token created.', 'token': token})


@app.get("/game/create_room")
async def create_room_page():
    return FileResponse('static/html/create_room.html')


@app.post("/game/create_room/create")
async def create_room(room: RoomInit, token: Annotated[str | None, Header()] = None):
    result = session.query(Tokens).filter(Tokens.token == token).all()

    if not result:
        return JSONResponse({'info': 'You are not signed in.'})

    new_room: Rooms = Rooms(password=room.password,
                            max_players=room.max_players)

    session.add(new_room)
    session.commit()

    new_room_id = new_room.id
    room_websocket_address = f'ws://127.0.0.1:8000/ws/{new_room_id}'

    new_room.websocket_address = room_websocket_address

    session.commit()

    await manager.add_room(new_room_id)

    return JSONResponse({'room_id': new_room_id, 'room_password': room.password})


@app.get("/game/connect_to_room")
async def connect_to_game_page():
    return FileResponse('static/html/join.html')


@app.post("/game/connect")
async def connect_to_game(room: Room, token: Annotated[str | None, Header()] = None):
    result_users = session.query(Tokens).filter(Tokens.token == token).all()

    if not result_users:
        return JSONResponse({'info': 'You are not signed in.', 'user': 0})

    result_rooms = session.query(Rooms).filter(Rooms.id == room.id).all()

    if not result_rooms:
        return JSONResponse({'info': 'No such room', 'room': 0})

    found_room = result_rooms[0]

    if room.password != found_room.password:
        return JSONResponse({'info': 'Wrong password for the room', 'password': 0})

    if found_room.amount_of_players == found_room.max_players:
        return JSONResponse({'info': 'Room is already full', 'full': 1})

    found_user = result_users[0].user

    if found_user.current_game_id != found_room.id:
        found_user.current_game_id = found_room.id
        found_user.amount_of_played_games += 1
        found_room.amount_of_players += 1

        session.commit()

    return JSONResponse({'info': 'You were added to the game', 'link': found_room.websocket_address})


@app.websocket("/ws/{room_id}")
async def handle_websocket_connection(websocket: WebSocket, room_id):
    room_id = int(room_id)

    await manager.connect(websocket, room_id)

    result = session.query(Rooms).filter(Rooms.id == room_id).all()

    if not result:
        return JSONResponse({'info': 'No such room'})

    found_room = result[0]

    users_in_game = session.query(Users).filter(Users.current_game_id == room_id).all()

    print(manager.current_number_of_players(room_id))
    print(found_room.max_players)

    if manager.current_number_of_players(room_id) == found_room.max_players:
        await manager.broadcast({"type": "start_game",
                                 "content": [{'name': user.name} for user in users_in_game]}, room_id)

    while True:
        data = await websocket.receive_json()

        await manager.broadcast_excluding_one(data, websocket, room_id)


@app.get("/game/game")
def game_page():
    return FileResponse('static/html/room.html')


@app.get("/profile/")
async def profile_page():
    return FileResponse("static/html/profile.html")


@app.get("/game/lose")
async def lose_page():
    return FileResponse("static/html/lose.html")


@app.get("/game/win")
async def win_page():
    return FileResponse("static/html/win.html")


# @app.get("/game/field/colors")
# async def stations_colors():
#     file = open("D:/проекты Python new VS/html\metropoly\кирилл/fastApiMetropoly (4)/fastApiMetropoly\static\json\stations_info.json", "r")
#     dump(file)
#     # return JSONResponse(load(file))
#     return JSONResponse({})
#     # return FileResponse("static/")


@app.post("/profile/get")
async def profile_info(token: Annotated[str | None, Header()] = None) -> JSONResponse:
    result = session.query(Tokens).filter(Tokens.token == token).all()

    if not result:
        return JSONResponse({'info': 'No such user'})

    user = result[0].user

    return JSONResponse({'user_name': user.name, 'played_games': user.amount_of_played_games})


@app.get("/connections/{room_id}")
async def function(room_id: int) -> JSONResponse:
    result = session.query(Rooms).filter(Rooms.id == room_id).all()

    found_room = result[0]

    return JSONResponse({"have": manager.current_number_of_players(room_id), "max": found_room.max_players})


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
