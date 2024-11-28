export interface RoomSummary {
    id: number;
    name: string;
    starts_at: Date;
    ends_at: Date;
    num_players: number;
    max_players: number;
    isPrivate: boolean;
}
