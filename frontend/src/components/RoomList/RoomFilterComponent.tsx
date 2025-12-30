import React from "react";
import {Button, Checkbox, Flex, Group, TextInput} from "@mantine/core";
import SearchIcon from "@mui/icons-material/Search";
import {Link} from "@tanstack/react-router";
import {useSearchStore} from "../../store/searchStore.ts";
import {useAuth} from "../../context/AuthProvider.tsx";
import {useTranslation} from "react-i18next";
import {IconHexagonPlus2} from "@tabler/icons-react";

const RoomFilterComponent = () => {
    const {t} = useTranslation();
    const {
        search,
        activeOnly,
        myRoomOnly,
        setSearch,
        setActiveOnly,
        setMyRoomOnly,
        setPage
    } = useSearchStore();

    const auth = useAuth();

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleActiveOnlyChange = (checked: boolean) => {
        setActiveOnly(checked);
        setPage(1);
    };

    const handleMyRoomOnlyChange = (checked: boolean) => {
        setMyRoomOnly(checked);
        setPage(1);
    };

    return (
        <>
            <Flex>
                <TextInput
                    placeholder={t("방 검색")}
                    leftSection={<SearchIcon aria-label="검색 아이콘"/>}
                    value={search}
                    onChange={(event) => handleSearchChange(event.currentTarget.value)}
                    className="flex-1 min-w-0"
                    aria-label="방 검색"
                />
                {auth.member && (
                    <Link to="/create" className="flex-shrink-0 ml-2">
                        <Button leftSection={<IconHexagonPlus2/>}>
                            {t("방 만들기")}
                        </Button>
                    </Link>
                )}
            </Flex>

            <Group className="flex justify-end">
                {/*{auth.member && (*/}
                {/*    <Checkbox*/}
                {/*        checked={myRoomOnly}*/}
                {/*        onChange={(event) => handleMyRoomOnlyChange(event.currentTarget.checked)}*/}
                {/*        label={t("참여중인 방만 표시")}*/}
                {/*    />*/}
                {/*)}*/}
                <Checkbox
                    checked={activeOnly}
                    onChange={(event) => handleActiveOnlyChange(event.currentTarget.checked)}
                    label={t("진행중인 공개방만 표시")}
                />
            </Group>
        </>
    );
};

export default RoomFilterComponent;
