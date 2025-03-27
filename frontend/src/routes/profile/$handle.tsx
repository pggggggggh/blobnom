import { createFileRoute } from '@tanstack/react-router'
import MemberProfilePage from '../../pages/MemberProfilePage.tsx'

export const Route = createFileRoute('/profile/$handle')({
  component: MemberProfilePage,
})
