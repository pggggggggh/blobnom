import {createFileRoute} from '@tanstack/react-router'
import ContestListPage from "../../pages/ContestListPage.tsx";

export const Route = createFileRoute('/contests/')({
    component: ContestListPage,
})
