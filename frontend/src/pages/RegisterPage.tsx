import {
    ActionIcon,
    Button,
    Container,
    CopyButton,
    Group,
    Paper,
    PasswordInput,
    rem,
    Stack,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const RegisterPage = () => {
    return (
        <Container size="xs">
            <Paper withBorder mt="xl" shadow="md" p="md" radius="md">
                <Stack gap="md">
                    <Text size="xl" fw={500}>
                        회원 가입
                    </Text>
                    <TextInput label="핸들" placeholder="핸들" required/>
                    <PasswordInput label="비밀번호" placeholder="비밀번호" required/>
                    <PasswordInput label="비밀번호 확인" placeholder="비밀번호 확인" required/>
                    <Group justify="space-between">
                        <TextInput
                            label="인증 코드"
                            placeholder="F46teRETY$ets"
                            disabled
                            style={{flex: 1}}
                            rightSection={
                                <CopyButton value="https://mantine.dev" timeout={2000}>
                                    {({copied, copy}) => (
                                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                            <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle"
                                                        onClick={copy}>
                                                {copied ? (
                                                    <CheckIcon style={{width: rem(16)}}/>
                                                ) : (
                                                    <ContentCopyIcon style={{width: rem(16)}}/>
                                                )}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            }
                        />
                    </Group>
                    <Button fullWidth>
                        회원 가입
                    </Button>
                </Stack>
            </Paper>

        </Container>
    )
}

export default RegisterPage;
