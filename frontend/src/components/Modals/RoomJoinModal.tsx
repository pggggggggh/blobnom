import { Button, Image, Stack, TextInput } from "@mantine/core";
import blobaww from "../../assets/blobaww.webp"
import { useForm } from "@mantine/form";
import { useJoinRoom } from "../../hooks/hooks.tsx";

const RoomJoinModal = ({ roomId, is_private }: { roomId: number, is_private: boolean }) => {
    const mutation = useJoinRoom();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            handle: '',
            password: '',
        },
        validate: {
            handle: (value) => {
                if (!/^[a-zA-Z0-9_]{1,50}$/.test(value)) {
                    return "핸들 형식이 잘못되었습니다.";
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: { handle: string; password: string; }) => {
        mutation.mutate(
            { roomId, handle: values.handle, password: values.password },
        );
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack align="center">
                <Image w="64px" src={blobaww} />
                <TextInput
                    {...form.getInputProps('handle')}
                    label="핸들을 입력해주세요!"
                    placeholder="핸들"
                    data-autofocus
                />
                {is_private && (
                    <TextInput
                        {...form.getInputProps('password')}
                        label="비밀번호를 입력해주세요!"
                        placeholder="비밀번호"
                        type="password"
                    />
                )}
                <Button type="submit" loading={mutation.isPending}>
                    입장하기
                </Button>
            </Stack>
        </form>
    );
}

export default RoomJoinModal;