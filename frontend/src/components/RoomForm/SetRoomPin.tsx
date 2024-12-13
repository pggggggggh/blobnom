import {Checkbox, Grid, TextInput} from '@mantine/core';

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
        <Grid
            gutter="lg"
            align="center"
        >
            <Grid.Col span={6}>
                <Checkbox
                    label="비밀방 설정"
                    checked={isPrivateProps.checked}
                    onChange={handleCheckboxChange}
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput
                    {...entryPinProps}
                    placeholder="입장 비밀번호"
                    type="password"
                    disabled={!isPrivateProps.checked}
                />
            </Grid.Col>
        </Grid>
    );
};

export default SetRoomPin;
