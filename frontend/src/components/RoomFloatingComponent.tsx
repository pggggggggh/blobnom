import {Box, Button, Text} from "@mantine/core";
import {RoomDetail} from "../types/RoomDetail.tsx";
import {userColorsBg} from "../constants/UserColorsFill.tsx";
import RoomJoinModal from "./Modals/RoomJoinModal.tsx";
import {modals} from "@mantine/modals";
import {useEffect, useState} from "react";
import {getDiffTime} from "../utils.tsx";
import dayjs from "dayjs";

const RoomFloatingComponent = ({roomDetail}: { roomDetail: RoomDetail }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [timeBefore, setTimeBefore] = useState<string>("");

    useEffect(() => {
        if (!roomDetail) return;

        const startInterval = setInterval(() => setTimeBefore(getDiffTime(new Date(roomDetail.starts_at))), 1000);
        if (roomDetail.is_started) {
            clearInterval(startInterval);
            setTimeLeft(getDiffTime(new Date(roomDetail.ends_at)))
            setInterval(() => setTimeLeft(getDiffTime(new Date(roomDetail.ends_at))), 1000);
        } else {
            setTimeBefore(getDiffTime(new Date(roomDetail.starts_at)))
        }
    }, [roomDetail]);

    return (
        <>
            <Box className="absolute ">
                <Text className="text-3xl font-extralight text-zinc-50 ">{roomDetail.name}</Text>
                <Text className="text-lg font-extralight text-zinc-50">
                    {roomDetail.is_started
                        ? timeLeft
                        : `${dayjs(roomDetail.starts_at).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(roomDetail.ends_at).format('YYYY-MM-DD HH:mm')}, ${roomDetail.num_missions}문항`}
                </Text>
            </Box>

            {!roomDetail.is_started &&
                <Box
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <Text className="text-5xl font-extrabold">
                        {timeBefore}
                    </Text>
                </Box>
            }

            {roomDetail.mode_type === "land_grab_solo" &&
                <div
                    className="p-2 fixed bottom-4 left-4">
                    <Button
                        onClick={() => {
                            modals.open({
                                title: "입장하기",
                                children: <RoomJoinModal roomId={roomDetail.id} is_private={roomDetail.is_private}/>
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
                                    <span
                                        className={team.users.length > 1 && user.indiv_solved_cnt > 0 && idx === 0 ? "font-bold" : ""}>
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