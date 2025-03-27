import { createFileRoute } from '@tanstack/react-router'
import AccountSettingsPage from '../pages/Auth/AccountSettingsPage.tsx'

export const Route = createFileRoute('/settings')({
  component: AccountSettingsPage,
})
