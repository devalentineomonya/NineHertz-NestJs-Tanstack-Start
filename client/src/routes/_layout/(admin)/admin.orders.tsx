import { OrdersTable } from "@/screens/order/order-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OrdersTable />;
}
