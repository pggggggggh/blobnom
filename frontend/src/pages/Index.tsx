
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Container,
  Group,
  Pagination,
  Stack,
  TextInput,
  Skeleton,
  LoadingOverlay
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useDebouncedValue } from "@mantine/hooks";
import dayjs from "dayjs";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import { requestNotificationPermission } from "../utils/NotificationUtils.tsx";
import { useRoomList } from "../hooks/hooks.tsx";
import RoomListComponent from '../components/RoomListComponent.tsx';
import { useSearchStore } from "../store/searchStore.ts";

const Index: React.FC = () => {
  const {
    search,
    page,
    activeOnly,
    setSearch,
    setPage,
    setActiveOnly,
  } = useSearchStore();


  const [debouncedSearch] = useDebouncedValue(search, 400);
  const actualSearch = debouncedSearch;


  const { data, isLoading, error } = useRoomList(page - 1, actualSearch, activeOnly);


  const [showNotice, setShowNotice] = useState(true);
  const date = dayjs().utc();

  useEffect(() => {

    requestNotificationPermission();
  }, []);


  const handleSearchChange = (value: string) => {
    setSearch(value);
  };


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  const handleActiveOnlyChange = (checked: boolean) => {
    setActiveOnly(checked);
  };


  const isInitialLoading = isLoading && !data;

  return (
    <Container size="lg">
      <Stack>
        {showNotice && (
          <Alert
            title="공지"
            withCloseButton
            onClose={() => setShowNotice(false)}
          >
            Blobnom 공식 Discord가 오픈했습니다!{" "}
                        <a
                            href="https://discord.gg/Z7tUQZK8"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://discord.gg/Z7tUQZK8
                        </a>
                        에서 땅따먹기 같이 할 사람을 구해보세요!
          </Alert>
        )}


        <Group className="flex flex-wrap items-center justify-between">
          <TextInput
            placeholder="방 검색..."
            leftSection={<SearchIcon aria-label="검색 아이콘" />}
            value={search}
            onChange={(event) => handleSearchChange(event.currentTarget.value)}
            className="flex-1 min-w-0 mr-2"
            aria-label="방 검색"
          />
          <Link to="/create" className="flex-shrink-0">
            <Button leftSection={<AddIcon />}>
              방 만들기
            </Button>
          </Link>

        </Group>

        <Group className="flex justify-end">
          <Checkbox
            checked={activeOnly}
            onChange={(event) => handleActiveOnlyChange(event.currentTarget.checked)}
            label="참여 가능한 게임만 표시"
            aria-label="참여 가능한 게임만 표시"
          />
        </Group>

        {isInitialLoading ? (
          <Stack>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={50} />
            ))}
          </Stack>
        ) : (
          data && (
            <RoomListComponent rooms={data.room_list} cur_datetime={date} />
          )
        )}


        <Group justify="center" mt="xl">
          {isInitialLoading ? (
            <Skeleton height={40} width={100} />
          ) : (
            <Pagination
              total={data?.total_pages || 1}
              value={page}
              onChange={handlePageChange}
              aria-label="페이지 네비게이션"
            />
          )}
        </Group>


        {error && (
          <Alert title="오류" color="red">
            데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
          </Alert>
        )}
      </Stack>
    </Container>
  );
};

export default Index;
