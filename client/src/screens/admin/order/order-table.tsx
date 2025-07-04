"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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

import type { ColumnDef } from "@tanstack/react-table";
import {
  ShoppingCart,
  User,
  Calendar,
  Package,
  CreditCard,
  MoreHorizontal,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeftRight,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

interface Patient {
  id: string;
  fullName: string;
}

interface OrderItem {
  id: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderDate: Date;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  patient: Patient;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const data: Order[] = [
  {
    id: "ord-1",
    orderDate: new Date(2024, 5, 15),
    status: OrderStatus.PROCESSING,
    totalAmount: 125.75,
    paymentStatus: "paid",
    patient: {
      id: "p1",
      fullName: "John Doe",
    },
    items: [
      { id: "item-1", medicineName: "Amoxicillin 500mg", quantity: 2, unitPrice: 25.5 },
      { id: "item-2", medicineName: "Vitamin C 1000mg", quantity: 1, unitPrice: 74.75 },
    ],
    createdAt: new Date(2024, 5, 15),
    updatedAt: new Date(2024, 5, 15),
  },
  {
    id: "ord-2",
    orderDate: new Date(2024, 5, 10),
    status: OrderStatus.DELIVERED,
    totalAmount: 89.99,
    paymentStatus: "paid",
    patient: {
      id: "p2",
      fullName: "Jane Smith",
    },
    items: [
      { id: "item-3", medicineName: "Lisinopril 10mg", quantity: 3, unitPrice: 29.99 },
    ],
    createdAt: new Date(2024, 5, 10),
    updatedAt: new Date(2024, 5, 12),
  },
  {
    id: "ord-3",
    orderDate: new Date(2024, 5, 18),
    status: OrderStatus.PENDING,
    totalAmount: 210.5,
    paymentStatus: "unpaid",
    patient: {
      id: "p3",
      fullName: "Robert Johnson",
    },
    items: [
      { id: "item-4", medicineName: "Metformin 850mg", quantity: 4, unitPrice: 32.5 },
      { id: "item-5", medicineName: "Blood Pressure Monitor", quantity: 1, unitPrice: 82.5 },
    ],
    createdAt: new Date(2024, 5, 18),
    updatedAt: new Date(2024, 5, 18),
  },
  {
    id: "ord-4",
    orderDate: new Date(2024, 5, 5),
    status: OrderStatus.CANCELLED,
    totalAmount: 45.25,
    paymentStatus: "refunded",
    patient: {
      id: "p4",
      fullName: "Emily Wilson",
    },
    items: [
      { id: "item-6", medicineName: "Atorvastatin 20mg", quantity: 1, unitPrice: 45.25 },
    ],
    createdAt: new Date(2024, 5, 5),
    updatedAt: new Date(2024, 5, 6),
  },
  {
    id: "ord-5",
    orderDate: new Date(2024, 5, 20),
    status: OrderStatus.SHIPPED,
    totalAmount: 156.4,
    paymentStatus: "paid",
    patient: {
      id: "p5",
      fullName: "Michael Brown",
    },
    items: [
      { id: "item-7", medicineName: "Albuterol Inhaler", quantity: 2, unitPrice: 78.2 },
    ],
    createdAt: new Date(2024, 5, 20),
    updatedAt: new Date(2024, 5, 21),
  },
];

export function AdminOrdersTable() {
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
    return data.filter((order) => {
      const matchesPatient =
        patientName === "" ||
        order.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());

      const matchesOrderStatus =
        orderStatus.length === 0 ||
        orderStatus.includes(order.status);

      const matchesPaymentStatus =
        paymentStatus.length === 0 ||
        paymentStatus.includes(order.paymentStatus);

      return (
        matchesPatient &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    });
  }, [patientName, orderStatus, paymentStatus]);

  const columns = React.useMemo<ColumnDef<Order>[]>(
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
              <div className="font-medium">ORD-{row.original.id.split("-")[1]}</div>
              <div className="text-sm text-gray-500">
                {row.original.orderDate.toLocaleDateString()}
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
              {row.original.items.length} item{row.original.items.length > 1 ? "s" : ""}
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
          return (
            <div className="font-medium">
              ${amount.toFixed(2)}
            </div>
          );
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
          let variant: "default" | "secondary" | "warning" | "success" | "destructive";
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
              {status.toLowerCase()}
            </Badge>
          );
        },
        meta: {
          label: "Order Status",
          variant: "multiSelect",
          options: Object.values(OrderStatus).map(status => ({
            label: status.charAt(0) + status.slice(1).toLowerCase(),
            value: status,
            icon: status === OrderStatus.PENDING ? Clock :
                  status === OrderStatus.PROCESSING ? RefreshCw :
                  status === OrderStatus.SHIPPED ? Truck :
                  status === OrderStatus.DELIVERED ? CheckCircle :
                  status === OrderStatus.CANCELLED ? XCircle : ArrowLeftRight
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

                {order.paymentStatus === "paid" && order.status !== OrderStatus.CANCELLED && (
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
    data: filteredData,
    columns,
    pageCount: Math.ceil(filteredData.length / 10),
    initialState: {
      sorting: [{ id: "orderDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar
          table={table}
          filters={[
            "order",
            "patient",
            "orderStatus",
            "paymentStatus"
          ]}
        />
      </DataTable>
    </div>
  );
}
