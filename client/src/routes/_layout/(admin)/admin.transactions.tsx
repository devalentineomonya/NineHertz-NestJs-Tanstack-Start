import { TransactionsTable } from "@/screens/transactions/transactions-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(admin)/admin/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TransactionsTable />;
}
