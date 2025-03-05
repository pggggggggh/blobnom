import {createFileRoute} from '@tanstack/react-router'
import Practice from "../../pages/Practice/PracticePage.tsx";

export const Route = createFileRoute('/practices/')({
    component: Practice,
})
