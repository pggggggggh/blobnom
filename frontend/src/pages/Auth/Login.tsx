import {useState} from "react";
import {Alert, Button, Container, PasswordInput, Stack, TextInput, Title} from "@mantine/core";
import {useLogin} from "../../hooks/hooks.tsx";
import {useNavigate} from "@tanstack/react-router";
import {useForm} from "@mantine/form";


export default function Login() {
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            handle: '',
            password: '',
            rememberMe: false
        },
        validate: {},
    });

    const [error, setError] = useState<string | null>(null);

    const onLogin = (values) => {
        setError(null);
        loginMutation.mutate(
            {handle: values.handle, password: values.password, remember_me: values.rememberMe},
            {
                onError: (err: any) => {
                    console.log("Login error from component:", err);
                },
            }
        );
    };

    const goToRegister = () => {
        navigate({to: "/register"});
    };

    return (
        <Container size="xs" my="xl">
            <form onSubmit={form.onSubmit(onLogin)}>
                <Title order={2} mb="md">
                    로그인
                </Title>
                <Stack>
                    {error && <Alert color="red">{error}</Alert>}
                    <TextInput
                        {...form.getInputProps('handle')}
                        label="Handle"
                        placeholder="핸들 입력"
                        required
                    />
                    <PasswordInput
                        {...form.getInputProps('password')}
                        label="비밀번호"
                        placeholder="비밀번호 입력"
                        required
                    />
                    <Button type="submit" loading={loginMutation.isPending}>로그인</Button>
                    <Button variant="outline" onClick={goToRegister}>
                        회원가입
                    </Button>
                </Stack>
            </form>
        </Container>
    );
}
