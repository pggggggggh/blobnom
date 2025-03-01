import {IconArrowRight} from "@tabler/icons-react";
import {Button} from "@mantine/core";
import React from "react";
import {useTranslation} from "react-i18next";

const EnterButton = ({onClick}: any) => {
    const {t} = useTranslation();

    return (
        <Button variant="light" fw={300}
                rightSection={<IconArrowRight size={16}/>}
                onClick={onClick}>
            {t("참여하기")}
        </Button>
    )
}

export default EnterButton;