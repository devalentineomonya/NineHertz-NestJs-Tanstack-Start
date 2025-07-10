import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(patients)/patient/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/(patients)/patient/settings"!</div>
}
