import {Platform} from "./Platforms.tsx";

export interface LoginPayload {
    handle: string;
    password: string;
}

export interface RegisterPayload {
    platform: Platform;
    handle: string;
    email: string;
    password: string;
}

export interface BindPayload {
    handle: string;
    platform: Platform
}

export interface PlatformTokenResponse {
    token: string;
    expires_at: string;
}