import { createFileRoute } from '@tanstack/react-router'
import { PatientsTable } from '@/screens/admin/patients/patients-table'
export const Route = createFileRoute('/_layout/(doctors)/doctor/patients')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PatientsTable/>
  )
}
