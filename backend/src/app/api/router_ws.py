from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.app.core.utils.connection_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/rooms/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            print(data)
            await manager.send_personal_message(f"You wrote: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(f"Client left the room {room_id}", room_id)
