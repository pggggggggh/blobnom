import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
})

function RouteComponent() {
    const {roomId} = Route.useParams()
    const {data: roomDetail, isLoading, error} = useRoomDetail(parseInt(roomId));
    if (isLoading || error || !roomDetail) return (<div></div>);
    return <div>{roomDetail.name}</div>
}
