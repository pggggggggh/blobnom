export interface PracticeRankData {
    practice_name: string,
    rank: PracticeRank[],
    your_rank: number,
    time: number,
}

export interface PracticeRank {
    running_time: number,
    score: number,
    penalty: number,
    solve_time_list: number[]
}