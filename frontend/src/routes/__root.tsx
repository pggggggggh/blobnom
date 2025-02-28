import {createRootRoute, Outlet, useLocation} from '@tanstack/react-router'
import {AppShell, Box, ScrollArea} from "@mantine/core";
import HeaderComponent from "../components/Header/HeaderComponent.tsx";
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
            header={{height: 50}}
            padding="md"
            styles={{
                main: {height: "100vh"}
            }}
        >
            <AppShell.Header>
                <HeaderComponent/>
            </AppShell.Header>
            <AppShell.Main>
                <ScrollArea h="100%" type="hover">
                    <Box miw="640px">
                        <Outlet/>
                    </Box>
                </ScrollArea>
            </AppShell.Main>
        </AppShell>
    </>)
}