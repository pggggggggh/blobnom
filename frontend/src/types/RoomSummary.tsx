export interface RoomSummary {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
    owner: string;
    num_players: number;
    max_players: number;
    is_private: boolean;
    num_missions: number;
    num_solved_missions: number;
}
