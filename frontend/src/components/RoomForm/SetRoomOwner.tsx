import { TextInput, Grid } from '@mantine/core';

const SetRoomOwner = ({
    ownerProps,
    passwordProps,
}: {
    ownerProps: any;
    passwordProps: any;
}) => {
    return (
        <Grid gutter="lg">
            <Grid.Col span={6}>
                <TextInput
                    {...ownerProps}
                    label="방장 핸들"
                    placeholder="handle"
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    {...passwordProps}
                    label="방 수정 비밀번호"
                    placeholder="edit password"
                    type="password"
                />
            </Grid.Col>
        </Grid>
    );
};

export default SetRoomOwner;
