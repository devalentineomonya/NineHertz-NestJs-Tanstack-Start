import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMedicineStore } from "@/stores/use-delete-medicine-store";
import { useEditMedicineStore } from "@/stores/use-edit-medicine-store";
import { useViewMedicineStore } from "@/stores/use-view-medicine-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Pill,
  ClipboardList,
  Factory,
  Barcode,
  MoreHorizontal,
  Edit,
  Trash2,
  Edit2,
  Eye,
} from "lucide-react";
import * as React from "react";

export const medicineColumns: ColumnDef<MedicineResponseDto>[] = [
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
          Kes {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "type",
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      return <div className="font-medium">{type}</div>;
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "barcode",
    id: "barcode",
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
      const { onOpen: onViewMedicine } = useViewMedicineStore();
      const { onOpen: onEditMedicine } = useEditMedicineStore();
      const { onOpen: onDeleteMedicine } = useDeleteMedicineStore();
      const { getCurrentUser } = useUserSessionStore();
      const currentUser = getCurrentUser();

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
              onClick={() => onViewMedicine(medicine.id, medicine)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {/* {currentUser?.role === "admin" ||
              (currentUser?.role === "pharmacist" && ( */}
            <>
              <DropdownMenuItem onClick={() => onEditMedicine(medicine.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Medicine
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteMedicine(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Medicine
              </DropdownMenuItem>
            </>
            {/* ))} */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
