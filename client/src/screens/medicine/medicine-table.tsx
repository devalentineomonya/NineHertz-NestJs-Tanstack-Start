import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetMedicines } from "@/services/medicines/use-get-medicines";
import { useAddMedicineStore } from "@/stores/use-add-medicine-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import { PlusSquare } from "lucide-react";
import { DeleteMedicineModal } from "./delete-medicine-modal";
import { medicineColumns } from "./medicine-table-columns";

export function MedicinesTable() {
  const { onOpen } = useAddMedicineStore();
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();

  // 1. Manage pagination state internally
  const [pagination, setPagination] = useState({
    pageIndex: 0, // TanStack Table uses 0-based indexing
    pageSize: 10,
  });

  // 2. Pass pagination parameters to API hook
  const { data, isLoading } = useGetMedicines({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: medicineColumns,
    pageCount: data?.total ? Math.ceil(data.total / pagination.pageSize) : 0,

    onPaginationChange: setPagination,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={medicineColumns.length}
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
      {currentUser?.role !== "patient" && (
        <div className="w-fit min-w-56 mb-4">
          <Button variant={"primary"} onClick={onOpen}>
            <PlusSquare className="mr-2 h-5 w-5" />
            Add Medicine
          </Button>
        </div>
      )}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeleteMedicineModal />
    </div>
  );
}
