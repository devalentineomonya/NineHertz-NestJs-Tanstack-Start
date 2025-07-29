import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetTransactions } from "@/services/payments/transaction/use-get-transactions";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { transactionColumns } from "./transaction-table-columns";

export function TransactionsTable() {
  const { data, isLoading } = useGetTransactions();

  const [reference] = useQueryState("reference", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [gateway] = useQueryState(
    "gateway",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data?.data.filter((transaction) => {
      const matchesReference =
        reference === "" ||
        transaction.reference.toLowerCase().includes(reference.toLowerCase());

      const matchesStatus =
        status.length === 0 || status.includes(transaction.status);

      const matchesGateway =
        gateway.length === 0 || gateway.includes(transaction.gateway);

      return matchesReference && matchesStatus && matchesGateway;
    });
  }, [data, reference, status, gateway]);

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: transactionColumns,
    pageCount: Math.ceil((data?.total || 10) / (data?.limit || 10)),
    initialState: {
      pagination: {
        pageIndex: (data?.page ?? 1) - 1,
        pageSize: data?.limit ?? 10,
      },
      sorting: [{ id: "createdAt", desc: true }],
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={transactionColumns.length}
          rowCount={10}
          filterCount={3}
          withPagination={true}
          cellWidths={[
            "40px",
            "160px",
            "120px",
            "120px",
            "180px",
            "180px",
            "140px",
            "140px",
            "100px",
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
