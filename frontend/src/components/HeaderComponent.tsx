import {
    Burger,
    Button,
    Group,
    Image,
    Title,
    Drawer,
    Stack,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import logo from '../assets/blobnom.png';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthProvider.tsx';

const HeaderComponent = () => {
    const [opened, { toggle, close }] = useDisclosure(false);
    const auth = useAuth();
    const navigate = useNavigate();

    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    const menuItems = [
        //{ label: '홈', link: '/' },
    ];

    const handleLogout = () => {
        auth.logout();
        close();
    };

    return (
        <>
            <Group
                h="100%"
                px="md"
                className="justify-between w-full"
                noWrap
            >
                <Group h="100%" gap="md">
                    {isSmallScreen && (
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            size="sm"
                            aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
                        />
                    )}
                    <Link to="/" className="h-full">
                        <Image
                            src={logo}
                            alt="Logo"
                            className="object-contain h-full py-2"
                        />
                    </Link>
                    <Link to="/" className="no-underline text-white">
                        <Title className="font-extralight" order={4}>
                            Blobnom
                        </Title>
                    </Link>
                </Group>

                {!isSmallScreen && (
                    <Group spacing="md">
                        {menuItems.map((item) => (
                            <Link key={item.label} to={item.link} className="no-underline">
                                <Button variant="subtle" color="white">
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                        {auth.user ? (
                            <Button variant="light" onClick={handleLogout}>
                                로그아웃
                            </Button>
                        ) : (
                            <Link to="/login" className="no-underline">
                                <Button variant="light">로그인</Button>
                            </Link>
                        )}
                    </Group>
                )}
            </Group>

            {isSmallScreen && (
                <Drawer
                    opened={opened}
                    onClose={close}
                    title="메뉴"
                    padding="md"
                    size="sm"
                >
                    <Stack>
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.link}
                                onClick={close}
                                className="no-underline"
                            >
                                <Button variant="subtle" fullWidth>
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                        {auth.user ? (
                            <Button variant="light" fullWidth onClick={handleLogout}>
                                로그아웃
                            </Button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={close}
                                className="no-underline"
                            >
                                <Button variant="light" fullWidth>
                                    로그인
                                </Button>
                            </Link>
                        )}
                    </Stack>
                </Drawer>
            )}
        </>
    );
};

export default HeaderComponent;
