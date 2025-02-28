import {Platform} from "./enum/Platforms.tsx";

export interface PracticeSetSummary {
    id: number;
    name: string;
    platform: Platform;
    difficulty: number;
    num_missions: number;
    duration: number;
    your_room_id: number | null;
}