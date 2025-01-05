export interface LoginPayload {
    handle: string;
    password: string;
    remember_me?: boolean;
}

export interface RegisterPayload {
    handle: string;
    email: string;
    password: string;
}

export interface SolvedAcTokenResponse {
    token: string;
    expires_at: string;
}