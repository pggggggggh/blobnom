export interface UserSummary {
    handle: string;
    role: string;
    rating: number;
    guild_mark: string;
    accounts: Record<string, string>;
}