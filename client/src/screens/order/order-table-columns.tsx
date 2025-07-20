import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditOrderStore } from "@/stores/use-edit-order-store";
import { useViewOrderStore } from "@/stores/use-view-order-store";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeftRight,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import * as React from "react";

enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}
export const orderColumns: ColumnDef<OrderResponseDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
          <div className="text-sm text-gray-500">{row.original.createdAt}</div>
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
      return <div className="font-medium">Kes {amount}</div>;
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
      const { onOpen: onEditOrder } = useEditOrderStore();
      const { onOpen: onViewOrder } = useViewOrderStore();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewOrder(order)}>
              View Order Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditOrder(order.id)}>
              Edit Order
            </DropdownMenuItem>

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
];
