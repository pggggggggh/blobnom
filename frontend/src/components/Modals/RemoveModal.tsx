import {Button, Image, Stack, TextInput} from "@mantine/core";
import blobaww from "../../assets/blobnom.png"
import {useForm} from "@mantine/form";
import {useDeleteRoom} from "../../hooks/hooks.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";

const RoomDeleteModal = ({roomId, needPassword}: { roomId: number, needPassword: boolean }) => {
    const mutation = useDeleteRoom();
    const auth = useAuth();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            password: '',
        },
        validate: {
            password: (value) => {
                if (auth.user) return null;
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
                {
                    needPassword && <TextInput
                        {...form.getInputProps('password')}
                        label="비밀번호를 입력해주세요!"
                        placeholder="비밀번호"
                        type="password"
                    />
                }


                <Button type="submit" loading={mutation.isPending}>
                    삭제하기
                </Button>
            </Stack>
        </form>
    );
}

export default RoomDeleteModal;