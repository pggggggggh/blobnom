import React from "react";
import {usePracticeRank} from "../hooks/hooks.tsx";
import {useParams} from "@tanstack/react-router";
import PracticeRankTable from "../components/Practice/PracticeRankTable.tsx";
import WithSidebar from "../components/Layout/WithSidebar.tsx";


const PracticeRankPage = () => {
    const {practiceId} = useParams({from: "/practices/$practiceId/rank"});
    const {data, refetch, isPending} = usePracticeRank(practiceId);

    if (!data) return;
    if (data.rank.length === 0) return (
        <>
            No Rank
        </>
    )

    return (
        <WithSidebar>
            <PracticeRankTable data={data} refetch={refetch} isPending={isPending}/>
        </WithSidebar>
    );
}

export default PracticeRankPage;