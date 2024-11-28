export interface RoomDetail {
    starts_at: string;
    ends_at: string;
    id: number;
    name: string;
    is_private: boolean;
    num_missions: number;
    player_info: PlayerInfo[];
    mission_info: MissionInfo[];
}

export interface PlayerInfo {
    user_id: number;
    name: string;
    player_index: number;
    adjacent_solved_count: number;
    total_solved_count: number;
    last_solved_at: string | null;
}

export interface MissionInfo {
    problem_id: number;
    solved_at: string | null;
    solved_player_index: number | null;
    solved_user_name: string | null;
}
