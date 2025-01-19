import { createFileRoute } from '@tanstack/react-router'
import Index from '../pages/Index.tsx'

export const IndexRoute = createFileRoute('/')({
  component: Index,
})

export const Route = IndexRoute
