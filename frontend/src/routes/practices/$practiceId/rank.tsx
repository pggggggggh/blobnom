import {createFileRoute} from '@tanstack/react-router'
import PracticeRankPage from "../../../pages/PracticeRankPage.tsx";

export const Route = createFileRoute('/practices/$practiceId/rank')({
    component: PracticeRankPage,
})
