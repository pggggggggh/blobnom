import {Button, Image, Stack, TextInput} from "@mantine/core";
import blobaww from "../../assets/blobnom.png"
import {useForm} from "@mantine/form";
import {useDeleteRoom} from "../../hooks/hooks.tsx";

const RoomDeleteModal = ({roomId}: { roomId: number }) => {
    const mutation = useDeleteRoom();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            password: '',
        },
        validate: {
            password: (value) => {
                if (value.length < 4) {
                    return "비밀번호를 확인해주세요.";
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: { password: string; }) => {
        mutation.mutate(
            {roomId, password: values.password},
        );
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack align="center">
                <Image w="64px" src={blobaww}/>
                <TextInput
                    {...form.getInputProps('password')}
                    label="비밀번호를 입력해주세요!"
                    placeholder="비밀번호"
                    type="password"
                />

                <Button type="submit" loading={mutation.isPending}>
                    삭제하기
                </Button>
            </Stack>
        </form>
    );
}

export default RoomDeleteModal;