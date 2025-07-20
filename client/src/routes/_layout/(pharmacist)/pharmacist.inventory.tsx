import { InventoryTable } from '@/screens/inventory/inventory-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/(pharmacist)/pharmacist/inventory',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <InventoryTable/>
  )
}
