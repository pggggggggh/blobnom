import {RoomDetail} from "../../types/RoomDetail.tsx";
import {GridGenerator, Hex, Hexagon, HexGrid, Layout, Text as SVGText} from "react-hexgrid";
import {Button, Center, HoverCard, Paper, Text} from "@mantine/core";
import {useSolveProblem} from "../../hooks/hooks.tsx";
import dayjs from "dayjs";
import {gradientNull, userColors} from "../../constants/UserColorsFill.tsx";
import {getDiffTime} from "../../utils/TimeUtils.tsx";
import {Platform} from "../../types/Platforms.tsx";
import {getRatingFill} from "../../utils/MiscUtils.tsx";

export const HexComponent = ({roomDetail}: { roomDetail: RoomDetail }) => {
    const missions = roomDetail.mission_info;
    const width: number = (3 + Math.sqrt(12 * missions.length - 3)) / 6 - 1;
    const hexagons = GridGenerator.hexagon(width);
    const mutation = useSolveProblem();

    return (
        <Center h="calc(100vh - var(--app-shell-header-height, 0px) - 32px)">
            <Paper w="100%" h="100%" className="flex items-center justify-center">

                <HexGrid
                    className="mx-auto"
                    width="100%"
                    height="97%"
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
                        {hexagons.map((hex: Hex, i: number) => {
                            let href;
                            if (missions[i].platform === Platform.BOJ) {
                                href = `https://www.acmicpc.net/problem/${missions[i].problem_id}`
                            } else {
                                const re = missions[i].problem_id.split(/(?<=\d)(?=[A-Za-z])/);
                                href = `https://codeforces.com/problemset/problem/${re[0]}/${re[1]}`
                            }

                            return (
                                <HoverCard key={`hex${i}`} shadow="lg" position="bottom" offset={-12}
                                           openDelay={mutation.isPending ? 100000 : 0}
                                           closeDelay={mutation.isPending ? 1000 : 0}>
                                    <HoverCard.Target>
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Hexagon
                                                q={hex.q}
                                                r={hex.r}
                                                s={hex.s}
                                                className=" "
                                                style={
                                                    !missions[i].solved_at
                                                        ? {fill: `url(#gradient-null)`}
                                                        : {fill: `url(#gradient-${missions[i].solved_team_index})`}
                                                }
                                            >
                                                {
                                                    missions[i].difficulty != null &&
                                                    (
                                                        missions[i].platform === Platform.BOJ ?
                                                            <image
                                                                href={`https://storage.googleapis.com/bucket-firogeneral/solvedactier/${missions[i].difficulty}.png`}
                                                                x="-2.5"
                                                                y="-8"
                                                                width="5"
                                                                height="5"
                                                            /> :
                                                            <SVGText textAnchor="middle" fontSize="3"
                                                                     y={-4}
                                                                     className={getRatingFill(missions[i].difficulty)}>
                                                                {missions[i].difficulty}
                                                            </SVGText>
                                                    )
                                                }

                                                <SVGText
                                                    textAnchor="middle"
                                                    fontSize="5"
                                                    y={0}
                                                    className={`
                                                ${
                                                        missions[i].solved_at ?
                                                            missions[i].solved_team_index < 7 ? "fill-zinc-200" : "fill-stone-900"
                                                            :
                                                            "fill-zinc-200"
                                                    }
                                                tracking-tighter
                                                stroke-0
                                                ${
                                                        missions[i].solved_at &&
                                                        roomDetail.team_info.find(
                                                            (team) =>
                                                                team.team_index === missions[i].solved_team_index &&
                                                                team.last_solved_at &&
                                                                new Date(missions[i].solved_at).getTime() ===
                                                                new Date(team.last_solved_at).getTime()
                                                        )
                                                            ? "font-bold"
                                                            : "font-normal"
                                                    }`}
                                                >
                                                    {missions[i].problem_id}
                                                </SVGText>
                                                {
                                                    !missions[i].solved_at
                                                        ? <></> :
                                                        <SVGText
                                                            fontSize="3.3"
                                                            y={5}
                                                            className={`
                                                    ${
                                                                missions[i].solved_at ?
                                                                    missions[i].solved_team_index < 7 ? "fill-zinc-200" : "fill-stone-900"
                                                                    :
                                                                    "fill-zinc-200"
                                                            }
                                                        tracking-tight
                                                        font-light
                                                    stroke-0
                                                    `}
                                                        >
                                                            {getDiffTime(new Date(roomDetail.starts_at), new Date(missions[i].solved_at))}
                                                        </SVGText>
                                                }
                                            </Hexagon>
                                        </a>
                                    </HoverCard.Target>
                                    {
                                        missions[i].solved_at ?
                                            <HoverCard.Dropdown p="xs"
                                                                className={`text-center bg-zinc-900`}>
                                                <Text size="xs">
                                                    Solved by &nbsp;
                                                    <strong
                                                        className={``}>{missions[i].solved_user_name}</strong>
                                                </Text>
                                                <Text size="xs">
                                                    {dayjs(missions[i].solved_at).format("YYYY/MM/DD HH:mm:ss")}
                                                </Text>
                                            </HoverCard.Dropdown>
                                            :
                                            dayjs(roomDetail.ends_at).isAfter(dayjs()) && roomDetail.is_user_in_room &&
                                            <HoverCard.Dropdown className="p-0 bg-zinc-900">
                                                <Button
                                                    variant="default"
                                                    size=""
                                                    className="border-0 bg-inherit"
                                                    onClick={() => mutation.mutate({
                                                        roomId: roomDetail.id,
                                                        problemId: missions[i].problem_id
                                                    })}
                                                    loading={mutation.isPending}
                                                >Solve!</Button>
                                            </HoverCard.Dropdown>
                                    }

                                </HoverCard>
                            )
                        })}
                    </Layout>
                </HexGrid>
            </Paper>
        </Center>
    );
};
