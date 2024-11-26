export interface RoomListDTO {
    privateroom: RoomInfo[];
    publicroom: RoomInfo[];
}

export interface RoomInfo {
    id: string;
    name: string;
    size: number;
    begin: string;
    end: string;
    public: boolean;
    users: number;
    top_user: {
        name: string | null;
        score: number;
        score2?: number;
    };
}