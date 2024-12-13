import { useForm } from '@mantine/form';
import { Button, Container, Stack, Title } from '@mantine/core';
import { RoomForm } from '../types/RoomForm.tsx';
import { SetRoomOwner, SetRoomPin, SetRoomQuery, SetRoomSize, SetRoomTitle, TeamSelector, } from '../components/RoomForm/index.tsx';
import { useCreateRoom } from "../hooks/hooks.tsx";


function CreateRoom() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(now.getDate() + 3); // for test!!!

    const form = useForm<RoomForm>({
        initialValues: {
            owner_handle: '',
            edit_password: '',
            handles: {},
            is_teammode: false,
            mode: "land_grab_solo",
            title: '',
            query: '',
            size: 2,
            is_private: false,
            max_players: 20,
            starts_at: now.toISOString(),
            ends_at: threeDaysLater.toISOString(),
            entry_pin: '',
        },
        validate: {
            owner_handle: (value) => (value.trim() === '' ? '방장은 필수 항목입니다.' : null),
            edit_password: (value) =>
                value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null,
            title: (value) => (value.trim() === '' ? '방 제목은 필수 항목입니다.' : null),
            entry_pin: (value, values) => (values.is_private ? (
                value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null
            ) : null),
            handles: (value, values) => {
                console.log(value)
                if (values.is_teammode) {
                    const isTeamsValid = (value: Record<string, number>): boolean => {
                        const values = Array.from(new Set(Object.values(value))).sort((a, b) => a - b);
                        if (values.length <= 1) return false;
                        if (values[0] !== 0) return false;
                        for (let i = 1; i < values.length; i++) {
                            if (values[i] !== values[i - 1] + 1) {
                                return false;
                            }
                        }
                        return true;
                    };
                    return isTeamsValid(value) ? null : '모든 팀에 최소 하나 이상의 참가자가 필요합니다.';
                } else {
                    return Object.keys(value).length > 0 ? null : '적어도 하나의 참가자가 필요합니다.';
                }
            },
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
                    values.mode = values.is_teammode ? "land_grab_team" : "land_grab_solo";
                    return mutation.mutate(values)
                })}
                onKeyDown={handleKeyDown}
            >
                <Stack py="md">
                    <Title size="h1" className="font-light">
                        방 만들기
                    </Title>
                    <SetRoomTitle titleProps={form.getInputProps('title')} />
                    <SetRoomPin
                        isPrivateProps={form.getInputProps('is_private', { type: 'checkbox' })}
                        entryPinProps={form.getInputProps('entry_pin')}
                        onClearPin={() => form.setFieldValue('entry_pin', '')}
                    />
                    <SetRoomOwner
                        ownerProps={form.getInputProps('owner_handle')}
                        passwordProps={form.getInputProps('edit_password')}
                    />
                    <SetRoomQuery queryValue={form.values.query} queryProps={form.getInputProps('query')}
                        handleValue={form.values.handles} />
                    <SetRoomSize sizeProps={form.getInputProps('size')} />
                    <TeamSelector handleProps={form.getInputProps('handles')}
                        teamModeProps={form.getInputProps('is_teammode')} />

                    <Button type="submit" loading={mutation.isPending}>생성</Button>
                </Stack>
            </form>
        </Container>
    );
}

export default CreateRoom;
