import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";
import {HexComponent} from "../../components/HexComponent.tsx";
import {Box, Text} from "@mantine/core";
import LegendComponent from "../../components/LegendComponent.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
})

function RouteComponent() {
    const {roomId} = Route.useParams()
    const {data: roomDetail, isLoading, error} = useRoomDetail(parseInt(roomId));
    if (isLoading || error || !roomDetail) return (<div></div>);
    console.log(roomDetail)
    return (
        <Box className="relative">
            <Box className="absolute ">
                <Text className="text-5xl font-extrabold text-zinc-50">{roomDetail.name}</Text>
                <Text className="text-2xl font-extrabold text-zinc-50">23:02:45</Text>
            </Box>
            <HexComponent missions={roomDetail.mission_info}/>
            <LegendComponent players={roomDetail.player_info}/>
        </Box>
    );
}
