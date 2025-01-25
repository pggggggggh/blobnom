export interface ContestDetail {
    id: number;
    name: string;
    query: string;
    starts_at: string;
    ends_at: string;
    num_participants: number;
    participants: string[];
    players_per_room: number;
    missions_per_room: number;
    is_user_registered: boolean;
}