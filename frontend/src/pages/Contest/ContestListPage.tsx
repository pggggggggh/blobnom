import {Skeleton, Stack, Title} from "@mantine/core";
import {useContestList} from "../../hooks/hooks.tsx";
import ContestListComponent from "../../components/Contest/ContestListComponent.tsx";
import React from "react";
import dayjs from "dayjs";
import WithSidebar from "../../components/Layout/WithSidebar.tsx";

const ContestListPage = () => {
    const {data, isLoading, error} = useContestList();

    const isInitialLoading = isLoading && !data;
    const date = dayjs().utc()


    return (
        <WithSidebar>
            <Stack>
                <Title>대회</Title>
                {isInitialLoading ? (
                    <Stack>
                        {Array.from({length: 3}).map((_, index) => (
                            <Skeleton key={index} height={50}/>
                        ))}
                    </Stack>
                ) : (
                    data && (
                        <>
                            <ContestListComponent contests={data} cur_datetime={date} border={false}/>
                        </>
                    )
                )}
            </Stack>
        </WithSidebar>
    )
}

export default ContestListPage;