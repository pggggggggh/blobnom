import {Box, Text} from "@mantine/core";
import {TeamInfo} from "../types/RoomDetail.tsx";
import {userColorsBg} from "../constants/UserColorsFill.tsx";

const LegendComponent = ({teams}: { teams: TeamInfo[] }) => {
    return (<div
        className="p-2 fixed bottom-4 right-4 bg-zinc-900 opacity-75 text-white shadow-lg rounded-sm max-h-100 overflow-y-auto z-0">
        {teams.map((team, i) => {
            return (
                <Box key={i} className="flex items-center gap-2">
                    <Box className={`${userColorsBg[team.team_index]} w-4 h-4 rounded-sm`}></Box>
                    <Text className="font-light">
                        {team.users
                            .map((user, idx) => (
                                <span key={user.name}>
                                    <span className={idx === 0 ? "font-bold" : ""}>
                                        {user.name}
                                    </span>
                                    ({user.indiv_solved_cnt})
                                    {idx < team.users.length - 1 && ", "}
                                </span>
                            ))}
                        &nbsp;: <span
                        className="font-bold">{team.adjacent_solved_count}</span> ({team.total_solved_count})
                    </Text>
                </Box>
            );
        })}
    </div>);
}

export default LegendComponent;