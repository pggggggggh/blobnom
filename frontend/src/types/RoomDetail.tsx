import {UserSummary} from "./UserSummary.tsx";

export interface RoomDetail {
    id: number;
    name: string;
    is_started: boolean;
    starts_at: string;
    ends_at: string;
    owner: string;
    num_players: number;
    max_players: number;
    mode_type: string;
    is_private: boolean;
    is_user_in_room: boolean;
    is_owner_a_member: boolean;
    num_missions: number;
    num_solved_missions: number;
    team_info: TeamInfo[];
    mission_info: MissionInfo[];
}

export interface TeamInfo {
    users: RoomPlayerInfo[];
    team_index: number;
    adjacent_solved_count: number;
    total_solved_count: number;
    last_solved_at: string | null;
}

export interface RoomPlayerInfo {
    user: UserSummary;
    indiv_solved_cnt: number;
}

export interface MissionInfo {
    problem_id: number;
    solved_at: string | null;
    solved_player_index: number | null;
    solved_team_index: number;
    solved_user_name: string | null;
    difficulty: number | null;
}
