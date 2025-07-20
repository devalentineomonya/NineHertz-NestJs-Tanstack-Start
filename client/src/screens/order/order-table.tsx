import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetOrders } from "@/services/order/use-get-orders";
import { useAddOrderStore } from "@/stores/use-add-order-store";
import { PlusSquare } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { orderColumns } from "./order-table-columns";

export function OrdersTable() {
  const { onOpen } = useAddOrderStore();
  const { data, isLoading } = useGetOrders();
  const [patientName] = useQueryState(
    "patientName",
    parseAsString.withDefault("")
  );
  const [orderStatus] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [paymentStatus] = useQueryState(
    "paymentStatus",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data?.data.filter((order) => {
      const matchesPatient =
        patientName === "" ||
        order.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());

      const matchesOrderStatus =
        orderStatus.length === 0 || orderStatus.includes(order.orderDate);

      const matchesPaymentStatus =
        paymentStatus.length === 0 ||
        paymentStatus.includes(order.paymentStatus);

      return matchesPatient && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [data, patientName, orderStatus, paymentStatus]);

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: orderColumns,
    pageCount: Math.ceil((data?.total || 10) / (data?.limit || 10)),
    initialState: {
      pagination: {
        pageIndex: (data?.page ?? 1) - 1,
        pageSize: data?.limit ?? 10,
      },
      sorting: [{ id: "orderDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={orderColumns.length}
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
      <div className="w-fit min-w-56 mb-2">
        <Button variant={"primary"} onClick={onOpen}>
          <PlusSquare />
          Create Order
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
