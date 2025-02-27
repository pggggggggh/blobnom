import React from "react";
import {Container, Grid} from "@mantine/core";
import RoomListComponent from "../components/RoomList/RoomListComponent.tsx";
import SidebarComponent from "../components/Layout/SidebarComponent.tsx";

const Index = () => {
    return (
        <Container size="xl" py="md">
            <Grid>
                <Grid.Col span={{base: 12, md: 8}}>
                    <RoomListComponent/>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 4}}>
                    <SidebarComponent/>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default Index;