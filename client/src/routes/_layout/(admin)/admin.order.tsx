import { AdminOrdersTable } from '@/screens/admin/order/order-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(admin)/admin/order')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
<AdminOrdersTable/>
)
}
