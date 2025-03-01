import {Box, UnstyledButton} from "@mantine/core";
import {useTranslation} from "react-i18next";
import {IconLanguage} from "@tabler/icons-react";

const LanguageToggle = () => {
    const {i18n} = useTranslation();
    const isKorean = i18n.language === 'ko';

    const toggleLanguage = () => {
        const newLanguage = isKorean ? 'en' : 'ko';
        i18n.changeLanguage(newLanguage);
    };

    return (
        <UnstyledButton
            onClick={toggleLanguage}
            title="Toggle language"
        >
            <Box w="25">
                {/*{*/}
                {/*    isKorean ?*/}
                {/*        <CircleFlag countryCode="kr" height="35"/>*/}
                {/*        :*/}
                {/*        <CircleFlag countryCode="us" height="35"/>*/}
                {/*}*/}
                <IconLanguage/>
            </Box>
        </UnstyledButton>
    );
};

export default LanguageToggle;
