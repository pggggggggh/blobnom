import {createLazyFileRoute} from '@tanstack/react-router'

export const Route = createLazyFileRoute('/rooms')({
    component: RoomDetail,
})

function RoomDetail() {
    return 'Hello /room!'
}
