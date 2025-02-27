import {Burger, Button, Drawer, Flex, Group, Image, Stack, Text} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import logo from '../../assets/blobnom.png';
import {Link} from '@tanstack/react-router';
import {useAuth} from '../../context/AuthProvider.tsx';
import {useSearchStore} from "../../store/searchStore.ts";
import NotificationComponent from "../Header/NotificationComponent.tsx";
import MemberAvatar from "../Header/MemberAvatar.tsx";
import ColorSchemeToggle from "../Header/ColorSchemeToggle.tsx";

const HeaderComponent = () => {
    const [opened, {toggle, close}] = useDisclosure(false);
    const auth = useAuth();
    const {
        init
    } = useSearchStore();

    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    const menuItems = [
        {label: '홈', link: '/'},
        {label: '대회', link: '/contests'},
        {label: '도움말', link: '/about'},
    ];

    const notifications = [
        {id: 1, text: '새로운 대회가 등록되었습니다.', time: '방금 전'},
        {id: 2, text: '회원님의 제출이 평가되었습니다.', time: '1시간 전'},
        {id: 3, text: '새로운 팔로워가 생겼습니다.', time: '2시간 전'},
    ];

    return (
        <>
            <Flex
                align="center"
                justify="space-between"
                px="xl"
                h="inherit"
            >
                <Group align="center">
                    {isSmallScreen && (
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            size="sm"
                            aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
                        />
                    )}
                    <Link to="/" onClick={() => {
                        init()
                        window.scrollTo(0, 0)
                    }} style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
                        <Image src={logo} h="40px"/>
                    </Link>
                    <Group ml="lg" gap="xl">
                        {!isSmallScreen && (
                            <>
                                {menuItems.map((item) => (
                                    <Link key={item.label} to={item.link}>
                                        <Text>{item.label}</Text>
                                    </Link>
                                ))}
                            </>
                        )}
                    </Group>
                </Group>

                <Group align="center" gap="md">
                    <ColorSchemeToggle/>

                    {auth.member && <NotificationComponent notifications={notifications}/>}

                    {!auth.loading && (auth?.member?.handle ? (
                        <MemberAvatar member={auth.member}/>
                    ) : (
                        <Link to="/login" style={{textDecoration: 'none'}}>
                            <Button variant="light">로그인</Button>
                        </Link>
                    ))}
                </Group>
            </Flex>

            {isSmallScreen && (
                <Drawer
                    opened={opened}
                    onClose={close}
                    title="메뉴"
                    padding="md"
                    size="sm"
                    position="left"
                >
                    <Stack gap="md">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.link}
                                onClick={close}
                                style={{textDecoration: 'none'}}
                            >
                                <Button variant="subtle" fullWidth color="white">
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </Stack>
                </Drawer>
            )}
        </>
    );
};

export default HeaderComponent;
