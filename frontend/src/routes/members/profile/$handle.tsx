import {createFileRoute} from '@tanstack/react-router'
import MemberDetailsPage from "../../../pages/members/MemberDetailsPage.tsx";

export const Route = createFileRoute('/members/profile/$handle')({
    component: MemberDetailsPage,
})