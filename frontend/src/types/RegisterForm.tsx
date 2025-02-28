import {Platform} from "./enum/Platforms.tsx";

export interface RegisterForm {
    platform: Platform;
    handle: string;
    email: string;
    password: string;
    confirmPassword: string;
}
