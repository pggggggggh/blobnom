import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";
import {HexComponent} from "../../components/HexComponent.tsx";
import {Box, Text} from "@mantine/core";
import LegendComponent from "../../components/LegendComponent.tsx";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
})

function RouteComponent() {
    const {roomId} = Route.useParams()
    const {data: roomDetail, isLoading, error} = useRoomDetail(parseInt(roomId));
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        if (!roomDetail || !roomDetail.ends_at) return;

        const updateTimer = () => {
            const now = dayjs();
            const end = dayjs(roomDetail.ends_at);
            const diff = end.diff(now, 'second');

            if (diff <= 0) {
                setTimeLeft("00:00:00");
            } else {
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = diff % 60;
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        updateTimer(); // 초기값 설정
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
    }, [roomDetail]);

    if (isLoading || error || !roomDetail) return (<div></div>);
    console.log(roomDetail);

    return (
        <Box className="relative">
            <Box className="absolute ">
                <Text className="text-5xl font-extrabold text-zinc-50">{roomDetail.name}</Text>
                <Text className="text-2xl font-extrabold text-zinc-50">{timeLeft}</Text>
            </Box>
            <HexComponent missions={roomDetail.mission_info}/>
            <LegendComponent players={roomDetail.player_info}/>
        </Box>
    );
}
