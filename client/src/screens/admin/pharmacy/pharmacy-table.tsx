import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { DeletePharmacyConfirmModal } from "./delete-pharmacy-confirm-modal";
import { pharmacyColumns } from "./pharmacy-table-columns";
import { useGetPharmacies } from "@/services/pharmacies/use-get-pharmacies";
import { useAddPharmacyStore } from "@/stores/use-add-pharmacy-store";
import { PlusSquare } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

export function AdminPharmacy() {
  const { onOpen } = useAddPharmacyStore();
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [name] = useQueryState("name", parseAsString.withDefault(""));

  // Fetch pharmacy data
  const { data: pharmacies, isLoading } = useGetPharmacies();

  // Filter data based on query parameters
  const filteredData = React.useMemo(() => {
    return pharmacies?.filter((pharmacy) => {
      const matchesName =
        name === "" || pharmacy.name.toLowerCase().includes(name.toLowerCase());

      return matchesName;
    });
  }, [name, pharmacies]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredData?.slice(start, start + perPage) || [];
  }, [filteredData, page, perPage]);

  const pageCount = Math.ceil((filteredData?.length || 0) / perPage);

  // Initialize data table
  const { table } = useDataTable({
    data: paginatedData ?? [],
    columns: pharmacyColumns,
    pageCount,
    initialState: {
      sorting: [{ id: "name", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={pharmacyColumns.length}
          rowCount={10}
          filterCount={1}
          optionsCount={2}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "120px",
            "200px",
            "180px",
            "150px",
            "100px",
            "100px",
            "100px",
            "40px",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="w-fit min-w-56 mb-2">
        <Button variant={"primary"} onClick={onOpen}>
          <PlusSquare />
          Add Pharmacy
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeletePharmacyConfirmModal />
    </div>
  );
}
