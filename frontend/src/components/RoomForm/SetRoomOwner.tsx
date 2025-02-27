import {Grid, SimpleGrid, TextInput} from '@mantine/core';

const SetRoomOwner = ({
                          ownerProps,
                          passwordProps,
                      }: {
    ownerProps: any;
    passwordProps: any;
}) => {
    return (
        <SimpleGrid cols={2}>
            <Grid.Col span={6}>
                <TextInput
                    {...ownerProps}
                    label="방장 핸들"
                    placeholder="핸들"
                    required
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    {...passwordProps}
                    label="방 수정 비밀번호"
                    placeholder="비밀번호"
                    type="password"
                    required
                />
            </Grid.Col>
        </SimpleGrid>
    );
};

export default SetRoomOwner;
