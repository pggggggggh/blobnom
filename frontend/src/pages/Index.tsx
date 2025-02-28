import React from "react";
import RoomListComponent from "../components/RoomList/RoomListComponent.tsx";
import WithSidebar from "../components/Layout/WithSidebar.tsx";

const Index = () => {
    return (
        <WithSidebar>
            <RoomListComponent/>
        </WithSidebar>

    );
};

export default Index;