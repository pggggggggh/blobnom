import { TextInput, Grid, Checkbox } from '@mantine/core';

const SetRoomPin = ({
    isPrivateProps,
    entryPinProps,
}: {
    isPrivateProps: {
        value?: boolean;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    };
    entryPinProps: {
        value?: string;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    };
}) => {
    return (
        <Grid
            py="lg"
            gutter="sx"
            align="center"
            style={{ width: '40%', minWidth: '400px' }}
        >
            <Grid.Col span={4}>
                <Checkbox
                    label="비밀방 설정"
                    checked={isPrivateProps.value}
                    onChange={isPrivateProps.onChange}
                />
            </Grid.Col>

            <Grid.Col span={7}>
                <TextInput
                    {...entryPinProps}
                    placeholder="입장 비밀번호"
                    type="password"
                    disabled={!isPrivateProps.value}
                    styles={{
                        input: {
                            height: '38px',
                        },
                    }}
                />
            </Grid.Col>
        </Grid>
    );
};

export default SetRoomPin;
