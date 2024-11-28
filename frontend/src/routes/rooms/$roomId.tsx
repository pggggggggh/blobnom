import * as React from 'react'
import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
})

function RouteComponent() {
    const {roomId} = Route.useParams()
    const {data: roomDetail, isLoading, error} = useRoomDetail(roomId);
    if (isLoading || error) return (<div></div>);
    console.log(roomDetail)
    return <div>{roomId}</div>
}
