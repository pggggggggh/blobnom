import {createFileRoute} from '@tanstack/react-router'
import SettingsPage from "../../pages/SettingsPage.tsx";

export const Route = createFileRoute('/members/settings')({
    component: SettingsPage,
})
