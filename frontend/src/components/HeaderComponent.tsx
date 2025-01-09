import { Burger, Button, Group, Image, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import logo from "../assets/blobnom.png";
import { Link } from "@tanstack/react-router";

const HeaderComponent = () => {
    const [opened, { toggle }] = useDisclosure();
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;

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
                {isLoggedIn ? (
                    <Link to="/mypage" className="no-underline text-white">
                        <Button variant="light">내 정보</Button>
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
