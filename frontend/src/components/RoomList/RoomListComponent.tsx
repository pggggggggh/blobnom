import {Stack} from "@mantine/core";
import {RoomSummary} from "../../types/Summaries.tsx";
import {Dayjs} from "dayjs";
import RoomCard from "./RoomCard.tsx";

const RoomListComponent = ({rooms, cur_datetime}: { rooms: RoomSummary[], cur_datetime: Dayjs }) => {
    console.log(rooms)
    return (
        <Stack gap="sm">
            {rooms?.map((room) => {
                return (
                    !room.is_contest_room &&
                    <RoomCard roomSummary={room}/>
                );
            })}
        </Stack>
    );
};

export default RoomListComponent;
