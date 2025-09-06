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
import { useViewTransactionStore } from "@/stores/use-view-transaction-store";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  Clock,
  MoreHorizontal,
  RefreshCw,
  XCircle,
  CreditCard,
  Check,
  Copy,
} from "lucide-react";
import * as React from "react";
import { format } from "date-fns";

enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  ABANDONED = "abandoned",
}
enum Gateway {
  PAYSTACK = "paystack",
  STRIPE = "stripe",
}

export const transactionColumns: ColumnDef<TransactionResponseDto>[] = [
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
    id: "transaction",
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transaction" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <CreditCard className="size-5 text-purple-500" />
        <div>
          <div className="font-medium">
            TXN-{row.original.id.substring(0, 8)}
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm")}
          </div>
        </div>
      </div>
    ),
    meta: {
      label: "Transaction",
      placeholder: "Search transactions...",
      variant: "text",
      icon: CreditCard,
    },
    enableColumnFilter: true,
  },
  {
    id: "reference",
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference" />
    ),
    cell: ({ cell }) => {
      const reference = cell.getValue<string>();
      const [copied, setCopied] = React.useState(false);

      const handleCopy = () => {
        if (!reference) return;
        navigator.clipboard.writeText(reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      };

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{reference}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      );
    },
    meta: {
      label: "Reference",
      placeholder: "Search references...",
      variant: "text",
    },
    enableColumnFilter: true,
  },

  {
    id: "amount",
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ cell }) => {
      const amount = cell.getValue<number>();
      return <div className="font-medium">Kes {(amount / 100).toFixed(2)}</div>;
    },
    enableSorting: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<TransactionStatus>();
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
      label: "Status",
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
    id: "gateway",
    accessorKey: "gateway",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gateway" />
    ),
    cell: ({ cell }) => {
      const gateway = cell.getValue<Gateway>();
      return <Badge variant="outline">{gateway}</Badge>;
    },
    meta: {
      label: "Gateway",
      variant: "multiSelect",
      options: Object.values(Gateway).map((g) => ({
        label: g,
        value: g,
      })),
    },
    enableColumnFilter: true,
  },
  {
    id: "gatewayReference",
    accessorKey: "gatewayReference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gateway Reference" />
    ),
    cell: ({ cell }) => {
      const reference = cell.getValue<string>();
      const [copied, setCopied] = React.useState(false);

      const handleCopy = () => {
        if (!reference) return;
        navigator.clipboard.writeText(reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      };

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{reference}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      );
    },
    meta: {
      label: "Gateway Reference",
      placeholder: "Search Gateway Reference...",
      variant: "text",
    },
    enableColumnFilter: true,
  },

  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ cell }) =>
      format(new Date(cell.getValue<string>()), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const transaction = row.original;
      const { onOpen: onViewTransaction } = useViewTransactionStore();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onViewTransaction(transaction.id, transaction)}
            >
              View Transaction Details
            </DropdownMenuItem>

            {/* Additional view-only actions */}
            {transaction.refundReason && (
              <DropdownMenuItem>
                View Refund Reason: {transaction.refundReason}
              </DropdownMenuItem>
            )}

            {transaction.gatewayFees && (
              <DropdownMenuItem>
                View Fees: Kes {transaction.gatewayFees.toFixed(2)}
              </DropdownMenuItem>
            )}
            {(transaction.status === TransactionStatus.FAILED ||
              transaction.status === TransactionStatus.PENDING) &&
              transaction.gatewayReference && (
                <DropdownMenuItem
                  onClick={() => {
                    window.open(
                      `https://checkout.${transaction.gateway}.com/c/pay/${transaction.gatewayReference}`,
                      "_blank"
                    );
                  }}
                >
                  Complete Transaction
                </DropdownMenuItem>
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
