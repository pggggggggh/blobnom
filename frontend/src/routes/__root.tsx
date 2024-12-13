import {createRootRoute, Outlet} from '@tanstack/react-router'
import {AppShell} from "@mantine/core";
import HeaderComponent from "../components/HeaderComponent.tsx";

export const Route = createRootRoute({
    component: () => {
        return (
            <>
                <AppShell
                    header={{height: 60}}
                    padding="md"
                >
                    <AppShell.Header>
                        <HeaderComponent/>
                    </AppShell.Header>
                    <AppShell.Main>
                        <Outlet/>
                    </AppShell.Main>
                </AppShell>
            </>);
    },
})