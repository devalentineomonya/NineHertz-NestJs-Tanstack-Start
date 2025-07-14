import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(admin)/admin/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/(admin)/admin/profile"!</div>
}
