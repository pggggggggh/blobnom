import React from 'react';
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
import { Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthProvider';

const HeaderComponent = () => {
    const [opened, { toggle, close }] = useDisclosure(false);
    const auth = useAuth();

    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    const menuItems = [
        { label: '홈', link: '/' },
        { label: '마라탕', link: '/' },
        { label: '랭킹', link: '/' },
    ];

    const handleLogout = () => {
        auth.logout();
        close();
    };

    return (
        <>
            <Group
                align="center"
                justify="space-between"
                px="xl"
                py="sm"
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

                <Group align="center" spacing="md">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <Image
                            src={logo}
                            alt="Logo"
                            style={{ objectFit: 'contain', height: '40px' }}
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
                                    style={{ textDecoration: 'none' }}
                                >
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
                                <Link to="/login" style={{ textDecoration: 'none' }}>
                                    <Button variant="light">로그인</Button>
                                </Link>
                            )}
                        </>
                    )}

                    {isSmallScreen && (
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            size="sm"
                            aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
                            color="#fff"
                        />
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
                    position="right"
                    styles={{
                        drawer: {
                            backgroundColor: '#1A1B1E',
                        },
                    }}
                >
                    <Stack spacing="md">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.link}
                                onClick={close}
                                style={{ textDecoration: 'none' }}
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
                                style={{ textDecoration: 'none' }}
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
