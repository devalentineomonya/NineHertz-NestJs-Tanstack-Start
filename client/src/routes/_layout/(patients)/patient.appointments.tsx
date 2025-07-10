import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/(patients)/patient/appointments',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/(patients)/patient/appointments"!</div>
}
