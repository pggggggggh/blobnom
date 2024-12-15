import {Burger, Group, Image, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import logo from "../assets/blobnom.png"

const HeaderComponent = () => {
    const [opened, {toggle}] = useDisclosure();

    return (
        <Group h="100%" px="md" gap="md">
            <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
            />

            <a href="/" className="h-full">
                <Image
                    src={logo}
                    alt="Logo"
                    className="object-contain h-full py-2"
                />
            </a>
            <a href="/" className="no-underline text-white">
                <Title className="font-extralight" order={4}>Blobnom</Title>
            </a>
        </Group>
    );
};

export default HeaderComponent;
