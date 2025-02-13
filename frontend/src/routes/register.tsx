import {createFileRoute} from '@tanstack/react-router'
import Register from '../pages/Auth/Register.tsx'

export const RegisterRoute = createFileRoute('/register')({
    component: Register,
})

export const Route = RegisterRoute
