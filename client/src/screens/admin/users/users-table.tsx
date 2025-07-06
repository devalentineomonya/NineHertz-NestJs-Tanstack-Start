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
  Mail,
  Shield,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Derived fields from relationships
  profileName?: string;
  profileType?: string;
  lastActive?: Date;
}

const data: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    role: UserRole.PATIENT,
    isEmailVerified: true,
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2024, 2, 10),
    profileName: "John Doe",
    profileType: "Patient Profile",
    lastActive: new Date(2024, 4, 12)
  },
  {
    id: "2",
    email: "sarah.j@clinic.org",
    role: UserRole.DOCTOR,
    isEmailVerified: true,
    createdAt: new Date(2022, 8, 22),
    updatedAt: new Date(2024, 3, 15),
    profileName: "Dr. Sarah Johnson",
    profileType: "Cardiologist",
    lastActive: new Date(2024, 4, 15)
  },
  {
    id: "3",
    email: "admin@healthcare.org",
    role: UserRole.ADMIN,
    isEmailVerified: true,
    createdAt: new Date(2021, 2, 10),
    updatedAt: new Date(2024, 4, 1),
    profileName: "System Admin",
    lastActive: new Date(2024, 4, 15)
  },
  {
    id: "4",
    email: "mike.chen@example.com",
    role: UserRole.PATIENT,
    isEmailVerified: false,
    createdAt: new Date(2024, 1, 5),
    updatedAt: new Date(2024, 1, 5),
    profileName: "Michael Chen",
    lastActive: new Date(2024, 3, 28)
  },
  {
    id: "5",
    email: "emily.r@clinic.org",
    role: UserRole.DOCTOR,
    isEmailVerified: true,
    createdAt: new Date(2023, 9, 30),
    updatedAt: new Date(2024, 4, 10),
    profileName: "Dr. Emily Rodriguez",
    profileType: "Pediatrician",
    lastActive: new Date(2024, 4, 14)
  },
];

export function AdminUsers() {
  const [email] = useQueryState("email", parseAsString.withDefault(""));
  const [role] = useQueryState(
    "role",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [verified] = useQueryState(
    "verified",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data.filter((user) => {
      const matchesEmail =
        email === "" ||
        user.email.toLowerCase().includes(email.toLowerCase());

      const matchesRole =
        role.length === 0 ||
        role.includes(user.role);

      const matchesVerified =
        verified.length === 0 ||
        (verified.includes("verified") && user.isEmailVerified) ||
        (verified.includes("unverified") && !user.isEmailVerified);

      return matchesEmail && matchesRole && matchesVerified;
    });
  }, [email, role, verified]);

  const columns = React.useMemo<ColumnDef<User>[]>(
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
        id: "email",
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-full p-2">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium">{row.original.email}</div>
              <div className="text-sm text-gray-500">
                Joined {row.original.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Email",
          placeholder: "Search emails...",
          variant: "text",
          icon: Mail,
        },
        enableColumnFilter: true,
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
            role === UserRole.ADMIN ? "destructive" :
            role === UserRole.DOCTOR ? "default" : "secondary";

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
        enableColumnFilter: true,
      },
      {
        id: "profile",
        accessorFn: (row) => row.profileName || row.email,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Profile" />
        ),
        cell: ({ row }) => {
          const { profileName, profileType, role } = row.original;
          return (
            <div className="flex flex-col">
              <div className="font-medium">
                {profileName || "No profile"}
              </div>
              {profileType && (
                <div className="text-sm text-gray-500">{profileType}</div>
              )}
              {!profileName && (
                <div className="text-xs text-amber-600">
                  {role === UserRole.PATIENT
                    ? "Patient profile incomplete"
                    : "Profile setup needed"}
                </div>
              )}
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
          filterFn: (row, columnId, filterValues: string[]) => {
            if (filterValues.length === 0) return true;
            const hasProfile = !!row.original.profileName;
            return filterValues.includes("complete")
              ? hasProfile
              : !hasProfile;
          },
        },
        enableColumnFilter: true,
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
        enableColumnFilter: true,
      },
      {
        id: "activity",
        accessorKey: "lastActive",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Active" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              {date ? date.toLocaleDateString() : "Never"}
            </div>
          );
        },
        sortingFn: (rowA, rowB) =>
          new Date(rowA.original.lastActive || 0).getTime() -
          new Date(rowB.original.lastActive || 0).getTime()
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
                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                {!row.original.isEmailVerified && (
                  <DropdownMenuItem>Resend Verification</DropdownMenuItem>
                )}
                <DropdownMenuItem>Login Activity</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
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
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: Math.ceil(filteredData.length / 10),
    initialState: {
      sorting: [{ id: "activity", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
