import {UserSummary} from "./UserSummary.tsx";

export interface MainData {
    total_pages: number;
    room_list: RoomSummary[];
    upcoming_contest_list: ContestSummary[];
}

export interface RoomSummary {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
    owner: UserSummary;
    num_players: number;
    max_players: number;
    is_private: boolean;
    num_missions: number;
    num_solved_missions: number;
}

export interface ContestSummary {
    id: number;
    name: string;
    query: string;
    starts_at: string;
    ends_at: string;
    num_participants: number;
    players_per_room: number;
    missions_per_room: number;
}