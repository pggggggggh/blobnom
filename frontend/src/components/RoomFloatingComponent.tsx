import {ActionIcon, Box, Button, Text} from "@mantine/core";
import {RoomDetail} from "../types/RoomDetail.tsx";
import RoomJoinModal from "./Modals/RoomJoinModal.tsx";
import {modals} from "@mantine/modals";
import {useEffect, useState} from "react";
import {getDiffTime} from "../utils/TimeUtils.tsx";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import RoomDeleteModal from "./Modals/RemoveModal.tsx";
import {userColors} from "../constants/UserColorsFill.tsx";
import {useAuth} from "../context/AuthProvider.tsx";
import TeamStatusBox from "./TeamStatusBox.tsx";


const RoomFloatingComponent = ({roomDetail}: { roomDetail: RoomDetail }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [timeBefore, setTimeBefore] = useState<string>("");
    const auth = useAuth()

    useEffect(() => {
        if (!roomDetail) return;

        const startInterval = setInterval(() => setTimeBefore(getDiffTime(new Date(), new Date(roomDetail.starts_at))), 1000);
        if (roomDetail.is_started) {
            clearInterval(startInterval);
            setTimeLeft(getDiffTime(new Date(), new Date(roomDetail.ends_at)))
            setInterval(() => setTimeLeft(getDiffTime(new Date(), new Date(roomDetail.ends_at))), 1000);
        } else {
            setTimeBefore(getDiffTime(new Date(), new Date(roomDetail.starts_at)))
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
                {
                    (auth && auth.user === roomDetail.owner) ?
                        (
                            <ActionIcon mt="5" variant="transparent" color="white"
                                        onClick={() => {
                                            modals.open({
                                                title: "방 삭제하기",
                                                children: <RoomDeleteModal roomId={roomDetail.id} needPassword={false}/>
                                            });
                                        }}>
                                <DeleteIcon/>
                            </ActionIcon>
                        ) :
                        (
                            !roomDetail.is_owner_a_member && <ActionIcon mt="5" variant="transparent" color="white"
                                                                         onClick={() => {
                                                                             modals.open({
                                                                                 title: "방 삭제하기",
                                                                                 children: <RoomDeleteModal
                                                                                     roomId={roomDetail.id}
                                                                                     needPassword={true}/>
                                                                             });
                                                                         }}>
                                <DeleteIcon/>
                            </ActionIcon>
                        )
                }
                {!roomDetail.is_user_in_room && !roomDetail.is_contest_room && roomDetail.mode_type === "land_grab_solo" && new Date(roomDetail.ends_at) > new Date() &&
                    <div
                        className="mt-1">
                        <Button
                            variant="light"
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


            <TeamStatusBox roomDetail={roomDetail} userColors={userColors}/>
        </>);
}

export default RoomFloatingComponent;