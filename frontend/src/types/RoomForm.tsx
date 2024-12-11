export interface RoomForm {
    owner_handle: string;
    edit_password: string;
    handles: { [key: string]: number };
    is_teammode: boolean;
    mode: string;
    title: string;
    query: string;
    size: number;
    is_private: boolean;
    max_players: number;
    starts_at: string;
    ends_at: string;
    entry_pin?: string;
}
