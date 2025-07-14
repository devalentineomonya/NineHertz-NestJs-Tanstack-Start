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
import { useDeletePharmacistStore } from "@/stores/use-delete-pharmacist-store";
import { useEditPharmacistStore } from "@/stores/use-edit-pharmacist-store";
import { useViewPharmacistStore } from "@/stores/use-view-pharmacist-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Mail,
  MoreHorizontal,
  Shield,
  UserIcon,
  XCircle,
} from "lucide-react";

const verificationFilter: FilterFn<any> = (row, columnId, value) => {
  const isVerified = row.getValue<boolean>(columnId);
  return value.includes(isVerified ? "verified" : "unverified");
};

const pharmacyFilter: FilterFn<any> = (row, _, value) => {
  const pharmacyName = row.original.pharmacy?.name || "";
  return pharmacyName.toLowerCase().includes(value.toLowerCase());
};

export const pharmacistColumns: ColumnDef<any>[] = [
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
    id: "email",
    accessorFn: (row) => row.user.email,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-md overflow-hidden">
            <AvatarImage
              src={`https://avatar.vercel.sh/${
                user.id
              }.png?name=${encodeURIComponent(user.email)}`}
              alt={user.email}
            />
            <AvatarFallback>
              {user.email
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.email}</div>
            <div className="text-sm text-gray-500">
              Joined{" "}
              {`${format(new Date(user.createdAt), "MMMM d, yyyy")} at ${format(
                new Date(user.createdAt),
                "hh:mm a"
              )}`}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: "Email",
      placeholder: "Search emails...",
      variant: "text",
      icon: Mail,
    },
    filterFn: "includesString",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "role",
    accessorFn: (row) => row.user.role,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<string>();
      return (
        <Badge variant="default" className="capitalize">
          <Shield className="size-4 mr-2" />
          {role}
        </Badge>
      );
    },
    meta: {
      label: "Role",
      variant: "text",
      icon: Shield,
    },
    enableSorting: true,
  },
  {
    id: "pharmacist",
    accessorFn: (row) => row.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pharmacist" />
    ),
    cell: ({ row }) => {
      const pharmacy = row.original.pharmacy;
      return (
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-full p-2">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.fullName}</div>
            <div className="text-sm text-gray-500">
              {pharmacy?.name || "No Pharmacy"}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: "Pharmacy",
      placeholder: "Search pharmacies...",
      variant: "text",
    },
    filterFn: pharmacyFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "license",
    accessorFn: (row) => row.licenseNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="License" />
    ),
    cell: ({ cell }) => (
      <div className="font-mono text-sm">{cell.getValue<string>()}</div>
    ),
    meta: {
      label: "License",
      placeholder: "Search licenses...",
      variant: "text",
    },
    enableColumnFilter: true,
  },
  {
    id: "verification",
    accessorFn: (row) => row.user.isEmailVerified,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verification" />
    ),
    cell: ({ cell }) => {
      const isVerified = cell.getValue<boolean>();
      return (
        <Badge variant={isVerified ? "success" : "secondary"}>
          <div className="flex items-center gap-1">
            {isVerified ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isVerified ? "Verified" : "Unverified"}
          </div>
        </Badge>
      );
    },
    meta: {
      label: "Verification",
      variant: "multiSelect",
      options: [
        { label: "Verified", value: "verified" },
        { label: "Unverified", value: "unverified" },
      ],
    },
    filterFn: verificationFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "pharmacy",
    accessorFn: (row) => row.pharmacy?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pharmacy" />
    ),
    cell: ({ row }) => {
      const pharmacy = row.original.pharmacy;
      return (
        <div>
          <div className="font-medium">{pharmacy?.name || "-"}</div>
          <div className="text-sm text-gray-500">
            {pharmacy?.contactPhone || "-"}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { onOpen: onViewOpen } = useViewPharmacistStore();
      const { onOpen: onEditOpen } = useEditPharmacistStore();
      const { openModal } = useDeletePharmacistStore();
      const pharmacistId = row.original.id;

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
              onClick={() => onViewOpen(pharmacistId, row.original)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditOpen(pharmacistId, row.original)}
            >
              Edit Profile
            </DropdownMenuItem>
            {!row.original.user.isEmailVerified && (
              <DropdownMenuItem>Resend Verification</DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => openModal(pharmacistId)}
              variant="destructive"
            >
              Delete Pharmacist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
