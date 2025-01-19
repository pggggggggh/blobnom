import {ActionIcon, Alert, Box, Button, Container, PasswordInput, Stack, Text, TextInput, Title} from "@mantine/core";
import {useFetchSolvedAcToken, useRegister} from "../hooks/hooks";
import {useNavigate} from "@tanstack/react-router";
import {useForm} from "@mantine/form";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function Register() {
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const {data: solvedTokenData, refetch, isFetching, isError} = useFetchSolvedAcToken();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            handle: '',
            email: '',
            password: '',
        },
        validate: {
            email: (value) => {
                if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
                    return '이메일을 확인해주세요.';
                }
                return null;
            },
        },
    });

    function onGetSolvedAcToken() {
        refetch();
    }

    function handleCopyToken() {
        if (solvedTokenData?.token) {
            navigator.clipboard.writeText(solvedTokenData.token).then(() => {
                alert("토큰이 클립보드에 복사되었습니다!");
            });
        }
    }

    function onRegister(values) {
        registerMutation.mutate({
            handle: values.handle,
            email: values.email,
            password: values.password
        });
    }

    return (
        <Container size="xs" my="xl">
            <form onSubmit={form.onSubmit(onRegister)}>
                <Box mb="md">
                    <Title order={2}>회원가입</Title>
                    <Text>
                        solved.ac 가입 후, 발급받은 토큰을 계정 자기소개란에 붙여넣어주세요.
                    </Text>
                </Box>
                <Stack gap="md">
                    {isError && <Alert color="red">토큰 발급 중 오류가 발생했습니다. 잠시 후에 시도해주세요.</Alert>}
                    <Button onClick={onGetSolvedAcToken} variant="outline" loading={isFetching}>
                        solved.ac 인증 토큰 발급
                    </Button>
                    {solvedTokenData && (
                        <TextInput
                            label="solved.ac 토큰"
                            readOnly
                            value={solvedTokenData.token}
                            rightSection={
                                <ActionIcon onClick={handleCopyToken} variant="subtle">
                                    <ContentCopyIcon fontSize="small"/>
                                </ActionIcon>
                            }
                        />
                    )}
                    <TextInput
                        {...form.getInputProps('handle')}
                        label="핸들(Handle)"
                        placeholder="solved.ac handle과 동일"
                        required
                    />
                    <TextInput
                        {...form.getInputProps('email')}
                        label="이메일"
                        placeholder="이메일 입력"
                        required
                    />
                    <PasswordInput
                        {...form.getInputProps('password')}
                        label="비밀번호"
                        placeholder="비밀번호 입력"
                        required
                    />
                    <Button type="submit" loading={registerMutation.isPending}>
                        회원가입
                    </Button>

                    {/*<Button variant="outline" onClick={() => navigate({to: "/login"})}>*/}
                    {/*    로그인 페이지로*/}
                    {/*</Button>*/}
                </Stack>
            </form>
        </Container>
    );
}
