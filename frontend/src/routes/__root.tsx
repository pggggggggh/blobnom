import {createRootRoute, Outlet} from '@tanstack/react-router'
import {AppShell, Burger, Group, Image, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

export const Route = createRootRoute({
    component: () => {
        const [opened, {toggle}] = useDisclosure();

        return (
            <>
                <AppShell
                    header={{height: 60}}
                    padding="md"
                >
                    <AppShell.Header>
                        <Group h="100%" px="md">
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom="sm"
                                size="sm"
                            />
                            <Image py="sm" h="100%" src="blobnom.png"/>
                            <Title order={4}>Blobnom</Title>
                        </Group>
                    </AppShell.Header>
                    <AppShell.Main>
                        <Outlet/>
                    </AppShell.Main>
                </AppShell>
                {/*<TanStackRouterDevtools/>*/}
            </>);
    },
})