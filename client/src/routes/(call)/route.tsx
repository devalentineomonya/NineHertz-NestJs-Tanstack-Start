import { StreamVideoProvider } from '@/providers/stream-client-provider'
import { Outlet } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(call)')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <StreamVideoProvider>
        <Outlet/>
    </StreamVideoProvider>
  )
}
