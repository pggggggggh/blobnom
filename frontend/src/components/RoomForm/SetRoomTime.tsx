import React from 'react';
import {DateTimePicker} from '@mantine/dates';
import {UseFormReturnType} from '@mantine/form';
import {RoomForm} from '../../types/RoomForm';
import {SimpleGrid} from "@mantine/core";

interface SetRoomTimeProps {
    form: UseFormReturnType<RoomForm>;
}

const SetRoomTime: React.FC<SetRoomTimeProps> = ({form}) => {
    const handleStartChange = (date: Date | null) => {
        if (date) {
            form.setFieldValue('starts_at', date.toISOString());
        }
    };

    const handleEndChange = (date: Date | null) => {
        if (date) {
            form.setFieldValue('ends_at', date.toISOString());
        }
    };

    return (
        <SimpleGrid cols={2}>
            <DateTimePicker
                label="시작 시간"
                value={new Date(form.values.starts_at)}
                onChange={handleStartChange}
                minDate={new Date()}
                required
                error={form.errors.starts_at}
            />

            <DateTimePicker
                label="종료 시간"
                value={new Date(form.values.ends_at)}
                onChange={handleEndChange}
                minDate={new Date(form.values.starts_at)}
                required
                error={form.errors.ends_at}
            />
        </SimpleGrid>
    );
};

export default SetRoomTime;
