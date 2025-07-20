import { OrdersTable } from "@/screens/order/order-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(patients)/patient/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrdersTable />;
}
