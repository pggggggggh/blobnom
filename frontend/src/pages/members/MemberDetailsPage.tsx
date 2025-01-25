import {Route} from "../../routes/members/profile/$handle.tsx"
import {Center, Container, Title} from "@mantine/core";

const MemberDetailsPage = () => {
    const {handle} = Route.useParams()
    return (
        <Container size="lg">
            <Center>
                <Title>
                    {handle}
                </Title>
            </Center>
        </Container>
    )
}

export default MemberDetailsPage;