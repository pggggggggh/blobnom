import {createFileRoute} from '@tanstack/react-router'
import RoomPage from "../../pages/RoomPage.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RoomPage,
});
