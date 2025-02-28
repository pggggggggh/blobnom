import {Stack} from "@mantine/core";
import React from "react";
import StatsCard from "./StatsCard.tsx";
import LeaderboardsCard from "./LeaderboardsCard.tsx";

const SidebarComponent = () => {

    return (
        <Stack>
            {/*<RecentCard/>*/}
            <LeaderboardsCard/>
            <StatsCard/>
        </Stack>
    )
}
export default SidebarComponent