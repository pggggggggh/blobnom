import {useEffect, useState} from "react";
import {ActionIcon, Button, Card, Group, Stack, Text} from "@mantine/core";
import {usePracticeRank} from "../../hooks/hooks.tsx";
import dayjs from "dayjs";
import {IconDots} from "@tabler/icons-react";


const MyRankComponent = ({starts_at, practiceId}: { starts_at: string, practiceId: number }) => {
    const [myRank, setMyRank] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState<string>("");
    const {data: rankData, isError, isLoading, error, refetch} = usePracticeRank(practiceId);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handleButtonClick = async () => {
        if (isButtonDisabled) return;

        setIsButtonDisabled(true);
        await refetch();

        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 3000);
    };


    useEffect(() => {
        if (!rankData) return;
        setMyRank(rankData.your_rank);
        console.log(rankData);
    }, [rankData]);

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = dayjs().diff(dayjs(starts_at), 'second');
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [starts_at]);

    return (
        <Card
            shadow="xl"
            p="lg"
            className="fixed bottom-4 right-4"
            withBorder
            radius="md"
            style={{maxWidth: "300px"}}
        >
            <Stack align="center" gap="xs">
                <Text>
                    {rankData?.rank.length}명 중 {myRank}위
                </Text>
                <Group align="center">
                    <Button variant="outline" onClick={handleButtonClick}
                            loading={isLoading || isButtonDisabled}>
                        새로고침
                    </Button>
                    <ActionIcon variant="subtle" color="gray"
                                onClick={() => window.location.href = `/practices/${practiceId}/rank`}>
                        <IconDots/>
                    </ActionIcon>
                </Group>
            </Stack>
        </Card>
    );
};

export default MyRankComponent;
