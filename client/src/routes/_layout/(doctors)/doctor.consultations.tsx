import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(doctors)/doctor/consultations')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/_layout/(doctors)/doctor/consultations"!</div>
}
