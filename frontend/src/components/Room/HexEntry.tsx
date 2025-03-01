import {Platform} from "../../types/enum/Platforms.tsx";
import {Button, HoverCard, Text} from "@mantine/core";
import {Hex, Hexagon} from "react-hexgrid";
import {Text as SVGText} from "react-hexgrid/lib/Hexagon/Text";
import {getRatingFill} from "../../utils/MiscUtils.tsx";
import {getDiffTime} from "../../utils/TimeUtils.tsx";
import dayjs from "dayjs";
import {MissionInfo, RoomDetail} from "../../types/RoomDetail.tsx";
import {UseMutationResult} from "@tanstack/react-query";
import {ModeType} from "../../types/enum/ModeType.tsx";


interface HexEntryProps {
    roomDetails: RoomDetail;
    hex: Hex;
    mission: MissionInfo;
    isUnsolvable: boolean;
    mutation: UseMutationResult;
}

const HexEntry = ({roomDetails, hex, mission, isUnsolvable, mutation}: HexEntryProps) => {
    let href;
    if (mission.platform === Platform.BOJ) {
        href = `https://www.acmicpc.net/problem/${mission.problem_id}`
    } else {
        const re = mission.problem_id.split(/(?<=\d)(?=[A-Za-z])/);
        href = `https://codeforces.com/problemset/problem/${re[0]}/${re[1]}`
    }

    return (
        <HoverCard key={mission.id} shadow="lg" position="bottom" offset={-12}
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
                        style={{
                            fill: (!mission.solved_at
                                ? "url(#gradient-null)"
                                : `url(#gradient-${mission.solved_team_index})`),
                            fillOpacity: isUnsolvable && !mission.solved_at ? 0.4 : 0.95,
                            filter: "url(#hexShadow)",
                            transition: "filter 0.1s, fill-opacity 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.filter = "url(#hexShadow) brightness(1.7)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.filter = "url(#hexShadow)";
                        }}
                    >
                        {
                            mission.difficulty != null &&
                            (
                                mission.platform === Platform.BOJ ?
                                    <image
                                        href={`https://storage.googleapis.com/bucket-firogeneral/solvedactier/${mission.difficulty}.png`}
                                        x="-2.5"
                                        y="-8"
                                        width="5"
                                        height="5"
                                        opacity="0.9"
                                    />
                                    :
                                    <SVGText textAnchor="middle" fontSize="3"
                                             y={-4}
                                             className={getRatingFill(mission.difficulty)}>
                                        {mission.difficulty}
                                    </SVGText>
                            )
                        }

                        <SVGText
                            textAnchor="middle"
                            fontSize="5"
                            y={0}
                            className={`
                                                ${
                                mission.solved_at ?
                                    mission.solved_team_index < 7 ? "fill-zinc-200" : "fill-stone-900"
                                    :
                                    "fill-zinc-200"
                            }
                                                tracking-tighter
                                                stroke-0
                                                ${
                                mission.solved_at &&
                                roomDetails.team_info.find(
                                    (team) =>
                                        team.team_index === mission.solved_team_index &&
                                        team.last_solved_at &&
                                        new Date(mission.solved_at).getTime() ===
                                        new Date(team.last_solved_at).getTime()
                                )
                                    ? "font-bold"
                                    : "font-normal"
                            }`}
                        >
                            {roomDetails.mode_type === ModeType.PRACTICE_LINEAR ?
                                `${String.fromCharCode(65 + mission.index_in_room)}` :
                                mission.problem_id}
                        </SVGText>
                        {
                            !mission.solved_at
                                ? <></> :
                                <SVGText
                                    fontSize="3.3"
                                    y={5}
                                    className={`
                                                    ${
                                        mission.solved_at ?
                                            mission.solved_team_index < 7 ? "fill-zinc-200" : "fill-stone-900"
                                            :
                                            "fill-zinc-200"
                                    }
                                                        tracking-tight
                                                        font-light
                                                    stroke-0
                                                    `}
                                >
                                    {getDiffTime(new Date(roomDetails.starts_at), new Date(mission.solved_at))}
                                </SVGText>
                        }
                    </Hexagon>
                </a>
            </HoverCard.Target>
            {
                mission.solved_at ?
                    <HoverCard.Dropdown p="xs"
                                        className={`text-center`}>
                        <Text size="xs">
                            Solved by &nbsp;
                            <strong
                                className={``}>{mission.solved_user_name}</strong>
                        </Text>
                        <Text size="xs">
                            {dayjs(mission.solved_at).format("YYYY/MM/DD HH:mm:ss")}
                        </Text>
                    </HoverCard.Dropdown>
                    :
                    (
                        isUnsolvable ?
                            <HoverCard.Dropdown p="xs"
                                                className={`text-center `}>
                                <Text size="xs">⚠️ 해결할 수 없는 문제입니다.</Text>
                            </HoverCard.Dropdown>
                            :
                            dayjs(roomDetails.ends_at).isAfter(dayjs()) && roomDetails.is_user_in_room &&
                            <HoverCard.Dropdown className="p-0">
                                <Button
                                    variant="default"
                                    size=""
                                    className="border-0 bg-inherit"
                                    onClick={() => mutation.mutate({
                                        roomId: roomDetails.id,
                                        problemId: mission.problem_id
                                    })}
                                    loading={mutation.isPending}
                                >Solve!</Button>
                            </HoverCard.Dropdown>
                    )
            }
        </HoverCard>
    )
}


export default HexEntry;