import {useTranslation} from "react-i18next";
import {useSearchStore} from "../../store/searchStore.ts";
import {useAuth} from "../../context/AuthProvider.tsx";
import {useDebouncedValue} from "@mantine/hooks";
import {useRoomList} from "../../hooks/hooks.tsx";
import dayjs from "dayjs";
import React, {useEffect} from "react";
import {requestNotificationPermission} from "../../utils/NotificationUtils.tsx";
import {Alert, Group, Pagination, Skeleton, Stack} from "@mantine/core";
import RoomFilterComponent from "./RoomFilterComponent.tsx";
import ContestListComponent from "../Contest/ContestListComponent.tsx";
import RoomCard from "./RoomCard.tsx";

const RoomListComponent = () => {
    const {t, i18n} = useTranslation();
    const {
        search,
        page,
        activeOnly,
        myRoomOnly,
        setPage,
    } = useSearchStore();

    const auth = useAuth();

    const [debouncedSearch] = useDebouncedValue(search, 400);
    const actualSearch = debouncedSearch;

    const {data, isLoading, error} = useRoomList(page - 1, actualSearch, activeOnly, myRoomOnly);

    const date = dayjs().utc();

    useEffect(() => {
        requestNotificationPermission();
    }, []);


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };


    const isInitialLoading = isLoading && !data;


    return (
        <>
            <Stack>

                {error && (
                    <Alert title="오류" color="red">
                        데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </Alert>
                )}

                <RoomFilterComponent/>

                {isInitialLoading ? (
                    <Stack>
                        {Array.from({length: 3}).map((_, index) => (
                            <Skeleton key={index} height={50}/>
                        ))}
                    </Stack>
                ) : (
                    data && (
                        <>
                            {data.upcoming_contest_list.length > 0 && (
                                <ContestListComponent
                                    contests={data.upcoming_contest_list}
                                    cur_datetime={date}
                                    border={true}
                                />
                            )}
                            <Stack gap="sm">
                                {data?.room_list?.map((room) => {
                                    return (
                                        !room.is_contest_room &&
                                        <RoomCard roomSummary={room}/>
                                    );
                                })}
                            </Stack>
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
                            size="sm"
                            withEdges
                            onChange={handlePageChange}
                            aria-label="페이지 네비게이션"
                        />
                    )}
                </Group>
            </Stack>
        </>
    );
}

export default RoomListComponent;