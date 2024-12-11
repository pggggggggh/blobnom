import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";
import {Box} from "@mantine/core";
import {HexComponent} from "../../components/HexComponent.tsx";
import RoomFloatingComponent from "../../components/RoomFloatingComponent.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
})

function RouteComponent() {
    const {roomId} = Route.useParams()
    const {data: roomDetail, isLoading, error} = useRoomDetail(parseInt(roomId));


    if (isLoading || error || !roomDetail) return (<div></div>);
    console.log(roomDetail);

    return (
        <Box className="relative">
            <RoomFloatingComponent roomDetail={roomDetail}/>
            <HexComponent roomDetail={roomDetail}/>


        </Box>
    );
}
