import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(doctors)/doctor/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/(doctors)/doctor/dashboard"!</div>
}
