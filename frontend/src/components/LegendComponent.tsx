import {Box, Text} from "@mantine/core";
import {userColors} from "../constants/UserColors.tsx";
import {PlayerInfo} from "../types/RoomDetail.tsx";

const LegendComponent = ({players}: { players: PlayerInfo[] }) => {
    return (<Box
        className="p-2 fixed bottom-4 right-4 bg-zinc-900 opacity-85 text-white shadow-lg rounded-md max-h-100 overflow-y-auto">
        {players.map((player, i) => {
            return (
                <Box className="flex items-center gap-2">
                    <Box className={`w-4 h-4 ${userColors[i]} rounded`}></Box>
                    <Text
                        className="font-extralight">{player.name} : <strong>{player.adjacent_solved_count}</strong> ({player.total_solved_count})</Text>
                </Box>
            );
        })}
    </Box>);
}

export default LegendComponent;