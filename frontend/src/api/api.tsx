import {RoomListDTO} from "../types/roomInfo.tsx";
import {api} from "./instance.tsx";

const fetchRooms = async (): Promise<RoomListDTO> => {
    const response = await api.get('/');
    console.log(response)
    return response.data;
};

export default fetchRooms;