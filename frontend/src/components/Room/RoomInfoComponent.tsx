import {RoomDetail} from "../../types/RoomDetail.tsx";
import {Box, Flex, Text, Title, UnstyledButton} from "@mantine/core";
import dayjs from "dayjs";
import {modals} from "@mantine/modals";
import RoomDeleteModal from "../Modals/RemoveModal.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {IconLock, IconTrash} from "@tabler/icons-react";
import PlatformIcon from "../UI/PlatformIcon.tsx";
import {ModeType} from "../../types/enum/ModeType.tsx";
import RoomJoinModal from "../Modals/RoomJoinModal.tsx";
import {useTranslation} from "react-i18next";
import EnterButton from "../UI/EnterButton.tsx";

interface RoomInfoProps {
    roomDetail: RoomDetail;
    timeLeft: string;
}

const RoomInfoComponent = ({roomDetail, timeLeft}: RoomInfoProps) => {
    const auth = useAuth();
    const {t} = useTranslation();

    return (
        <Box pos="absolute" maw={{"base": 200, "md": 400}}>
            <PlatformIcon platform={roomDetail.platform} w={24}/>
            <Flex align="center" mt="">
                <Title flex={1} lh={0.9} display="inline-block">
                    {roomDetail.name}
                </Title>
                {roomDetail.is_private && <IconLock height={20}/>}
            </Flex>
            {roomDetail.query &&
                <Text c="dimmed" size="xs" truncate="end">
                    {roomDetail.query}
                </Text>
            }
            <Text size="sm">
                {roomDetail.is_started
                    ? timeLeft
                    : `${dayjs(roomDetail.starts_at).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(roomDetail.ends_at).format('YYYY-MM-DD HH:mm')}, ${t("num_problems", {n: roomDetail.num_missions})}`}
            </Text>
            {
                (auth.member?.handle === roomDetail.owner.handle) ?
                    (
                        <UnstyledButton mt="5" variant="outline"
                                        onClick={() => {
                                            modals.open({
                                                title: t("삭제하기"),
                                                children: <RoomDeleteModal roomId={roomDetail.id} needPassword={false}/>
                                            });
                                        }}>
                            <IconTrash/>
                        </UnstyledButton>
                    ) :
                    (
                        !roomDetail.is_owner_a_member &&
                        <UnstyledButton mt="5" variant="transparent"
                                        onClick={() => {
                                            modals.open({
                                                title: t("삭제하기"),
                                                children: <RoomDeleteModal
                                                    roomId={roomDetail.id}
                                                    needPassword={true}/>
                                            });
                                        }}>
                            <IconTrash/>
                        </UnstyledButton>
                    )
            }
            {!roomDetail.is_user_in_room && !roomDetail.is_contest_room && roomDetail.mode_type === ModeType.LAND_GRAB_SOLO && new Date(roomDetail.ends_at) > new Date() &&
                <div
                    className="mt-1">
                    <EnterButton
                        onClick={() => {
                            modals.open({
                                title: t("참여하기"),
                                children: <RoomJoinModal roomId={roomDetail.id} is_private={roomDetail.is_private}/>
                            });
                        }}
                    >
                        {t("참여하기")}
                    </EnterButton>
                </div>
            }
        </Box>
    )
}

export default RoomInfoComponent;