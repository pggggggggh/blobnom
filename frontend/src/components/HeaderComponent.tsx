import {Burger, Button, Group, Image, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import logo from "../assets/blobnom.png";
import {Link} from "@tanstack/react-router";
import {useAuth} from "../context/AuthProvider.tsx";

const HeaderComponent = () => {
    const [opened, {toggle}] = useDisclosure();
    const auth = useAuth()

    return (
        <Group h="100%" px="md" gap="md" className="justify-between w-full">
            <Group h="100%" gap="md">
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

            <Group>
                {auth.user ? (
                    <Link to="/mypage" className="no-underline text-white">
                        <Button variant="light">{`${auth.user} 정보`}</Button>
                    </Link>
                ) : (
                    <Link to="/login" className="no-underline text-white">
                        <Button variant="light">로그인</Button>
                    </Link>
                )}
            </Group>
        </Group>
    );
};

export default HeaderComponent;
