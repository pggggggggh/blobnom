import { createFileRoute } from '@tanstack/react-router'
import MemberProfilePage from '../../pages/MemberProfilePage.tsx'

export const Route = createFileRoute('/members/$handle')({
  component: MemberProfilePage,
})
