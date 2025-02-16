import React, {useEffect, useState} from "react";
import {Alert, Button, Checkbox, Container, Group, Pagination, Skeleton, Stack, TextInput} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {useDebouncedValue} from "@mantine/hooks";
import dayjs from "dayjs";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import {requestNotificationPermission} from "../utils/NotificationUtils.tsx";
import {useRoomList} from "../hooks/hooks.tsx";
import RoomListComponent from '../components/RoomListComponent.tsx';
import {useSearchStore} from "../store/searchStore.ts";
import {useAuth} from "../context/AuthProvider.tsx";
import ContestListComponent from "../components/Contest/ContestListComponent.tsx";

const Index: React.FC = () => {
    const {
        search,
        page,
        activeOnly,
        myRoomOnly,
        setSearch,
        setPage,
        setActiveOnly,
        setMyRoomOnly
    } = useSearchStore();

    const auth = useAuth();

    const [debouncedSearch] = useDebouncedValue(search, 400);
    const actualSearch = debouncedSearch;

    const {data, isLoading, error} = useRoomList(page - 1, actualSearch, activeOnly, myRoomOnly);

    const [showNotice, setShowNotice] = useState(true);
    const date = dayjs().utc();

    useEffect(() => {
        requestNotificationPermission();
    }, []);


    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1)
    };


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };


    const handleActiveOnlyChange = (checked: boolean) => {
        setActiveOnly(checked);
    };

    const handleMyRoomOnlyChange = (checked: boolean) => {
        setMyRoomOnly(checked);
    }


    const isInitialLoading = isLoading && !data;

    return (
        <Container size="md" my="">
            <Stack>
                {error && (
                    <Alert title="오류" color="red">
                        데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </Alert>
                )}

                {showNotice && (
                    <></>
                )}


                <Group className="flex flex-wrap items-center justify-between">
                    <TextInput
                        placeholder="방 검색..."
                        leftSection={<SearchIcon aria-label="검색 아이콘"/>}
                        value={search}
                        onChange={(event) => handleSearchChange(event.currentTarget.value)}
                        className="flex-1 min-w-0"
                        aria-label="방 검색"
                    />
                    {
                        auth.user &&
                        <Link to="/create" className="flex-shrink-0 ml-2">
                            <Button fw={300} leftSection={<AddIcon/>}>
                                방 만들기
                            </Button>
                        </Link>
                    }

                </Group>

                <Group className="flex justify-end">
                    {
                        auth.user &&
                        <Checkbox
                            checked={myRoomOnly}
                            onChange={(event) => {
                                handleMyRoomOnlyChange(event.currentTarget.checked)
                                setPage(1)
                            }}
                            label="참여중인 방만 표시"
                            aria-label="참여중인 방만 표시"
                        />
                    }
                    <Checkbox
                        checked={activeOnly}
                        onChange={(event) => {
                            handleActiveOnlyChange(event.currentTarget.checked)
                            setPage(1)
                        }}
                        label="진행 중인 공개방만 표시"
                        aria-label="진행 중인 공개방만 표시"
                    />
                </Group>

                {isInitialLoading ? (
                    <Stack>
                        {Array.from({length: 3}).map((_, index) => (
                            <Skeleton key={index} height={50}/>
                        ))}
                    </Stack>
                ) : (
                    data && (
                        <>
                            {data.upcoming_contest_list.length > 0 &&
                                <ContestListComponent contests={data.upcoming_contest_list} cur_datetime={date}
                                                      border={true}/>
                            }
                            <RoomListComponent rooms={data.room_list} cur_datetime={date}/>
                        </>
                    )
                )}


                <Group justify="center" mt="xl">
                    {isInitialLoading ? (
                        <Skeleton height={40} width={100}/>
                    ) : (
                        <Pagination
                            total={data?.total_pages || 1}
                            value={page}
                            onChange={handlePageChange}
                            aria-label="페이지 네비게이션"
                            className="font-extralight"
                        />
                    )}
                </Group>


            </Stack>
        </Container>
    );
};

export default Index;
