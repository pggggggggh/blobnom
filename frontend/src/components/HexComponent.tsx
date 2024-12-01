import {MissionInfo} from "../types/RoomDetail.tsx";
import {GridGenerator, Hex, Hexagon, HexGrid, Layout, Text as SVGText} from "react-hexgrid";
import {Box, Center} from "@mantine/core";

export const HexComponent = ({missions}: { missions: MissionInfo[] }) => {
    const width: number = (3 + Math.sqrt(12 * missions.length - 3)) / 6 - 1;
    const hexagons = GridGenerator.hexagon(width);

    return (
        <Center h="calc(100vh - var(--app-shell-header-height, 0px) - 32px)">
            <Box className="w-full h-full overflow-auto">
                <HexGrid
                    className="min-w-[800px] min-h-[600px] mx-auto"
                    width="100%"
                    height="97%"
                    viewBox="-120 -120 240 240"
                >
                    <Layout spacing={1.05}>
                        {hexagons.map((hex: Hex, i: number) => (
                            <a
                                key={i}
                                href={`https://www.acmicpc.net/problem/${missions[i].problem_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Hexagon
                                    q={hex.q}
                                    r={hex.r}
                                    s={hex.s}
                                    className="transition fill-zinc-950 hover:fill-zinc-600 active:fill-zinc-700"
                                >
                                    <SVGText fontSize="5" className="fill-zinc-300 font-sans font-extralight stroke-0">
                                        {missions[i].problem_id}
                                    </SVGText>
                                </Hexagon>
                            </a>
                        ))}
                    </Layout>
                </HexGrid>
            </Box>
        </Center>
    );
};
