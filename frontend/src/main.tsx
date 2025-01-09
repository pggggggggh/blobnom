import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import {createRouter, RouterProvider} from '@tanstack/react-router'

// Import the generated route tree
import {routeTree} from './routeTree.gen'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
// import 'main.css'
import {ColorSchemeScript, MantineProvider} from "@mantine/core";
import "./main.css"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/ko";
import utc from 'dayjs/plugin/utc';
import {ModalsProvider} from "@mantine/modals";
import Theme from "./constants/Theme.tsx";
import {Notifications} from "@mantine/notifications";
import {AuthProvider} from "./context/AuthProvider.tsx";

// Create a new router instance
const router = createRouter({routeTree})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById('root')!
const queryClient = new QueryClient();

// dayjs
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale("ko");
dayjs.extend(utc);

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ColorSchemeScript forceColorScheme="dark"/>
                <MantineProvider forceColorScheme="dark"
                                 theme={Theme}>
                    <AuthProvider>
                        <ModalsProvider>
                            <Notifications/>
                            <RouterProvider router={router}/>
                        </ModalsProvider>
                    </AuthProvider>
                </MantineProvider>
            </QueryClientProvider>
        </StrictMode>
    );
}

