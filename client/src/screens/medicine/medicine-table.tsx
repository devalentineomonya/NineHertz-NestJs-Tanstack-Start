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
  const { data, isLoading } = useGetMedicines();
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: medicineColumns,
    pageCount: Math.ceil((data?.total || 10) / (data?.limit || 10)),
    initialState: {
      pagination: {
        pageIndex: (data?.page ?? 1) - 1,
        pageSize: data?.limit ?? 10,
      },
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
      {/* {currentUser?.role === "admin" ||
        (currentUser?.role === "pharmacist" && ( */}
          <div className="w-fit min-w-56 mb-4">
            <Button variant={"primary"} onClick={onOpen}>
              <PlusSquare className="mr-2 h-5 w-5" />
              Add Medicine
            </Button>
          </div>
        {/* ))} */}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeleteMedicineModal />
    </div>
  );
}
