"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetOrders } from "@/services/order/use-get-orders";
import { useAddOrderStore } from "@/stores/use-add-order-store";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeftRight,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Package,
  PlusSquare,
  RefreshCw,
  ShoppingCart,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

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

  const columns = React.useMemo<ColumnDef<OrderResponseDto>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "order",
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ShoppingCart className="size-5 text-blue-500" />
            <div>
              <div className="font-medium">
                ORD-{row.original.id.substring(0, 8)}
              </div>
              <div className="text-sm text-gray-500">
                {row.original.createdAt}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Order",
          placeholder: "Search orders...",
          variant: "text",
          icon: ShoppingCart,
        },
        enableColumnFilter: true,
      },
      {
        id: "patient",
        accessorFn: (row) => row.patient.fullName,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Patient" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
            <div className="font-medium">{row.original.patient.fullName}</div>
          </div>
        ),
        meta: {
          label: "Patient",
          placeholder: "Search patients...",
          variant: "text",
          icon: User,
        },
        enableColumnFilter: true,
      },
      {
        id: "items",
        header: "Items",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Package className="size-4 text-gray-500" />
            <span>
              {row.original.items.length} item
              {row.original.items.length > 1 ? "s" : ""}
            </span>
          </div>
        ),
      },
      {
        id: "total",
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ cell }) => {
          const amount = cell.getValue<number>();
          return <div className="font-medium">${amount.toFixed(2)}</div>;
        },
        enableSorting: true,
      },
      {
        id: "orderStatus",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order Status" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<OrderStatus>();
          let variant:
            | "default"
            | "secondary"
            | "warning"
            | "success"
            | "destructive";
          let icon: React.ReactNode;

          switch (status) {
            case OrderStatus.PENDING:
              variant = "secondary";
              icon = <Clock className="size-4" />;
              break;
            case OrderStatus.PROCESSING:
              variant = "warning";
              icon = <RefreshCw className="size-4" />;
              break;
            case OrderStatus.SHIPPED:
              variant = "warning";
              icon = <Truck className="size-4" />;
              break;
            case OrderStatus.DELIVERED:
              variant = "success";
              icon = <CheckCircle className="size-4" />;
              break;
            case OrderStatus.CANCELLED:
              variant = "destructive";
              icon = <XCircle className="size-4" />;
              break;
            case OrderStatus.RETURNED:
              variant = "destructive";
              icon = <ArrowLeftRight className="size-4" />;
              break;
            default:
              variant = "default";
          }

          return (
            <Badge variant={variant} className="capitalize gap-2">
              {icon}
              {status}
            </Badge>
          );
        },
        meta: {
          label: "Order Status",
          variant: "multiSelect",
          options: Object.values(OrderStatus).map((status) => ({
            label: status.charAt(0).toUpperCase() + status.slice(1),
            value: status,
            icon:
              status === OrderStatus.PENDING
                ? Clock
                : status === OrderStatus.PROCESSING
                ? RefreshCw
                : status === OrderStatus.SHIPPED
                ? Truck
                : status === OrderStatus.DELIVERED
                ? CheckCircle
                : status === OrderStatus.CANCELLED
                ? XCircle
                : ArrowLeftRight,
          })),
        },
        enableColumnFilter: true,
      },
      {
        id: "paymentStatus",
        accessorKey: "paymentStatus",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<string>();
          let variant: "default" | "warning" | "success" | "destructive";
          let icon: React.ReactNode;

          switch (status) {
            case "paid":
              variant = "success";
              icon = <CheckCircle className="size-4" />;
              break;
            case "unpaid":
              variant = "destructive";
              icon = <XCircle className="size-4" />;
              break;
            case "refunded":
              variant = "default";
              icon = <RefreshCw className="size-4" />;
              break;
            default:
              variant = "default";
          }

          return (
            <Badge variant={variant} className="capitalize gap-2">
              {icon}
              {status}
            </Badge>
          );
        },
        meta: {
          label: "Payment Status",
          variant: "multiSelect",
          options: [
            {
              label: "Paid",
              value: "paid",
              icon: CheckCircle,
            },
            {
              label: "Unpaid",
              value: "unpaid",
              icon: XCircle,
            },
            {
              label: "Refunded",
              value: "refunded",
              icon: RefreshCw,
            },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "actions",
        cell: function Cell({ row }) {
          const order = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Order Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Order</DropdownMenuItem>

                {order.status !== OrderStatus.CANCELLED && (
                  <>
                    {order.status === OrderStatus.PENDING && (
                      <DropdownMenuItem>Process Order</DropdownMenuItem>
                    )}
                    {order.status === OrderStatus.PROCESSING && (
                      <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
                    )}
                    {order.status === OrderStatus.SHIPPED && (
                      <DropdownMenuItem>Mark as Delivered</DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant="destructive">
                      Cancel Order
                    </DropdownMenuItem>
                  </>
                )}

                {order.paymentStatus === "paid" &&
                  order.status !== OrderStatus.CANCELLED && (
                    <DropdownMenuItem>Issue Refund</DropdownMenuItem>
                  )}

                {order.status === OrderStatus.DELIVERED && (
                  <DropdownMenuItem>Process Return</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns,
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
          columnCount={columns.length}
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
