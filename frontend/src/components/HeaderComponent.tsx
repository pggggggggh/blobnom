import React from 'react';
import {Avatar, Burger, Button, Drawer, Group, Image, Menu, Stack, Title} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import logo from '../assets/blobnom.png';
import {Link} from '@tanstack/react-router';
import {useAuth} from '../context/AuthProvider';

const HeaderComponent = () => {
    const [opened, {toggle, close}] = useDisclosure(false);
    const auth = useAuth();

    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    const menuItems = [
        // {label: '홈', link: '/'},
        // {label: '대회', link: '/contests'},
        // {label: '도움말', link: '/about'},
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
                    <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
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
                </Group>

                <Group align="center" spacing="md">
                    {!isSmallScreen && (
                        <>
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.link}
                                    style={{textDecoration: 'none'}}
                                >
                                    <Button variant="subtle" color="white">
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </>
                    )}

                    {auth.user ? (
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
                                    {/*<Menu.Item component={Link} to={`/members/profile/${auth.user}`}>*/}
                                    {/*    내 정보*/}
                                    {/*</Menu.Item>*/}
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
                    )}
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
