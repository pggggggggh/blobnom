import {Button, Image, Stack} from "@mantine/core";
import blobaww from "../../assets/blobaww.webp"
import blobsad from "../../assets/blobsad.webp"
import {useForm} from "@mantine/form";
import {useAuth} from "../../context/AuthProvider.tsx";
import {DateTimePicker} from "@mantine/dates";
import {usePracticeStart} from "../../hooks/hooks.tsx";

const PracticeStartModal = ({practiceId}: { practiceId: number }) => {
    const mutation = usePracticeStart();
    const auth = useAuth();

    const nowPlusFiveMinutes = new Date(Date.now() + 5 * 60 * 1000);
    const form = useForm({
        initialValues: {
            startTime: nowPlusFiveMinutes,
        },
        validate: {
            startTime: (value) =>
                value && value > new Date() ? null : '시작 시간은 지금보다 늦어야 합니다.',
        },
    });

    const handleSubmit = (values: { startTime: Date | null; }) => {
        mutation.mutate(
            {practiceId: practiceId, startTime: values.startTime},
        );
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack align="center">
                {
                    auth.member ?
                        <>
                            <Image w="64px" src={blobaww}/>
                            <DateTimePicker
                                {...form.getInputProps('startTime')}
                                minDate={new Date()}
                            />

                            <Button type="submit" loading={mutation.isPending}>
                                시작하기
                            </Button>
                        </> : <>
                            <Image w="64px" src={blobsad}/>
                            비회원은 참가하실 수 없습니다.
                        </>
                }
            </Stack>
        </form>
    );
}

export default PracticeStartModal;