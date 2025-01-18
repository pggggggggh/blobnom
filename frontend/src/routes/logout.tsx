import {createFileRoute} from '@tanstack/react-router'
import {useEffect} from "react";
import {useAuth} from "../context/AuthProvider.tsx";

export const Route = createFileRoute('/logout')({
    component: RouteComponent,
})

function RouteComponent() {
    const auth = useAuth();

    useEffect(() => {
        auth.logout();
    }, []);

    return <div></div>
}
