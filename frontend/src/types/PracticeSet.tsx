import {Platform} from "./enum/Platforms.tsx";
import {MemberSummary} from "./MemberSummary.tsx";

export interface PracticeSetSummary {
    id: number;
    name: string;
    author: MemberSummary;
    platform: Platform;
    difficulty: number;
    num_missions: number;
    num_members: number;
    duration: number;
    your_room_id: number | null;
}