// src/pages/CreateRoom2.tsx
import {useEffect} from 'react';
import {useForm} from '@mantine/form';
import {Button, Stack, Title} from '@mantine/core';
import {RoomForm} from '../types/RoomForm';
import {SetRoomOwner, SetRoomPin, SetRoomQuery, SetRoomSize, SetRoomTitle, TeamSelector,} from '../components/RoomForm';


function CreateRoom2() {
    const form = useForm<RoomForm>({
        initialValues: {
            owner: '',
            edit_password: '',
            handles: '',
            title: '',
            query: '',
            size: 19,
            is_private: false,
            max_players: 0,
            starts_at: '',
            ends_at: '',
            entry_pin: '',
        },
        validate: {
            owner: (value) => (value.trim() === '' ? '방장은 필수 항목입니다.' : null),
            edit_password: (value) =>
                value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null,
            title: (value) => (value.trim() === '' ? '방 제목은 필수 항목입니다.' : null),
            entry_pin: (value, values) => (values.is_private ? (
                value.length < 4 ? '비밀번호는 최소 4자 이상이어야 합니다.' : null
            ) : null)
        },
    });

    useEffect(() => {
        console.log(form.values);
    }, [form.values]);

    return (
        <form
            style={{maxWidth: '1000px', margin: '0 auto'}}
            onSubmit={form.onSubmit((values) => console.log(values))}
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
                <SetRoomOwner
                    ownerProps={form.getInputProps('owner')}
                    passwordProps={form.getInputProps('edit_password')}
                />
                <SetRoomQuery queryValue={form.values.query} queryProps={form.getInputProps('query')}/>
                <SetRoomSize sizeProps={form.getInputProps('size')}/>
                <TeamSelector/>

                <Button type="submit">생성</Button>
            </Stack>
        </form>
    );
}

export default CreateRoom2;
