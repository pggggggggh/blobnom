import {createContext, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {useAuth} from "./AuthProvider.tsx";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({children}: { children: React.ReactNode }) => {
    const auth = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            auth: {handle: auth.user},
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Socket connected");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [auth.user]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    return useContext(SocketContext);
};
