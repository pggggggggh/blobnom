import {
    ActionIcon,
    Anchor,
    Button,
    Container,
    CopyButton,
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
import {useForm} from "@mantine/form";
import {useState} from "react";

const RegisterPage = () => {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            handle: '',
            password: '',
            confirmPassword: ''
        },

        validate: {
            confirmPassword: (value, values) =>
                value !== values.password ? '비밀번호가 일치하지 않습니다.' : null,
        },
    });

    const [verificationCode, setVerificationCode] = useState('');
    const [profileUrl, setProfileUrl] = useState('');

    form.watch('handle', ({previousValue, value, touched, dirty}) => {
        setVerificationCode(`BlobnomCheckCode-${value}`);
        setProfileUrl(`https://solved.ac/profile/${value}`)
    });

    return (
        <Container size="xs">
            <Paper withBorder mt="xl" shadow="md" p="md" radius="md">
                <Stack gap="md" component="form" onSubmit={form.onSubmit((values) => console.log(values))}>
                    <Text size="xl" fw={500}>
                        회원 가입
                    </Text>
                    <TextInput
                        label="핸들" placeholder="핸들" required
                        key="handle" {...form.getInputProps('handle')}
                    />
                    <TextInput type="password" label="비밀번호" placeholder="비밀번호" required
                               key="password" {...form.getInputProps('password')}
                    />
                    <PasswordInput label="비밀번호 확인" placeholder="비밀번호 확인" required
                                   key="confirmPassword" {...form.getInputProps('confirmPassword')}/>
                    <TextInput
                        label="인증 코드"
                        value={verificationCode}
                        disabled
                        style={{flex: 1}}
                        rightSection={
                            <CopyButton value={verificationCode} timeout={2000}>
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
                    <Text size="sm" c="dimmed">
                        solved.ac 프로필에 접속하여, '프로필 편집'을 누르고 자기소개란에 해당 코드를 붙여넣어주세요!
                        회원가입이 끝난 뒤에는 원상복구시키셔도 좋습니다.
                    </Text>
                    <Anchor
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                    >
                        내 solved.ac 프로필로 이동하기
                    </Anchor>
                    <Button type="submit" fullWidth>
                        회원 가입
                    </Button>
                </Stack>
            </Paper>

        </Container>
    )
}

export default RegisterPage;
