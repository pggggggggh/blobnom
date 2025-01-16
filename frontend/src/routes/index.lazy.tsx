import {createLazyFileRoute} from '@tanstack/react-router';
import MainPage from "../pages/MainPage.tsx";

export const Route = createLazyFileRoute('/')({
    component: MainPage,
});

