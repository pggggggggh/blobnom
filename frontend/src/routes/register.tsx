import { createFileRoute } from '@tanstack/react-router'
import Register from '../pages/Register'

export const RegisterRoute = createFileRoute('/register')({
    component: Register,
})

export const Route = RegisterRoute
