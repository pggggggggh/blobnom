import {RoomInfoDTO} from "../types/roomInfo.tsx";
import {api} from "./instance.tsx";

const fetchRooms = async (): Promise<RoomInfoDTO> => {
    const response = await api.get('/');
    console.log(response)
    return response.data;
};

export default fetchRooms;