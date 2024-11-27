import {api} from "./instance.tsx";
import {RoomInfo} from "../types/roomInfo.tsx";

const fetchRooms = async (): Promise<RoomInfo[]> => {
    const response = await api.get('/');
    console.log(response)
    return response.data;
};

export default fetchRooms;