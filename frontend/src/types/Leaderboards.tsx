import {MemberSummary} from "./MemberSummary.tsx";

export interface LeaderboardsEntry {
    member_summary: MemberSummary;
    points: number
    num_solved_missions: number
}

export interface Leaderboards {
    updated_at: string;
    leaderboards: LeaderboardsEntry[];
}