export interface RoomInfo {
    id: number;
    name: string;
    startsAt: Date;
    endsAt: Date;
    num_players: number;
    max_players: number;
    isPrivate: boolean;
}