from typing import List, Dict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        self.active_connections[room_id].remove(websocket)
        if not self.active_connections[room_id]:
            del self.active_connections[room_id]

    async def send_personal_message(self, message: any, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: Dict[str, str], room_id: int):
        print(self.active_connections)
        if room_id in self.active_connections:
            print(message)
            for connection in self.active_connections[room_id]:
                await connection.send_json(message)
