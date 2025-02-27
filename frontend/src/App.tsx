import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import {useSearchStore} from "./store/searchStore.ts";
import {useEffect} from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import queryClient from "./api/QueryClient.tsx";
import {AuthProvider} from "./context/AuthProvider.tsx";
import {SocketProvider} from "./context/SocketProvider.tsx";
import {MantineProvider} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import {Notifications} from "@mantine/notifications";
import {RouterProvider} from "@tanstack/react-router";
import router from "./router.tsx";
import theme from "./constants/Theme.tsx";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.locale("ko");
dayjs.extend(utc);

const App = () => {
    const {search, page, activeOnly, setSearch, setPage, setActiveOnly} = useSearchStore();

    useEffect(() => {
        const state = {search, page, activeOnly};
        window.history.pushState(state, '', window.location.pathname);
    }, [search, page, activeOnly]);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state) {
                const {search, page, activeOnly} = event.state;
                setSearch(search || '');
                setPage(page || 1);
                setActiveOnly(activeOnly || false);
            }
        };

        window.addEventListener('popstate', handlePopState);

        if (window.history.state) {
            const {search, page, activeOnly} = window.history.state;
            setSearch(search || '');
            setPage(page || 1);
            setActiveOnly(activeOnly || false);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [setSearch, setPage, setActiveOnly]);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SocketProvider>
                    <MantineProvider theme={theme} defaultColorScheme="light">
                        <ModalsProvider>
                            <Notifications limit={10} position="top-right"/>
                            <RouterProvider router={router}/>
                        </ModalsProvider>
                    </MantineProvider>
                </SocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App