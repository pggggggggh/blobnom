import React from "react";
import {Container, Grid} from "@mantine/core";
import SidebarComponent from "../Sidebar/SidebarComponent.tsx";

interface LayoutProps {
    children: React.ReactNode;
}

const WithSidebar: React.FC<LayoutProps> = ({children}) => {
    return (
        <Container size="xl" py="md">
            <Grid>
                <Grid.Col span={{base: 12, md: 8.5}}>
                    {children}
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 3.5}}>
                    <SidebarComponent/>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default WithSidebar;
