import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@mantine/core'
import RoomFormComponent from '../components/RoomFormComponent.tsx'

export const Route = createFileRoute('/create')({
  component: Index,
})

function Index() {
  // const { data: rooms, isLoading, error } = useRoomList()
  // const date = dayjs().utc()
  // if (isLoading || error) return <div></div>
  return (
    <Container size="lg">
      <RoomFormComponent />
    </Container>
  )
}
