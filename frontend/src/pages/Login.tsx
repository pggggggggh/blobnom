import { useState } from "react";
import { Container, TextInput, PasswordInput, Button, Checkbox, Stack, Title, Alert } from "@mantine/core";
import { useLogin } from "../hooks/hooks";
import { useNavigate } from "@tanstack/react-router";


export default function Login() {
    const navigate = useNavigate();
    const loginMutation = useLogin(); // <-- useLogin 훅 사용

    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onLogin = () => {
        setError(null);
        loginMutation.mutate(
            { handle, password, remember_me: rememberMe },
            {
                onError: (err: any) => {
                    console.log("Login error from component:", err);
                },
            }
        );
    };

    const goToRegister = () => {
        navigate({ to: "/register" });
    };

    return (
        <Container size="xs" my="xl">
            <Title order={2} mb="md">
                로그인
            </Title>
            <Stack>
                {error && <Alert color="red">{error}</Alert>}
                <TextInput
                    label="Handle"
                    placeholder="핸들 입력"
                    value={handle}
                    onChange={(e) => setHandle(e.currentTarget.value)}
                    required
                />
                <PasswordInput
                    label="비밀번호"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    required
                />
                {/*
                <Checkbox
                    label="로그인 상태 유지"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                />
                */}
                <Button onClick={onLogin}>로그인</Button>
                <Button variant="outline" onClick={goToRegister}>
                    회원가입
                </Button>
            </Stack>
        </Container>
    );
}
