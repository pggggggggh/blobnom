import { createFileRoute } from '@tanstack/react-router'
import { Container, Group, Pagination, TextInput } from '@mantine/core'
import { useRoomList } from '../hooks/hooks.tsx'
import SearchIcon from '@mui/icons-material/Search'
import RoomFormComponent from '../components/RoomFormComponent.tsx'
import RoomListComponent from '../components/RoomListComponent.tsx'
import dayjs from 'dayjs'

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
