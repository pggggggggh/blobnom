import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import {createRouter, RouterProvider} from '@tanstack/react-router'

// Import the generated route tree
import {routeTree} from './routeTree.gen'
import '@mantine/core/styles.css';
// import 'main.css'
import {MantineProvider} from "@mantine/core";
import "./main.css"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

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

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <MantineProvider defaultColorScheme="dark">
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router}/>
                </QueryClientProvider>
            </MantineProvider>

        </StrictMode>
    );
}