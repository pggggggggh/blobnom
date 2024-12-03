import {Box, Button, Text} from "@mantine/core";
import {RoomDetail} from "../types/RoomDetail.tsx";
import {userColorsBg} from "../constants/UserColorsFill.tsx";
import RoomJoinModal from "./Modals/RoomJoinModal.tsx";
import {modals} from "@mantine/modals";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

const RoomFloatingComponent = ({roomDetail}: { roomDetail: RoomDetail }) => {
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

    return (
        <>
            <Box className="absolute ">
                <Text className="text-5xl font-extrabold text-zinc-50">{roomDetail.name}</Text>
                <Text className="text-2xl font-extrabold text-zinc-50">{timeLeft}</Text>
            </Box>

            {!roomDetail.is_private && roomDetail.mode_type === "land_grab_solo" &&
                <div
                    className="p-2 fixed bottom-4 left-4">
                    <Button
                        onClick={() => {
                            modals.open({
                                title: "입장하기",
                                children: <RoomJoinModal roomId={roomDetail.id}/>
                            });
                        }}
                    >
                        참가하기
                    </Button>
                </div>
            }

            <div
                className="p-2 fixed bottom-4 right-4 bg-zinc-900 opacity-75 text-white shadow-lg rounded-sm max-h-100 overflow-y-auto z-0">
                {roomDetail.team_info.map((team, i) => {
                    return (
                        <Box key={i} className="flex items-center gap-2">
                            <Box className={`${userColorsBg[team.team_index]} w-4 h-4 rounded-sm`}></Box>
                            <Text className="font-light">
                                {team.users
                                    .map((user, idx) => (
                                        <span key={user.name}>
                                    <span className={idx === 0 ? "font-bold" : ""}>
                                        {user.name}
                                    </span>
                                            {team.users.length > 1 && `(${user.indiv_solved_cnt})`}
                                            {idx < team.users.length - 1 && ", "}
                                </span>
                                    ))}
                                &nbsp;: <span
                                className="font-bold">{team.adjacent_solved_count}</span> ({team.total_solved_count})
                            </Text>
                        </Box>
                    );
                })}
            </div>
        </>);
}

export default RoomFloatingComponent;