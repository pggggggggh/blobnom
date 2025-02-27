import {UnstyledButton, useMantineColorScheme} from "@mantine/core";
import {IconMoonStars, IconSun} from "@tabler/icons-react";

const ColorSchemeToggle = () => {
    const {colorScheme, toggleColorScheme} = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    return (
        <UnstyledButton
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
        >
            {dark ? <IconMoonStars/> : <IconSun/>}
        </UnstyledButton>
    )
}

export default ColorSchemeToggle