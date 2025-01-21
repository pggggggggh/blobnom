import React from 'react';
import { DateTimePicker } from '@mantine/dates';
import { Box } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { RoomForm } from '../../types/RoomForm';

interface SetRoomTimeProps {
    form: UseFormReturnType<RoomForm>;
}

const SetRoomTime: React.FC<SetRoomTimeProps> = ({ form }) => {
    const handleStartChange = (date: Date | null) => {
        if (date) {
            form.setFieldValue('starts_at', date.toISOString());

            // const endsAt = new Date(date.getTime() + 2 * 60 * 60 * 1000);
            // form.setFieldValue('ends_at', endsAt.toISOString());
        }
    };

    const handleEndChange = (date: Date | null) => {
        if (date) {
            form.setFieldValue('ends_at', date.toISOString());
        }
    };

    return (
        <Box>
            <DateTimePicker
                label="시작 시간"
                placeholder="시작 시간을 선택하세요"
                value={new Date(form.values.starts_at)}
                onChange={handleStartChange}
                minDate={new Date()}
                required
                error={form.errors.starts_at}
            />

            <DateTimePicker
                label="종료 시간"
                placeholder="종료 시간을 선택하세요"
                value={new Date(form.values.ends_at)}
                onChange={handleEndChange}
                minDate={new Date(form.values.starts_at)}
                required
                error={form.errors.ends_at}
                mt="md"
            />

        </Box>
    );
};

export default SetRoomTime;
