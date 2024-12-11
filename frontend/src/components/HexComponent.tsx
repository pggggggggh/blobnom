import {RoomDetail} from "../types/RoomDetail.tsx";
import {GridGenerator, Hex, Hexagon, HexGrid, Layout, Text as SVGText} from "react-hexgrid";
import {Box, Button, Center, HoverCard, Text} from "@mantine/core";
import {useSolveProblem} from "../hooks/hooks.tsx";
import {userColorsFill} from "../constants/UserColorsFill.tsx";
import dayjs from "dayjs";

export const HexComponent = ({roomDetail}: { roomDetail: RoomDetail }) => {
    const missions = roomDetail.mission_info;
    const width: number = (3 + Math.sqrt(12 * missions.length - 3)) / 6 - 1;
    const hexagons = GridGenerator.hexagon(width);
    const mutation = useSolveProblem();

    return (
        <Center h="calc(100vh - var(--app-shell-header-height, 0px) - 32px)">
            <Box w="100%" h="100%">
                <HexGrid
                    className="mx-auto"
                    width="100%"
                    height="97%"
                    viewBox="-105 -120 210 240"
                >
                    <Layout spacing={1.05}>
                        {hexagons.map((hex: Hex, i: number) => (
                            <HoverCard key={`hex${i}`} shadow="md" withArrow position="bottom" offset={-10}
                                       openDelay={mutation.isPending ? 100000 : 0}
                                       closeDelay={mutation.isPending ? 100000 : 0}>
                                <HoverCard.Target>
                                    <a
                                        href={`https://www.acmicpc.net/problem/${missions[i].problem_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Hexagon
                                            q={hex.q}
                                            r={hex.r}
                                            s={hex.s}
                                            className={`transition ${missions[i].solved_at ?
                                                `${userColorsFill[missions[i].solved_team_index]}` : "fill-zinc-950 hover:fill-zinc-600 active:fill-zinc-700"}`}
                                        >
                                            <SVGText fontSize="5"
                                                     className="fill-zinc-100 font-sans font-extralight stroke-0 ">
                                                {missions[i].problem_id}
                                            </SVGText>
                                        </Hexagon>
                                    </a>
                                </HoverCard.Target>
                                {
                                    missions[i].solved_at ?
                                        <HoverCard.Dropdown p="xs" className="text-center">
                                            <Text size="sm">
                                                Solved by <strong>{missions[i].solved_user_name}</strong>
                                            </Text>
                                            <Text size="sm">
                                                {dayjs(missions[i].solved_at).format("YYYY/MM/DD HH:MM:ss")}
                                            </Text>
                                        </HoverCard.Dropdown>
                                        :
                                        dayjs(roomDetail.ends_at).isAfter(dayjs()) &&
                                        <HoverCard.Dropdown className="p-0  ">
                                            <Button
                                                variant="default"
                                                onClick={() => mutation.mutate({
                                                    roomId: roomDetail.id,
                                                    problemId: missions[i].problem_id
                                                })}
                                                loading={mutation.isPending}
                                            >Solve!</Button>
                                        </HoverCard.Dropdown>
                                }

                            </HoverCard>
                        ))}
                    </Layout>
                </HexGrid>
            </Box>
        </Center>
    );
};
