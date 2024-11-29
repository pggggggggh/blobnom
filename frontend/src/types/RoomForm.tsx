export interface RoomForm {
    owner: string;
    edit_password: string;
    handles: string;
    title: string;
    query: string;
    size: number;
    is_private: boolean;
    max_players: number;
    starts_at: string;
    ends_at: string;
    entry_pin?: string;
}
