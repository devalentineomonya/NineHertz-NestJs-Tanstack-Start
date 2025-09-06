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
import { useInventoryDrawerStore } from "@/stores/use-inventory-drawer";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Package,
  Pill,
  PlusCircle,
} from "lucide-react";
import * as React from "react";

export const inventoryColumns: ColumnDef<InventoryItemResponseDto>[] = [
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
    id: "medicine",
    accessorFn: (row) => row.medicine.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medicine" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Pill className="size-5 text-blue-500" />
        <div>
          <div className="font-medium">{row.original.medicine.name}</div>
          <div className="text-sm text-gray-500">
            {row.original.medicine.type}
          </div>
        </div>
      </div>
    ),
    meta: {
      label: "Medicine",
      placeholder: "Search medicines...",
      variant: "text",
      icon: Package,
    },
    enableColumnFilter: true,
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => (
      <div className="font-mono font-medium">{row.original.quantity}</div>
    ),
  },
  {
    id: "reorderThreshold",
    accessorKey: "reorderThreshold",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reorder Threshold" />
    ),
    cell: ({ row }) => (
      <div className="font-mono">{row.original.reorderThreshold}</div>
    ),
  },
  {
    id: "lastRestocked",
    accessorKey: "lastRestocked",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Restocked" />
    ),
    cell: ({ cell }) => {
      const date = new Date(cell.getValue<string>());
      const today = new Date();
      const daysSinceRestock = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-gray-500" />
          <div>
            <div>{date.toLocaleDateString()}</div>
            <div className="text-sm text-gray-500">
              {daysSinceRestock} days ago
            </div>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { quantity, reorderThreshold } = row.original;
      let status: "in-stock" | "low-stock" | "out-of-stock";
      let variant: "default" | "warning" | "destructive";
      let icon: React.ReactNode;

      if (quantity === 0) {
        status = "out-of-stock";
        variant = "destructive";
        icon = <AlertTriangle className="size-4" />;
      } else if (quantity <= reorderThreshold) {
        status = "low-stock";
        variant = "warning";
        icon = <AlertTriangle className="size-4" />;
      } else {
        status = "in-stock";
        variant = "default";
        icon = <CheckCircle className="size-4" />;
      }

      return (
        <Badge variant={variant} className="capitalize gap-2">
          {icon}
          {status.split("-").join(" ")}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        {
          label: "In Stock",
          value: "in-stock",
          icon: CheckCircle,
        },
        {
          label: "Low Stock",
          value: "low-stock",
          icon: AlertTriangle,
        },
        {
          label: "Out of Stock",
          value: "out-of-stock",
          icon: AlertTriangle,
        },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { openDrawer } = useInventoryDrawerStore();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDrawer("view", row.original)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDrawer("adjust", row.original)}
            >
              Adjust Quantity
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openDrawer("reorder", row.original)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="size-4" />
              Record Restock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
