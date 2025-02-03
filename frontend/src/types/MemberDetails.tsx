export interface MemberDetails {
    handle: string;
    desc: string;
    rating: number;
    contest_history: ContestHistory[];
    num_solved_missions: number;
}

export interface ContestHistory {
    rating_before: number;
    rating_after: number;
    contest_id: number;
    contest_name: string;
    final_rank: number;
    is_rated: boolean;
    started_at: string;
    performance: number;
}