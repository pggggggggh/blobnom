import {createFileRoute} from '@tanstack/react-router'
import RegisterPage from "../pages/RegisterPage.tsx";

export const Route = createFileRoute('/register')({
    component: RegisterPage,
})