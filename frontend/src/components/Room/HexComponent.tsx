import {RoomDetail} from "../../types/RoomDetail.tsx";
import {GridGenerator, Hex, HexGrid, Layout} from "react-hexgrid";
import {Box} from "@mantine/core";
import {useSolveProblem} from "../../hooks/hooks.tsx";
import {gradientNull, userColors} from "../../constants/UserColorsFill.tsx";
import {useEffect, useState} from "react";
import HexEntry from "./HexEntry.tsx";

export const HexComponent = ({roomDetails}: { roomDetails: RoomDetail }) => {
    const missions = roomDetails.mission_info;
    const width: number = (3 + Math.sqrt(12 * missions.length - 3)) / 6 - 1;
    const hexagons = GridGenerator.hexagon(width);
    const mutation = useSolveProblem();
    const [unSolvableMissionsSet, setUnSolvbleMissionsSet] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!roomDetails) return;
        setUnSolvbleMissionsSet(new Set(roomDetails.your_unsolvable_mission_ids));
    }, [roomDetails]);

    return (
        <Box h="100%">
            <HexGrid
                width="100%"
                height="100%"
                viewBox="-105 -120 210 240"
            >
                <defs>
                    <linearGradient
                        id={`gradient-null`}
                        key={`gradient-null`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" style={{stopColor: gradientNull[1], stopOpacity: 1}}/>
                        <stop offset="100%" style={{stopColor: gradientNull[0], stopOpacity: 1}}/>
                    </linearGradient>
                    {userColors.map((g, i) => (
                        <linearGradient
                            id={`gradient-${i}`}
                            key={`gradient-${i}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%"
                                  style={{stopColor: g[0], stopOpacity: 1}}/>
                            <stop offset="100%"
                                  style={{stopColor: g[1], stopOpacity: 1}}/>
                        </linearGradient>
                    ))}
                </defs>
                <Layout spacing={1.04}>
                    {hexagons.map((hex: Hex, i: number) => (
                        <HexEntry roomDetails={roomDetails} hex={hex} mission={missions[i]}
                                  isUnsolvable={unSolvableMissionsSet.has(missions[i].id)}
                                  mutation={mutation}/>
                    ))}
                </Layout>
            </HexGrid>
        </Box>
    );
};
