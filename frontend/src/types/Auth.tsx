import {Platform} from "./Platforms.tsx";

export interface LoginPayload {
    handle: string;
    password: string;
}

export interface RegisterPayload {
    handle: string;
    email: string;
    password: string;
}

export interface BindPayload {
    handle: string;
    platform: Platform
}

export interface SolvedAcTokenResponse {
    token: string;
    expires_at: string;
}