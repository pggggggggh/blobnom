import {createRootRoute, Outlet, useLocation} from '@tanstack/react-router'
import {AppShell} from "@mantine/core";
import HeaderComponent from "../components/HeaderComponent.tsx";
import {notifications} from "@mantine/notifications";
import {useEffect} from "react";
import NotFound from "../pages/NotFound.tsx";

export const Route = createRootRoute({
    component: RootComponent,
    notFoundComponent: NotFound
})

function RootComponent() {
    const location = useLocation();

    useEffect(() => {
        notifications.clean();
    }, [location.pathname]);

    return (<>
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
    </>)
}