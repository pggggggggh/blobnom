import {Image, Stack, Text} from "@mantine/core";
import blobsad from "../../assets/blobsad.webp";
import {useTranslation} from "react-i18next";

const ErrorModal = ({detailMessage}: { detailMessage: string }) => {
    const {t} = useTranslation();
    return (
        <Stack
            w="100%"
            align="center"
            justify="center"
        >
            <Image w="64px" src={blobsad}/>
            <Text>{t(detailMessage)}</Text>
        </Stack>
    )
}

export default ErrorModal;