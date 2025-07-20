import { MedicinesTable } from "@/screens/medicine/medicine-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/(doctors)/doctor/medicine")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MedicinesTable />;
}
