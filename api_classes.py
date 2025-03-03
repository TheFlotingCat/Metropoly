from pydantic import BaseModel
from fastapi import WebSocket


class User(BaseModel):
    username: str
    password: str


class RoomManager:
    active_rooms: dict[int, list[WebSocket]]

    def __init__(self):
        self.active_rooms = {}

    async def add_room(self, room_id: int):
        self.active_rooms[room_id] = []

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        self.active_rooms[room_id].append(websocket)

    async def disconnect(self, websocket: WebSocket, room_id: int):
        self.active_rooms[room_id].remove(websocket)

    async def send_personal_message(self, message, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message, room_id: int):
        for connection in self.active_rooms[room_id]:
            await connection.send_json(message)

    async def broadcast_excluding_one(self, message, excluded_websocket: WebSocket, room_id: int):
        for connection in self.active_rooms[room_id]:
            if connection is not excluded_websocket:
                await connection.send_json(message)

    def current_number_of_players(self, room_id: int):
        try:
            number_of_players = len(self.active_rooms[room_id])
            return number_of_players
        except KeyError:
            return -1


class RoomInit(BaseModel):
    password: str
    max_players: int


class Room(BaseModel):
    password: str
    id: int
