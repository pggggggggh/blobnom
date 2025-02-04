import RuleIcon from "@mui/icons-material/Rule";
import InfoIcon from '@mui/icons-material/Info';
import TokenOutlinedIcon from '@mui/icons-material/TokenOutlined';
import {Card, SimpleGrid, Text} from "@mantine/core";
import {ContestDetail} from "../../types/ContestDetail.tsx";

const ContestDetailsCards = ({contestDetails}: { contestDetails: ContestDetail }) => {
    const mockdata = [
        {
            title: "대회 정보",
            description: [
                `${!contestDetails.is_rated ? "이 대회는 레이팅을 주지 않습니다." : "이 대회의 결과는 레이팅에 반영됩니다."}`,
                `대회 시작 5분 전까지 등록/취소가 가능합니다.`,
                `참가 자격 : ${contestDetails.min_rating != null ? "레이팅 " + contestDetails.min_rating + "~" + contestDetails.max_rating : '모든 유저'}`,
                `solved.ac 쿼리 : ${contestDetails.query} + 각 방 참가자들이 시도하지 않은 문제`,
                `각 방에 최대 ${contestDetails.players_per_room}명의 인원이 배정되어 ${contestDetails.missions_per_room}문제를 풀게 됩니다.`,
            ],
            icon: InfoIcon,
            iconColor: "text-blue-500"
        },
        {
            title: "대회 규칙",
            description: [
                "대회 시작 전, 'BOJ 설정 - 보기 - solved.ac 티어'를 '보지 않기'로 설정해주세요.",
                "해당 문제의 풀이를 직접 검색하는 것을 제외한 모든 검색이 허용됩니다.",
                "해당 문제의 정답 소스코드를 제외한 모든 소스코드의 복사/붙여넣기가 허용됩니다.",
                "타인과 문제에 대한 어떤 논의도 금지됩니다.",
            ],
            icon: RuleIcon,
            iconColor: "text-green-500"
        },

        {
            title: "진행 방식",
            description: [
                "아직 색칠되지 않은 칸을 선택하여 문제를 풉니다.",
                "Baekjoon Online Judge에서 해당 문제의 \"맞았습니다!!\" 판정을 받은 다음, 칸 하단의 Solve! 버튼을 클릭하여 칸을 색칠합니다.",
                "판 안의 전체 색칠한 칸 수가 아닌, 인접한 최대 칸수가 더 많은 유저가 승리합니다.",
                "인접 칸 수가 같다면, 전체 칸 수를 비교하고, 전체 칸 수도 같다면 마지막 칸을 색칠한 시각이 빠른 사람이 승리합니다.",
                "0점인 유저들끼리는 공동 최하위로 기록됩니다."
            ],
            icon: TokenOutlinedIcon,
            iconColor: "text-yellow-500"
        },
    ];

    return (
        <SimpleGrid cols={{base: 1, sm: 3}} spacing="xl">
            {mockdata.map((feature) => (
                <Card
                    key={feature.title}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                >
                    <feature.icon
                        fontSize="large"
                        className={`${feature.iconColor} mb-4`}
                    />
                    <Text fw={500} size="lg" mb="md">
                        {feature.title}
                    </Text>
                    <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
                        {feature.description.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default ContestDetailsCards;