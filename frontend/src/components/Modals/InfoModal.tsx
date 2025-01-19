import {Image, Stack, Text} from "@mantine/core";
import blobaww from "../../assets/blobaww.webp";

const ErrorModal = ({detailMessage}: { detailMessage: string }) => {
    return (
        <Stack
            w="100%"
            align="center"
            justify="center"
        >
            <Image w="64px" src={blobaww}/>
            <Text>{detailMessage}</Text>
        </Stack>
    )
}

export default ErrorModal;