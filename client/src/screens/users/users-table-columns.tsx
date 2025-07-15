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
import { useDeleteUserStore } from "@/stores/use-delete-user-store";
import { useEditUser } from "@/stores/use-edit-user-store";
import { useViewUser } from "@/stores/use-view-user-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Mail,
  MoreHorizontal,
  Shield,
  User,
  User as UserIcon,
  XCircle,
} from "lucide-react";

enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ADMIN = "admin",
}

const emailFilter: FilterFn<UserResponseDto> = (row, columnId, value) =>
  row.getValue<string>(columnId).toLowerCase().includes(value.toLowerCase());

const roleFilter: FilterFn<UserResponseDto> = (row, columnId, value) =>
  value.includes(row.getValue<UserRole>(columnId));

const profileFilter: FilterFn<UserResponseDto> = (row, _, value) => {
  const hasProfile = !!row.original.profile?.fullName;
  return value.includes(hasProfile ? "complete" : "incomplete");
};

const verificationFilter: FilterFn<UserResponseDto> = (
  row,
  columnId,
  value
) => {
  const isVerified = row.getValue<boolean>(columnId);
  return value.includes(isVerified ? "verified" : "unverified");
};

export const userColumns: ColumnDef<UserResponseDto>[] = [
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-md overflow-hidden">
            <AvatarImage
              src={`https://avatar.vercel.sh/${
                row.original.id
              }.png?name=${encodeURIComponent(row.original.email)}`}
              alt={row.original.email}
            />
            <AvatarFallback>
              {row.original.email
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.email}</div>
            <div className="text-sm text-gray-500">
              Joined{" "}
              {`${format(
                new Date(row.original.createdAt),
                "MMMM d, yyyy"
              )} at ${format(new Date(row.original.createdAt), "hh:mm a")}`}
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
    filterFn: emailFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<UserRole>();
      const variant =
        role === UserRole.ADMIN
          ? "destructive"
          : role === UserRole.DOCTOR
          ? "default"
          : "secondary";

      return (
        <Badge variant={variant} className="capitalize">
          <Shield className="size-4 mr-2" />
          {role}
        </Badge>
      );
    },
    meta: {
      label: "Role",
      variant: "multiSelect",
      options: [
        { label: "Patient", value: UserRole.PATIENT },
        { label: "Doctor", value: UserRole.DOCTOR },
        { label: "Admin", value: UserRole.ADMIN },
      ],
      icon: Shield,
    },
    filterFn: roleFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "profile",
    accessorFn: (row) => row.profile?.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profile" />
    ),
    cell: ({ row }) => {
      const profileName = row.original.profile?.fullName;
      const role = row.original.role;
      const profileRole =
        row.original.profile?.adminType || row.original.profile?.specialty;

      let displayText = "No Profile";
      if (profileName) {
        displayText =
          profileRole ?? (role === UserRole.PATIENT ? "Patient" : "Chemist");
      }

      return (
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-full p-2">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="capitalize">
            <div className="font-medium">{displayText}</div>
            <div className="text-sm text-gray-500 ">
              {profileName || "No Profile"}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: "Profile Status",
      placeholder: "Filter by status...",
      variant: "multiSelect",
      options: [
        { label: "Has Profile", value: "complete" },
        { label: "No Profile", value: "incomplete" },
      ],
      icon: UserIcon,
    },
    filterFn: profileFilter,
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "verification",
    accessorKey: "isEmailVerified",
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
    id: "activity",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          {`${format(new Date(date), "MMMM d, yyyy")} at ${format(
            new Date(date),
            "hh:mm a"
          )}`}
        </div>
      );
    },
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.createdAt || 0).getTime() -
      new Date(rowB.original.createdAt || 0).getTime(),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { onOpen: onViewUserOpen } = useViewUser();
      const { onOpen: onEditUserOpen } = useEditUser();
      const { openModal } = useDeleteUserStore();
      const userId = row.original.id;
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
              onClick={() => onViewUserOpen(row.original, userId)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditUserOpen(userId, row.original)}
            >
              Edit Profile
            </DropdownMenuItem>
            {!row.original.isEmailVerified && (
              <DropdownMenuItem>Resend Verification</DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => openModal(row.original.id, row.original.role)}
              variant="destructive"
            >
              {row.original.role === UserRole.ADMIN
                ? "Revoke Admin"
                : "Delete Account"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
