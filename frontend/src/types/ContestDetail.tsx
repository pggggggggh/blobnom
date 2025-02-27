import {RoomDetail} from "./RoomDetail.tsx";
import {MemberSummary} from "./MemberSummary.tsx";

export interface ContestDetail {
    id: number;
    name: string;
    desc: string;
    query: string;
    starts_at: string;
    ends_at: string;
    num_participants: number;
    participants: MemberSummary[];
    players_per_room: number;
    missions_per_room: number;
    is_user_registered: boolean;
    user_room_id: number;
    room_details: RoomDetail[];
    is_started: boolean;
    is_ended: boolean;
    is_rated: boolean;
    min_rating: number;
    max_rating: number;
}