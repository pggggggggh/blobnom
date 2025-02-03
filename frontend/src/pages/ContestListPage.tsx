import {Container, Skeleton, Stack} from "@mantine/core";
import {useContestList} from "../hooks/hooks.tsx";
import ContestListComponent from "../components/ContestListComponent.tsx";
import React from "react";
import dayjs from "dayjs";

const ContestListPage = () => {
    const {data, isLoading, error} = useContestList();

    const isInitialLoading = isLoading && !data;
    const date = dayjs().utc()

    return (
        <Container size="lg">
            <Stack>
                {isInitialLoading ? (
                    <Stack>
                        {Array.from({length: 3}).map((_, index) => (
                            <Skeleton key={index} height={50}/>
                        ))}
                    </Stack>
                ) : (
                    data && (
                        <>
                            <ContestListComponent contests={data} cur_datetime={date}/>
                        </>
                    )
                )}
            </Stack>
        </Container>
    )
}

export default ContestListPage;