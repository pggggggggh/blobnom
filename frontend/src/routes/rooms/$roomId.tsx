import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rooms/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {

    const { roomId } = Route.useParams()
  return <div>{roomId}</div>
}
