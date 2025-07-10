import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/(pharmacist)/pharmacist/prescriptions',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_layout/(pharmacist)/pharmacist/prescriptionspharmacist/prescriptions"!
    </div>
  )
}
