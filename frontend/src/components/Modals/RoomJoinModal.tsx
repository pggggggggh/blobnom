import {Button, Group, Image, TextInput} from "@mantine/core";
import blobaww from "../../assets/blobaww.webp"
import {useForm} from "@mantine/form";
import {useJoinRoom} from "../../hooks/hooks.tsx";

const RoomJoinModal = ({roomId}: { roomId: number }) => {
    const mutation = useJoinRoom();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            handle: ''
        },
        validate: {
            handle: (value) => {
                if (!/^[a-zA-Z0-9]{1,50}$/.test(value)) {
                    return "핸들 형식이 잘못되었습니다.";
                }
                return null;
            },
        },
    });

    const handleSubmit = (values: { handle: string; }) => {
        mutation.mutate(
            {roomId, handle: values.handle},
        );
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group
                className="w-full justify-center"
            >
                <Image w="64px" src={blobaww}/>
                <TextInput
                    {...form.getInputProps('handle')} label="핸들을 입력해주세요!" placeholder="" data-autofocus/>
                <Button type="submit" mt="md" loading={mutation.isPending}>
                    입장하기
                </Button>
            </Group>
        </form>
    );
}

export default RoomJoinModal;