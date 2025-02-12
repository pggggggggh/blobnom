import {Button, Image, Stack, TextInput} from "@mantine/core";
import blobaww from "../../assets/blobaww.webp"
import blobsad from "../../assets/blobsad.webp"
import {useForm} from "@mantine/form";
import {useJoinRoom} from "../../hooks/hooks.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";

const RoomJoinModal = ({roomId, is_private}: { roomId: number, is_private: boolean }) => {
    const mutation = useJoinRoom();
    const auth = useAuth();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            // handle: '',
            password: null,
        },
        validate: {
            // handle: (value) => {
            //     if (auth.user) return null;
            //     if (!/^[a-z0-9_]{1,50}$/.test(value)) {
            //         return "핸들 형식이 잘못되었습니다. 알파벳 소문자, 숫자, 언더바만 입력해주세요.";
            //     }
            //     return null;
            // },
        },
    });

    const handleSubmit = (values: { password: string | null; }) => {
        mutation.mutate(
            {roomId, password: values.password},
        );
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack align="center">
                {
                    auth.user ?
                        <>
                            <Image w="64px" src={blobaww}/>
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
                        </> : <>
                            <Image w="64px" src={blobsad}/>
                            비회원은 참가하실 수 없습니다.
                        </>
                }
            </Stack>
        </form>
    );
}

export default RoomJoinModal;