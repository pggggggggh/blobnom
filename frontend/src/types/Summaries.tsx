import {MemberSummary} from "./MemberSummary.tsx";
import {Platform} from "./Platforms.tsx";

export interface MainData {
    total_pages: number;
    room_list: RoomSummary[];
    upcoming_contest_list: ContestSummary[];
}

export interface RoomSummary {
    id: number;
    name: string;
    platform: Platform;
    starts_at: string;
    ends_at: string;
    owner: MemberSummary;
    num_players: number;
    max_players: number;
    is_private: boolean;
    num_missions: number;
    num_solved_missions: number
    is_contest_room: boolean;
}

export interface ContestSummary {
    id: number;
    desc: string;
    name: string;
    query: string;
    starts_at: string;
    ends_at: string;
    num_participants: number;
    players_per_room: number;
    missions_per_room: number;
    min_rating: number;
    max_rating: number;
}