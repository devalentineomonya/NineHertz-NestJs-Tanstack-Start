import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { inventoryColumns } from "./inventory-table-columns";
import { useGetInventoryItems } from "@/services/inventory/use-get-inventory";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

export function InventoryTable() {
  const { data, isLoading } = useGetInventoryItems();
  const [medicineName] = useQueryState(
    "medicineName",
    parseAsString.withDefault("")
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data?.data.filter((item) => {
      const matchesMedicine =
        medicineName === "" ||
        item.medicine.name.toLowerCase().includes(medicineName.toLowerCase());

      const matchesStatus =
        status.length === 0 ||
        (status.includes("in-stock") &&
          item.quantity > item.reorderThreshold) ||
        (status.includes("low-stock") &&
          item.quantity <= item.reorderThreshold &&
          item.quantity > 0) ||
        (status.includes("out-of-stock") && item.quantity === 0);

      return matchesMedicine && matchesStatus;
    });
  }, [medicineName, status]);

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: inventoryColumns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "lastRestocked", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={inventoryColumns.length}
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
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
