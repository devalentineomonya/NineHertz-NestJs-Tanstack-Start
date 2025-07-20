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
  AlertTriangle,
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Package,
  Pill,
  PlusCircle,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
}

interface InventoryItem {
  id: string;
  quantity: number;
  reorderThreshold: number;
  lastRestocked: Date;
  medicine: Medicine;
  createdAt: Date;
  updatedAt: Date;
}

const data: InventoryItem[] = [
  {
    id: "inv-1",
    quantity: 150,
    reorderThreshold: 50,
    lastRestocked: new Date(2024, 4, 15),
    medicine: {
      id: "med-1",
      name: "Amoxicillin",
      dosage: "500mg",
    },
    createdAt: new Date(2024, 0, 10),
    updatedAt: new Date(2024, 4, 15),
  },
  {
    id: "inv-2",
    quantity: 25,
    reorderThreshold: 30,
    lastRestocked: new Date(2024, 3, 20),
    medicine: {
      id: "med-2",
      name: "Lisinopril",
      dosage: "10mg",
    },
    createdAt: new Date(2024, 1, 5),
    updatedAt: new Date(2024, 3, 20),
  },
  {
    id: "inv-3",
    quantity: 0,
    reorderThreshold: 20,
    lastRestocked: new Date(2024, 2, 10),
    medicine: {
      id: "med-3",
      name: "Metformin",
      dosage: "850mg",
    },
    createdAt: new Date(2023, 11, 15),
    updatedAt: new Date(2024, 2, 10),
  },
  {
    id: "inv-4",
    quantity: 45,
    reorderThreshold: 40,
    lastRestocked: new Date(2024, 5, 1),
    medicine: {
      id: "med-4",
      name: "Atorvastatin",
      dosage: "20mg",
    },
    createdAt: new Date(2024, 2, 20),
    updatedAt: new Date(2024, 5, 1),
  },
  {
    id: "inv-5",
    quantity: 200,
    reorderThreshold: 60,
    lastRestocked: new Date(2024, 4, 25),
    medicine: {
      id: "med-5",
      name: "Albuterol Inhaler",
      dosage: "90mcg",
    },
    createdAt: new Date(2024, 1, 15),
    updatedAt: new Date(2024, 4, 25),
  },
];

export function InventoryTable() {
  const [medicineName] = useQueryState(
    "medicineName",
    parseAsString.withDefault("")
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
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

  const columns = React.useMemo<ColumnDef<InventoryItem>[]>(
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
                {row.original.medicine.dosage}
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
          const date = cell.getValue() as Date;
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
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Item</DropdownMenuItem>
                <DropdownMenuItem>Adjust Quantity</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <PlusCircle className="size-4" />
                  Record Restock
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Remove Item
                </DropdownMenuItem>
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
      sorting: [{ id: "lastRestocked", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar table={table} filters={["medicine", "status"]} />
      </DataTable>
    </div>
  );
}
