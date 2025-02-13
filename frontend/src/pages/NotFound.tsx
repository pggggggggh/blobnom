import {Button, Center, Stack, Text, Title} from "@mantine/core";
import {Link} from "@tanstack/react-router";

export default function NotFound() {
    return (
        <Center>
            <Stack align="center">
                <Title order={1}>404</Title>
                <Text size="lg" c="dimmed">
                    페이지를 찾을 수 없습니다.
                </Text>
                <Link to="/">
                    <Button variant="light">
                        홈으로 돌아가기
                    </Button>
                </Link>
            </Stack>
        </Center>
    );
}
