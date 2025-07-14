"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetMedicine } from "@/services/medicines/use-get-medicine";
import { useAddMedicineStore } from "@/stores/use-add-medicine-store";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Pill,
  ClipboardList,
  Factory,
  Barcode,
  MoreHorizontal,
  Edit,
  Trash2,
  PlusSquare,
} from "lucide-react";
import * as React from "react";

export function AdminMedicines() {
  const { onOpen } = useAddMedicineStore();
  const { data, isLoading } = useGetMedicine();

  const columns = React.useMemo<ColumnDef<MedicineResponseDto>[]>(
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
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Medicine" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Pill className="size-5 text-blue-500" />
            <div>
              <div className="font-medium">
                MED-{row.original.id.substring(0, 8)}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(row.original.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Medicine",
          placeholder: "Search medicines...",
          variant: "text",
          icon: Pill,
        },
        enableColumnFilter: true,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand Name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
        meta: {
          label: "Brand Name",
          placeholder: "Search brand names...",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "genericName",
        accessorKey: "genericName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Generic Name" />
        ),
        cell: ({ row }) => (
          <div className="text-gray-600">{row.getValue("genericName")}</div>
        ),
        meta: {
          label: "Generic Name",
          placeholder: "Search generic names...",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "manufacturer",
        accessorKey: "manufacturer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Manufacturer" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-gray-500" />
            <span>{row.getValue("manufacturer")}</span>
          </div>
        ),
        meta: {
          label: "Manufacturer",
          placeholder: "Search manufacturers...",
          variant: "text",
          icon: Factory,
        },
        enableColumnFilter: true,
      },
      {
        id: "price",
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ cell }) => {
          const price = cell.getValue<number>();
          return (
            <div className="font-medium">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "barcode",
        accessorKey: "barcode",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Barcode" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Barcode className="size-4 text-gray-500" />
            <span className="font-mono">{row.getValue("barcode")}</span>
          </div>
        ),
        meta: {
          label: "Barcode",
          placeholder: "Search barcodes...",
          variant: "text",
          icon: Barcode,
        },
        enableColumnFilter: true,
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("description")}
          </div>
        ),
        meta: {
          label: "Description",
          placeholder: "Search descriptions...",
          variant: "text",
          icon: ClipboardList,
        },
        enableColumnFilter: true,
      },
      {
        id: "actions",
        cell: function Cell({ row }) {
          const medicine = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Medicine
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
    data: data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total || 10) / (data?.limit || 10)),
    initialState: {
      pagination: {
        pageIndex: (data?.page ?? 1) - 1,
        pageSize: data?.limit ?? 10,
      },
      sorting: [{ id: "createdAt", desc: true }],
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
      <div className="w-fit min-w-56 mb-4">
        <Button variant={"primary"} onClick={onOpen}>
          <PlusSquare className="mr-2 h-5 w-5" />
          Add Medicine
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
