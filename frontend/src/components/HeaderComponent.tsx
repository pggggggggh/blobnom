import {Burger, Group, Image, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import logo from "../../public/blobnom.png"

const HeaderComponent = () => {
    const [opened, {toggle}] = useDisclosure();

    return (
        <Group h="100%" px="md">
            <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
            />
            <Image py="sm" h="100%" src={logo}/>
            <Title order={4}>Blobnom</Title>
        </Group>
    );
};

export default HeaderComponent;
