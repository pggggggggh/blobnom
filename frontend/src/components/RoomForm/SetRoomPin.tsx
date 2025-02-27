import {Checkbox, Stack, TextInput} from '@mantine/core';

const SetRoomPin = ({
                        isPrivateProps,
                        entryPinProps,
                        onClearPin,
                    }: {
    isPrivateProps: {
        checked?: boolean;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    };
    entryPinProps: {
        value?: string;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    };
    onClearPin: () => void;
}) => {
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        isPrivateProps.onChange(event);
        if (!event.target.checked) {
            onClearPin();
        }
    };

    return (
        <Stack gap="xs">
            <TextInput
                label="입장 비밀번호"
                {...entryPinProps}
                placeholder="입장 비밀번호"
                type="password"
                disabled={!isPrivateProps.checked}
            />
            <Checkbox
                label="비밀방 설정"
                checked={isPrivateProps.checked}
                onChange={handleCheckboxChange}
            />
        </Stack>
    );
};

export default SetRoomPin;
