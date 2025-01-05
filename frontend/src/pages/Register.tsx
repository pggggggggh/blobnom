import { useState } from "react";
import {
    Container,
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Title,
    Alert,
    ActionIcon,
    Group
} from "@mantine/core";
import { useFetchSolvedAcToken, useRegister } from "../hooks/hooks";
import { useNavigate } from "@tanstack/react-router";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function Register() {
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const { data: solvedTokenData, refetch, isFetching, isError } = useFetchSolvedAcToken();
    const [handle, setHandle] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [maskToken, setMaskToken] = useState(true);

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

    function onRegister() {
        registerMutation.mutate({
            handle,
            email,
            password
        });
    }

    return (
        <Container size="xs" my="xl">
            <Title order={2} mb="md">회원가입</Title>
            <Stack spacing="md">
                {registerMutation.isError && (
                    <Alert color="red">회원가입 중 오류가 발생했습니다.</Alert>
                )}
                <Button onClick={onGetSolvedAcToken} variant="outline" loading={isFetching}>
                    solved.ac 인증 토큰 발급
                </Button>
                {isError && <Alert color="red">토큰 발급 중 오류가 발생했습니다.</Alert>}
                {solvedTokenData && (
                    <TextInput
                        label="solved.ac 토큰"
                        readOnly
                        value={maskToken ? "********" : solvedTokenData.token}
                        rightSection={
                            <Group spacing={4}>
                                <ActionIcon onClick={handleCopyToken}>
                                    <ContentCopyIcon fontSize="small" />
                                </ActionIcon>
                                <ActionIcon onClick={() => setMaskToken(!maskToken)}>
                                    {maskToken ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                </ActionIcon>
                            </Group>
                        }
                    />
                )}
                <TextInput
                    label="핸들(Handle)"
                    placeholder="solved.ac handle과 동일"
                    value={handle}
                    onChange={(e) => setHandle(e.currentTarget.value)}
                    required
                />
                <TextInput
                    label="이메일"
                    placeholder="이메일 입력"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                />
                <PasswordInput
                    label="비밀번호"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    required
                />
                <Button onClick={onRegister} loading={registerMutation.isLoading}>
                    회원가입
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/login" })}>
                    로그인 페이지로
                </Button>
            </Stack>
        </Container>
    );
}
