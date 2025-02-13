import {createFileRoute} from '@tanstack/react-router'
import ContestDetailsPage from "../../pages/Contest/ContestDetailsPage.tsx";

export const Route = createFileRoute('/contests/$contestId')({
    component: ContestDetailsPage,
})
