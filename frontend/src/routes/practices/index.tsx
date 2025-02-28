import {createFileRoute} from '@tanstack/react-router'
import Practice from "../../pages/PracticePage.tsx";

export const Route = createFileRoute('/practices/')({
    component: Practice,
})
