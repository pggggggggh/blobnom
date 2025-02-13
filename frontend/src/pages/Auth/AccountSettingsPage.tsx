import {ActionIcon, Alert, Anchor, Box, Button, Container, Stack, Text, TextInput, Title} from "@mantine/core";
import {useBindAccount, useFetchSolvedAcToken} from "../../hooks/hooks.tsx";
import {useNavigate} from "@tanstack/react-router";
import {useForm} from "@mantine/form";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {Platform} from "../../types/Platforms.tsx";

export default function AccountSettingsPage() {
    const navigate = useNavigate();
    const bindMutation = useBindAccount()
    const {data: solvedTokenData, refetch, isFetching, isError} = useFetchSolvedAcToken();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            handle: '',
        },
        validate: {},
    });

    function onGetSolvedAcToken() {
        refetch();
    }

    function handleCopyToken() {
        if (solvedTokenData?.token) {
            navigator.clipboard.writeText(solvedTokenData.token).then(() => {
                // alert("토큰이 클립보드에 복사되었습니다!");
            });
        }
    }

    function onRegister(values) {
        bindMutation.mutate({
            handle: values.handle,
            platform: Platform.CODEFORCES
        });
    }

    return (
        <Container size="xs" my="xl">
            <form onSubmit={form.onSubmit(onRegister)}>
                <Box mb="md">
                    <Title order={2}>Codeforces 계정 연동</Title>
                    <Text>
                        Codeforces 로그인 후,{' '}
                        <Anchor href="https://codeforces.com/settings/social" target="_blank" rel="noopener noreferrer">
                            이곳
                        </Anchor>
                        에 접속하셔서 First Name/Last Name 중 하나를 아래 토큰으로 붙여넣어주세요. 완료된 후에는 삭제하셔도 괜찮습니다.
                    </Text>
                </Box>
                <Stack gap="md">
                    {isError && <Alert color="red">토큰 발급 중 오류가 발생했습니다. 잠시 후에 시도해주세요.</Alert>}
                    <Button onClick={onGetSolvedAcToken} variant="outline" loading={isFetching}>
                        인증 토큰 발급
                    </Button>
                    {solvedTokenData && (
                        <TextInput
                            label="인증 토큰"
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
                        placeholder="Codeforces handle"
                        required
                    />
                    <Button type="submit" loading={bindMutation.isPending}>
                        연동
                    </Button>
                </Stack>
            </form>
        </Container>
    );
}
