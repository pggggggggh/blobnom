import {createFileRoute} from '@tanstack/react-router'
import PracticeRankPage from "../../../pages/Practice/PracticeRankPage.tsx";

export const Route = createFileRoute('/practices/$practiceId/rank')({
    component: PracticeRankPage,
})
