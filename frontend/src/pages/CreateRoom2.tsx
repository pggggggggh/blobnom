import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Box, Title, Stack, Button } from '@mantine/core';
import { RoomForm } from '../types/RoomForm';
import { SetRoomSize, SetRoomPin, SetRoomTitle, SetRoomOwner, SetRoomQuery } from '../components/RoomForm';

function CreateRoom2() {
    const boxStyles = { width: '50%', minWidth: '400px', margin: '0' };

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
    });

    const [submittedValues, setSubmittedValues] = useState<typeof form.values | null>(null);
    const [tierRange, setTierRange] = useState<[number, number]>([0, 30]);
    const [customQuery, setCustomQuery] = useState<string>('');

    useEffect(() => {
        console.log(form.values);
    }, [form.values]);

    return (
        <form
            style={{ maxWidth: '1000px', margin: '0 auto' }}
            onSubmit={(e) => {
                e.preventDefault();
                setSubmittedValues(form.values);
            }}
        >
            <Stack py="md">
                <Title size="h1" py="xl">
                    방 만들기
                </Title>
                <SetRoomTitle titleProps={form.getInputProps('title')} />
                <Box style={boxStyles}>
                    <SetRoomOwner
                        ownerProps={form.getInputProps('owner')}
                        passwordProps={form.getInputProps('edit_password')}
                    />
                </Box>
                <SetRoomQuery queryValue={form.values.query} queryProps={form.getInputProps('query')} />
                <SetRoomSize sizeProps={form.getInputProps('size')} />
                <SetRoomPin
                    isPrivateProps={form.getInputProps('is_private', { type: 'checkbox' })}
                    entryPinProps={form.getInputProps('entry_pin')}
                    onClearPin={() => form.setFieldValue('entry_pin', '')}
                />
                <Button type="submit">생성</Button>
            </Stack>
        </form>
    );
}

export default CreateRoom2;
