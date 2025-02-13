import {createFileRoute} from '@tanstack/react-router'
import Login from '../pages/Auth/Login.tsx'

export const LoginRoute = createFileRoute('/login')({
    component: Login,
})

export const Route = LoginRoute
