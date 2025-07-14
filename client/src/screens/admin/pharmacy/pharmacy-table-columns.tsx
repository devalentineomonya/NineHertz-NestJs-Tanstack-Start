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
import { useDeletePharmacyStore } from "@/stores/use-delete-pharmacy-store";
import { useEditPharmacyStore } from "@/stores/use-edit-pharmacy";
// import { useViewPharmacyStore }
import {
  Building,
  Home,
  MoreHorizontal,
  Phone,
  Pill,
  ShoppingCart,
  User,
} from "lucide-react";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { format } from "date-fns";

const nameFilter: FilterFn<PharmacyResponseDto> = (row, columnId, value) =>
  row.getValue<string>(columnId).toLowerCase().includes(value.toLowerCase());

const addressFilter: FilterFn<PharmacyResponseDto> = (row, columnId, value) =>
  row.getValue<string>(columnId).toLowerCase().includes(value.toLowerCase());

const phoneFilter: FilterFn<PharmacyResponseDto> = (row, columnId, value) =>
  row.getValue<string>(columnId).toLowerCase().includes(value.toLowerCase());

const licenseFilter: FilterFn<PharmacyResponseDto> = (row, columnId, value) =>
  row.getValue<string>(columnId).toLowerCase().includes(value.toLowerCase());

export const pharmacyColumns: ColumnDef<PharmacyResponseDto>[] = [
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
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-md p-2">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-gray-500">
              Created 
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: "Name",
      placeholder: "Search names...",
      variant: "text",
      icon: Building,
    },
    filterFn: nameFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "address",
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-gray-500" />
        <span className="line-clamp-1">{row.original.address}</span>
      </div>
    ),
    meta: {
      label: "Address",
      placeholder: "Search addresses...",
      variant: "text",
      icon: Home,
    },
    filterFn: addressFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "contactPhone",
    accessorKey: "contactPhone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <span>{row.original.contactPhone}</span>
      </div>
    ),
    meta: {
      label: "Phone",
      placeholder: "Search phones...",
      variant: "text",
      icon: Phone,
    },
    filterFn: phoneFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "licenseNumber",
    accessorKey: "licenseNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="License" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.licenseNumber}
      </Badge>
    ),
    meta: {
      label: "License",
      placeholder: "Search licenses...",
      variant: "text",
    },
    filterFn: licenseFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "inventoryItems",
    accessorFn: (row) => row.inventoryIds?.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inventory" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        <Pill className="h-4 w-4 mr-2" />
        {row.original.inventoryIds?.length || 0}
      </Badge>
    ),
    sortingFn: (rowA, rowB) =>
      (rowA.original.inventoryIds?.length || 0) -
      (rowB.original.inventoryIds?.length || 0),
    enableSorting: true,
  },
  {
    id: "orders",
    accessorFn: (row) => row.orderIds?.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orders" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        <ShoppingCart className="h-4 w-4 mr-2" />
        {row.original.orderIds?.length || 0}
      </Badge>
    ),
    sortingFn: (rowA, rowB) =>
      (rowA.original.orderIds?.length || 0) -
      (rowB.original.orderIds?.length || 0),
    enableSorting: true,
  },
  {
    id: "pharmacists",
    accessorFn: (row) => row.pharmacistIds?.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pharmacists" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        <User className="h-4 w-4 mr-2" />
        {row.original.pharmacistIds?.length || 0}
      </Badge>
    ),
    sortingFn: (rowA, rowB) =>
      (rowA.original.pharmacistIds?.length || 0) -
      (rowB.original.pharmacistIds?.length || 0),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      //   const { onOpen: onViewOpen } = useViewPharmacyStore();
      const { onOpen: onEditOpen } = useEditPharmacyStore();
      const { onOpen: onDeleteOpen } = useDeletePharmacyStore();

      const pharmacy = row.original;

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
            //  onClick={() => onViewOpen(pharmacy)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditOpen(pharmacy)}>
              Edit Pharmacy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteOpen(pharmacy)}
              className="text-destructive focus:text-destructive"
            >
              Delete Pharmacy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
    enableSorting: false,
  },
];
