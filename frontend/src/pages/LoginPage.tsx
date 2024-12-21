import {Anchor, Button, Checkbox, Container, Group, Paper, PasswordInput, Stack, Text, TextInput} from "@mantine/core";

const LoginPage = () => {
    return (
        <Container size="xs">
            <Paper withBorder mt="xl" shadow="md" p="md" radius="md">
                <Stack gap="md">
                    <Text size="xl" fw={500}>
                        로그인
                    </Text>
                    <TextInput label="핸들" placeholder="핸들" required/>
                    <PasswordInput label="비밀번호" placeholder="비밀번호" required/>

                    <Group justify="space-between" align="center">
                        <Checkbox label="로그인 유지"/>
                        <Group gap="sm">
                            <Anchor component="button" size="sm">
                                비밀번호 찾기
                            </Anchor>
                            <Anchor size="sm" href="/register">
                                회원 가입
                            </Anchor>
                        </Group>
                    </Group>

                    <Button fullWidth>
                        로그인
                    </Button>
                </Stack>
            </Paper>
        </Container>
    )
}

export default LoginPage;