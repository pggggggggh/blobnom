import {createFileRoute} from '@tanstack/react-router'
import ContestListPage from "../../pages/Contest/ContestListPage.tsx";

export const Route = createFileRoute('/contests/')({
    component: ContestListPage,
})
