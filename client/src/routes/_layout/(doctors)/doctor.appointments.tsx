import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(doctors)/doctor/appointments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/(doctors)/doctor/appointments"!</div>
}
