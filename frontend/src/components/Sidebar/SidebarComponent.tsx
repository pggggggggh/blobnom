import {Stack} from "@mantine/core";
import React from "react";
import StatsCard from "./StatsCard.tsx";
import LeaderboardsCard from "./LeaderboardsCard.tsx";
import NowActiveCard from "./NowActiveCard.tsx";

const SidebarComponent = () => {

    return (
        <Stack>
            {/*<RecentCard/>*/}
            {/*<NowActiveCard/>*/}
            <LeaderboardsCard/>
            <StatsCard/>
        </Stack>
    )
}
export default SidebarComponent