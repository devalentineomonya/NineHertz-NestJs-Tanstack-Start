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
// import { useDeleteAdminStore } from "@/stores/use-delete-admin-store";
// import { useEditAdminStore } from "@/stores/use-edit-admin-store";
// import { useViewAdminStore } from "@/stores/use-view-admin-store";

import { Shield, Mail, User, Calendar, MoreHorizontal } from "lucide-react";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { format } from "date-fns";

enum AdminType {
  SUPER_ADMIN = "super",
  SUPPORT_ADMIN = "support",
}

const nameFilter: FilterFn<AdminResponseDto> = (row, columnId, value) =>
  row.getValue<string>(columnId).toLowerCase().includes(value.toLowerCase());

const emailFilter: FilterFn<AdminResponseDto> = (row, _, value) =>
  row.original.user.email.toLowerCase().includes(value.toLowerCase());

const adminTypeFilter: FilterFn<AdminResponseDto> = (row, columnId, value) =>
  value.includes(row.getValue<AdminType>(columnId));

const verificationFilter: FilterFn<AdminResponseDto> = (row, _, value) => {
  const isVerified = row.original.user.isEmailVerified;
  return value.includes(isVerified ? "verified" : "unverified");
};

export const adminColumns: ColumnDef<AdminResponseDto>[] = [
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
    id: "admin",
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admin" />
    ),
    cell: ({ row }) => {
      const admin = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 rounded-full p-2">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium">{admin.fullName}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(admin.createdAt), "MMM d, yyyy 'at' hh:mm a")}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: "Admin",
      placeholder: "Search admins...",
      variant: "text",
      icon: User,
    },
    filterFn: nameFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "email",
    accessorFn: (row) => row.user.email,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.user.email;
      const isVerified = row.original.user.isEmailVerified;
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{email}</span>
          </div>
          <Badge
            variant={isVerified ? "success" : "warning"}
            className="mt-1 w-fit"
          >
            {isVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      );
    },
    meta: {
      label: "Email",
      placeholder: "Search emails...",
      variant: "text",
      icon: Mail,
    },
    filterFn: emailFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "adminType",
    accessorKey: "adminType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admin Type" />
    ),
    cell: ({ row }) => {
      const adminType = row.getValue<AdminType>("adminType");
      const getVariant = () => {
        switch (adminType) {
          case AdminType.SUPER_ADMIN:
            return "destructive";
          case AdminType.SUPPORT_ADMIN:
            return "success";
          default:
            return "warning";
        }
      };

      return (
        <Badge variant={getVariant()}>
          <Shield className="h-4 w-4 mr-2" />
          {adminType.replace("_", " ")}
        </Badge>
      );
    },
    meta: {
      label: "Admin Type",
      variant: "multiSelect",
      options: Object.values(AdminType).map((type) => ({
        label: type.replace("_", " "),
        value: type,
      })),
      icon: Shield,
    },
    filterFn: adminTypeFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "lastUpdated",
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;

      return (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          {format(updatedAt, "MMM d, yyyy")}
        </div>
      );
    },
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.updatedAt).getTime() -
      new Date(rowB.original.updatedAt).getTime(),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      //   const { onOpen: onViewOpen } = useViewAdminStore();
      //   const { onOpen: onEditOpen } = useEditAdminStore();
      //   const { onOpen: onDeleteOpen } = useDeleteAdminStore();

      const admin = row.original;

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
            // onClick={() => onViewOpen(admin)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
            // onClick={() => onEditOpen(admin)}
            >
              Edit Admin
            </DropdownMenuItem>
            {admin.adminType !== AdminType.SUPER_ADMIN && (
              <DropdownMenuItem
                // onClick={() => onDeleteOpen(admin)}
                className="text-destructive focus:text-destructive"
              >
                Delete Admin
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
    enableSorting: false,
  },
];
