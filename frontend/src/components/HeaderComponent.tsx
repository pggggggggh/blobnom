import {Avatar, Burger, Button, Drawer, Group, Image, Menu, Stack, Title} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import logo from '../assets/blobnom.png';
import {Link} from '@tanstack/react-router';
import {useAuth} from '../context/AuthProvider';
import {useSearchStore} from "../store/searchStore.ts";

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
        // {id: 1, text: '새로운 대회가 등록되었습니다.', time: '방금 전'},
        // {id: 2, text: '회원님의 제출이 평가되었습니다.', time: '1시간 전'},
        // {id: 3, text: '새로운 팔로워가 생겼습니다.', time: '2시간 전'},
    ];

    return (
        <>
            <Group
                align="center"
                justify="space-between"
                px="xl"
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#1A1B1E',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    height: '60px',
                }}
            >

                <Group align="center">
                    {isSmallScreen && (
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            size="sm"
                            aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
                            color="#fff"
                        />
                    )}
                    <Link to="/" onClick={() => {
                        init()
                        window.scrollTo(0, 0)
                    }
                    }
                          style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
                        <Image
                            src={logo}
                            alt="Logo"
                            style={{objectFit: 'contain', height: '40px'}}
                        />
                        <Title
                            order={4}
                            style={{
                                marginLeft: '8px',
                                color: '#fff',
                                fontWeight: 300,
                                textDecoration: 'none',
                            }}
                        >
                            Blobnom
                        </Title>
                    </Link>

                    <div className="ml-5">
                        {!isSmallScreen && (
                            <>
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.link}
                                        style={{textDecoration: 'none'}}
                                    >
                                        <Button className="font-light text-[16px]" variant="subtle" color="white">
                                            {item.label}
                                        </Button>
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>
                </Group>

                <Group align="center" gap="md">
                    {/*{auth.user && (*/}
                    {/*    <Menu shadow="md" width={320} position="bottom-end">*/}
                    {/*        <Menu.Target>*/}
                    {/*            <div className="relative cursor-pointer">*/}
                    {/*                <NotificationsIcon className="text-gray-300 hover:text-white transition-colors"/>*/}
                    {/*                {notifications.length > 0 &&*/}
                    {/*                    <Badge*/}
                    {/*                        className="absolute -top-2 -right-2 font-light"*/}
                    {/*                        size="xs"*/}
                    {/*                        variant="filled"*/}
                    {/*                        color="red"*/}
                    {/*                    >*/}
                    {/*                        {notifications.length}*/}
                    {/*                    </Badge>*/}
                    {/*                }*/}

                    {/*            </div>*/}
                    {/*        </Menu.Target>*/}
                    {/*        <Menu.Dropdown>*/}
                    {/*            <Menu.Label>알림</Menu.Label>*/}
                    {/*            {*/}
                    {/*                notifications.length > 0 ?*/}
                    {/*                    (*/}
                    {/*                        notifications.map((notification) => (*/}
                    {/*                            <Menu.Item*/}
                    {/*                                key={notification.id}*/}
                    {/*                            >*/}
                    {/*                                <div className="flex flex-col">*/}
                    {/*                                    <span className="text-sm">{notification.text}</span>*/}
                    {/*                                    <span*/}
                    {/*                                        className="text-xs text-gray-500">{notification.time}</span>*/}
                    {/*                                </div>*/}
                    {/*                            </Menu.Item>*/}
                    {/*                        )))*/}
                    {/*                    :*/}
                    {/*                    <Menu.Item*/}
                    {/*                    >*/}
                    {/*                        <span className="text-sm">알림이 없습니다.</span>*/}
                    {/*                    </Menu.Item>*/}
                    {/*            }*/}
                    {/*        </Menu.Dropdown>*/}
                    {/*    </Menu>*/}
                    {/*)}*/}

                    {!auth.loading && (auth.user ? (
                        <Group align="center">
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Avatar
                                        name={auth.user}
                                        color="initials"
                                        radius="xl"
                                        alt="유저 프로필"
                                        className="cursor-pointer"
                                    />
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item component={Link} to={`members/${auth.user}`}>
                                        내 정보
                                    </Menu.Item>
                                    <Menu.Item color="red" component={Link} to="/logout">
                                        로그아웃
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>


                        </Group>
                    ) : (
                        <Link to="/login" style={{textDecoration: 'none'}}>
                            <Button variant="light">로그인</Button>
                        </Link>
                    ))}
                </Group>
            </Group>

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
