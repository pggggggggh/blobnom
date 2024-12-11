import {Image, Stack, Text} from "@mantine/core";
import blobsad from "../../assets/blobsad.webp";

const ErrorModal = ({detailMessage}: { detailMessage: string }) => {
    return (
        <Stack
            w="100%"
            align="center"
            justify="center"
        >
            <Image w="64px" src={blobsad}/>
            <Text>{detailMessage}</Text>
        </Stack>
    )
}

export default ErrorModal;