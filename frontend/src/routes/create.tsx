import { createFileRoute } from '@tanstack/react-router'
import CreateRoom from '../pages/CreateRoom.tsx'

export const CreateRoute = createFileRoute('/create')({
  component: CreateRoom,
})

export const Route = CreateRoute
