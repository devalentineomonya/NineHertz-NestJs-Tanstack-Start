import { AdminInventoryTable } from '@/screens/inventory/inventory-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/(admin)/admin/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
  <AdminInventoryTable/>)
}
