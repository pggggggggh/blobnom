from src.app.api.sockets import sio


def get_sids_in_room(room_id):
    if "/" not in sio.manager.rooms:
        return []
    return list(sio.manager.rooms['/'].get(f"room_{room_id}", set()))
