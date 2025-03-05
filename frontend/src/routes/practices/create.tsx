import {createFileRoute} from '@tanstack/react-router'
import CreatePractice from "../../pages/Practice/CreatePractice.tsx";

export const Route = createFileRoute('/practices/create')({
    component: CreatePractice,
})