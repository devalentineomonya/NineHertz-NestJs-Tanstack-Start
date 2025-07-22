import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useAddPatientStore } from "@/stores/use-add-patient-store";
import { PlusSquare } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { DeletePatientConfirmModal } from "./delete-patient-confirm";
import { patientColumns } from "./patient-table-columns";
import { useUserSessionStore } from "@/stores/user-session-store";
import { ColumnFiltersState } from "@tanstack/react-table";

export function PatientsTable() {
  const { data: patients = [], isLoading } = useGetPatients();
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  const { onOpen: onPatientDrawerOpen } = useAddPatientStore();

  // Use TanStack Table's built-in filtering instead of manual filtering
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>();

  const { table } = useDataTable({
    data: patients,
    columns: patientColumns,
    // Let TanStack handle pagination
    pageCount: Math.ceil(patients.length / 10),
    // Pass filter state to table
    onColumnFiltersChange: (updaterOrValue) => {
      const updatedFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters ?? [])
          : [...updaterOrValue];
      setColumnFilters(updatedFilters);
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
      sorting: [{ id: "fullName", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={patientColumns.length}
          rowCount={10}
          filterCount={5}
          optionsCount={2}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "120px",
            "200px",
            "180px",
            "180px",
            "120px",
            "100px",
            "140px",
            "140px",
            "40px",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="data-table-container">
      {currentUser?.role === "admin" && (
        <div className="w-fit min-w-56 mb-2">
          <Button variant={"primary"} onClick={onPatientDrawerOpen}>
            <PlusSquare />
            Add Patient
          </Button>
        </div>
      )}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeletePatientConfirmModal />
    </div>
  );
}
