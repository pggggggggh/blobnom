import React from 'react';
import {useForm} from '@mantine/form';
import {Button, Card, Container, Divider, SimpleGrid, Stack, Text, TextInput, Title} from '@mantine/core';
import {RoomForm} from '../types/RoomForm';
import {
    SetRoomDifficulty,
    SetRoomPin,
    SetRoomQuery,
    SetRoomSize,
    SetRoomTime,
    TeamSelector
} from '../components/RoomForm';
import {useCreateRoom} from '../hooks/hooks';
import {useAuth} from "../context/AuthProvider.tsx";
import {Platform} from "../types/enum/Platforms.tsx";
import SetPlatform from "../components/RoomForm/SetPlatform.tsx";
import {ModeType} from "../types/enum/ModeType.tsx";

function CreateRoom() {
    const auth = useAuth();

    const now = new Date();
    now.setSeconds(0);
    now.setMinutes(now.getMinutes() + 3);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const form = useForm<RoomForm>({
        initialValues: {
            platform: Platform.BOJ,
            owner_handle: '',
            edit_password: '',
            handles: auth.member?.handle ? {[auth.member.handle]: 0} : {},
            is_teammode: false,
            mode: 'land_grab_solo',
            title: '',
            query: '',
            size: 2,
            is_private: false,
            unfreeze_offset_minutes: 0,
            max_players: 16,
            starts_at: now.toISOString(),
            ends_at: twoHoursLater.toISOString(),
            entry_pin: '',
        },
        validate: {
            owner_handle: (value) => (!auth.member && value.trim() === '' ? '방장은 필수 항목입니다.' : null),
            edit_password: (value) =>
                !auth.member && value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null,
            title: (value) => (value.trim() === '' ? '방 제목은 필수 항목입니다.' : null),
            entry_pin: (value, values) =>
                values.is_private ? (value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null) : null,
            handles: (value, values) => {
                if (values.is_teammode) {
                    const isTeamsValid = (handles: Record<string, number>): boolean => {
                        const teamNumbers = Array.from(new Set(Object.values(handles))).sort((a, b) => a - b);
                        if (teamNumbers.length < 2) return false;
                        if (teamNumbers[0] !== 0) return false;
                        for (let i = 1; i < teamNumbers.length; i++) {
                            if (teamNumbers[i] !== teamNumbers[i - 1] + 1) return false;
                        }
                        return true;
                    };
                    return isTeamsValid(value) ? null : '모든 팀에 최소 하나 이상의 참가자가 필요합니다.';
                } else {
                    return Object.keys(value).length > 0 ? null : '적어도 하나의 참가자가 필요합니다.';
                }
            },
            unfreeze_offset_minutes: (value) => {
                if (value === null) return null;
                if (!Number.isInteger(value) || value < 0) {
                    return "0 이상의 정수를 입력하세요.";
                }
                return null;
            },
            starts_at: (value) =>
                new Date(value) < new Date() ? '시작 시간은 현재 시간 이후여야 합니다.' : null,
            ends_at: (value, values) =>
                new Date(value) <= new Date(values.starts_at)
                    ? '종료 시간은 시작 시간보다 늦어야 합니다.'
                    : null,
        },
    });

    const mutation = useCreateRoom();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <Container py="lg">
            <Card mx="xl" px="xl" pt="lg" pb="xl" shadow="sm" withBorder>
                <Title>방 만들기</Title>
                <Text c="dimmed" mb="sm">방을 만들어 친구들과 함께 문제풀이를 즐깁니다.</Text>
                <form
                    onSubmit={form.onSubmit((values) => {
                        values.mode = values.is_teammode ? ModeType.LAND_GRAB_TEAM : ModeType.LAND_GRAB_SOLO;
                        return mutation.mutate(values);
                    })}
                    onKeyDown={handleKeyDown}
                >
                    <Stack>
                        <SimpleGrid cols={2}>
                            <TextInput
                                label="방 제목"
                                placeholder="방 제목"
                                required
                                key={form.key("title")}
                                {...form.getInputProps("title")}
                            />
                            <SetRoomPin
                                isPrivateProps={form.getInputProps('is_private', {type: 'checkbox'})}
                                entryPinProps={form.getInputProps('entry_pin')}
                                onClearPin={() => form.setFieldValue('entry_pin', '')}
                            />
                        </SimpleGrid>

                        {/*{!auth.member &&*/}
                        {/*    <SetRoomOwner*/}
                        {/*        ownerProps={form.getInputProps('owner_handle')}*/}
                        {/*        passwordProps={form.getInputProps('edit_password')}*/}
                        {/*    />}*/}

                        <Divider/>

                        <SetPlatform platformProps={form.getInputProps("platform")} label={"문제 출처"} desc={""}/>

                        <SetRoomQuery
                            platform={form.values.platform}
                            queryValue={form.values.query}
                            queryProps={form.getInputProps('query')}
                            handleValue={form.values.handles}
                        />

                        <Divider/>

                        <SetRoomDifficulty unfreezeOffsetMinutesProps={form.getInputProps("unfreeze_offset_minutes")}/>

                        <SetRoomSize sizeProps={form.getInputProps('size')}/>

                        <TeamSelector
                            handleProps={form.getInputProps('handles')}
                            teamModeProps={form.getInputProps('is_teammode')}
                        />

                        <SetRoomTime form={form}/>

                        <Button type="submit" loading={mutation.isPending} ml="auto">
                            생성
                        </Button>
                    </Stack>
                </form>
            </Card>
        </Container>
    );
}

export default CreateRoom;
