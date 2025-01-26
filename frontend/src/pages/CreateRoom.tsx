import React from 'react';
import {useForm} from '@mantine/form';
import {Button, Container, Stack, Title} from '@mantine/core';
import {RoomForm} from '../types/RoomForm';
import {
    SetRoomOwner,
    SetRoomPin,
    SetRoomQuery,
    SetRoomSize,
    SetRoomTime,
    SetRoomTitle,
    TeamSelector
} from '../components/RoomForm';
import {useCreateRoom} from '../hooks/hooks';
import {useAuth} from "../context/AuthProvider.tsx";

function CreateRoom() {
    const auth = useAuth();

    const now = new Date();
    now.setSeconds(0);
    now.setMinutes(now.getMinutes() + 5);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const form = useForm<RoomForm>({
        initialValues: {
            owner_handle: '',
            edit_password: '',
            handles: auth.user ? {[auth.user]: 0} : {},
            is_teammode: false,
            mode: 'land_grab_solo',
            title: '',
            query: '',
            size: 2,
            is_private: false,
            max_players: 16,
            starts_at: now.toISOString(),
            ends_at: twoHoursLater.toISOString(),
            entry_pin: '',
        },
        validate: {
            owner_handle: (value) => (!auth.user && value.trim() === '' ? '방장은 필수 항목입니다.' : null),
            edit_password: (value) =>
                !auth.user && value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null,
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
        <Container size="md">
            <form
                onSubmit={form.onSubmit((values) => {
                    values.mode = values.is_teammode ? 'land_grab_team' : 'land_grab_solo';
                    return mutation.mutate(values);
                })}
                onKeyDown={handleKeyDown}
            >
                <Stack py="md">
                    <Title size="h1" className="font-light">
                        방 만들기
                    </Title>

                    <SetRoomTitle titleProps={form.getInputProps('title')}/>

                    <SetRoomPin
                        isPrivateProps={form.getInputProps('is_private', {type: 'checkbox'})}
                        entryPinProps={form.getInputProps('entry_pin')}
                        onClearPin={() => form.setFieldValue('entry_pin', '')}
                    />

                    {!auth.user &&
                        <SetRoomOwner
                            ownerProps={form.getInputProps('owner_handle')}
                            passwordProps={form.getInputProps('edit_password')}
                        />}

                    <SetRoomQuery
                        queryValue={form.values.query}
                        queryProps={form.getInputProps('query')}
                        handleValue={form.values.handles}
                    />

                    <SetRoomSize sizeProps={form.getInputProps('size')}/>

                    <TeamSelector
                        handleProps={form.getInputProps('handles')}
                        teamModeProps={form.getInputProps('is_teammode')}
                    />

                    <SetRoomTime form={form}/>

                    <Button type="submit" loading={mutation.isPending}>
                        생성
                    </Button>
                </Stack>
            </form>
        </Container>
    );
}

export default CreateRoom;
