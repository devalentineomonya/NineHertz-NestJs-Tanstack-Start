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
import { useCancelOrderStore } from "@/stores/use-cancel-order-store";
import { useEditOrderStore } from "@/stores/use-edit-order-store";
import { useProceedToCheckoutStore } from "@/stores/use-proceed-to-checkout-store";
import { useViewOrderStore } from "@/stores/use-view-order-store";
import { useUserSessionStore } from "@/stores/user-session-store";
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

enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  ABANDONED = "abandoned",
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
    id: "transactions",
    accessorKey: "transactions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => {
      // Safely get status: empty array or undefined -> "pending"
      const status =
        row.original.transactions?.length > 0
          ? row.original.transactions[0].status
          : TransactionStatus.PENDING;

      let variant: "default" | "warning" | "success" | "destructive";
      let icon: React.ReactNode;

      switch (status) {
        case TransactionStatus.SUCCESS:
          variant = "success";
          icon = <CheckCircle className="size-4" />;
          break;
        case TransactionStatus.PENDING:
          variant = "warning";
          icon = <Clock className="size-4" />;
          break;
        case TransactionStatus.FAILED:
        case TransactionStatus.ABANDONED:
          variant = "destructive";
          icon = <XCircle className="size-4" />;
          break;
        case TransactionStatus.REFUNDED:
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
          label: "Success",
          value: TransactionStatus.SUCCESS,
          icon: CheckCircle,
        },
        { label: "Pending", value: TransactionStatus.PENDING, icon: Clock },
        { label: "Failed", value: TransactionStatus.FAILED, icon: XCircle },
        {
          label: "Refunded",
          value: TransactionStatus.REFUNDED,
          icon: RefreshCw,
        },
        {
          label: "Abandoned",
          value: TransactionStatus.ABANDONED,
          icon: XCircle,
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
      const { getCurrentUser } = useUserSessionStore();
      const currentUser = getCurrentUser();
      const { open: onProceedToCheckout } = useProceedToCheckoutStore();
      const { onOpen: onOrderCancel } = useCancelOrderStore();

      const isPatient = currentUser?.role === "patient";
      const isAdminOrPharmacist =
        currentUser?.role === "admin" || currentUser?.role === "pharmacist";

      // First transaction and status
      const firstTransaction =
        order.transactions?.length > 0 ? order.transactions[0] : null;
      const transactionStatus =
        firstTransaction?.status || TransactionStatus.PENDING;

      // Checks
      const shouldShowPayButton =
        !firstTransaction ||
        [
          TransactionStatus.PENDING,
          TransactionStatus.FAILED,
          TransactionStatus.ABANDONED,
        ].includes(transactionStatus);

      const isPaid =
        transactionStatus === TransactionStatus.SUCCESS ||
        transactionStatus === TransactionStatus.REFUNDED;

      const isOrderClosed =
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.DELIVERED;

      const canEditOrder = !isPaid && !isOrderClosed;

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

            {canEditOrder && (
              <DropdownMenuItem onClick={() => onEditOrder(order.id)}>
                Edit Order
              </DropdownMenuItem>
            )}

            {order.status !== OrderStatus.CANCELLED && (
              <>
                {order.status === OrderStatus.PENDING && (
                  <>
                    {isPatient && shouldShowPayButton && (
                      <DropdownMenuItem
                        onClick={() => onProceedToCheckout(order)}
                      >
                        Proceed to Checkout
                      </DropdownMenuItem>
                    )}
                    {isAdminOrPharmacist && (
                      <DropdownMenuItem>Process Order</DropdownMenuItem>
                    )}
                  </>
                )}

                {order.status === OrderStatus.PROCESSING &&
                  isAdminOrPharmacist && (
                    <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
                  )}

                {order.status === OrderStatus.SHIPPED &&
                  isAdminOrPharmacist && (
                    <DropdownMenuItem>Mark as Delivered</DropdownMenuItem>
                  )}

                {!isPaid && (
                  <DropdownMenuItem
                    onClick={() => onOrderCancel(order.id)}
                    variant="destructive"
                  >
                    Cancel Order
                  </DropdownMenuItem>
                )}
              </>
            )}

            {transactionStatus === TransactionStatus.SUCCESS &&
              order.status !== OrderStatus.CANCELLED &&
              isAdminOrPharmacist && (
                <DropdownMenuItem>Issue Refund</DropdownMenuItem>
              )}

            {order.status === OrderStatus.DELIVERED && isAdminOrPharmacist && (
              <DropdownMenuItem>Process Return</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
