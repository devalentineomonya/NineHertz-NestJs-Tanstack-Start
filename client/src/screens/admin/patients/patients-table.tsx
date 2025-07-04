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
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Phone,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  dateOfBirth: Date | null;
  medicalHistory: Record<string, any> | null;
  // Derived fields for display
  age: number | null;
  status: "active" | "inactive";
  appointments: number;
}

const data: Patient[] = [
  {
    id: "1",
    fullName: "John Doe",
    phone: "+1 (555) 123-4567",
    dateOfBirth: new Date(1985, 3, 12),
    medicalHistory: { allergies: ["Penicillin"], conditions: ["Hypertension"] },
    age: 39,
    status: "active",
    appointments: 4,
  },
  {
    id: "2",
    fullName: "Jane Smith",
    phone: "+1 (555) 987-6543",
    dateOfBirth: new Date(1990, 7, 23),
    medicalHistory: { conditions: ["Type 2 Diabetes"] },
    age: 33,
    status: "active",
    appointments: 2,
  },
  {
    id: "3",
    fullName: "Robert Johnson",
    phone: "+1 (555) 246-8101",
    dateOfBirth: new Date(1978, 11, 5),
    medicalHistory: { surgeries: ["Appendectomy 2010"] },
    age: 45,
    status: "inactive",
    appointments: 0,
  },
  {
    id: "4",
    fullName: "Emily Wilson",
    phone: "+1 (555) 369-1214",
    dateOfBirth: new Date(1995, 0, 30),
    medicalHistory: null,
    age: 29,
    status: "active",
    appointments: 6,
  },
  {
    id: "5",
    fullName: "Michael Brown",
    phone: "+1 (555) 802-4679",
    dateOfBirth: new Date(2000, 2, 15),
    medicalHistory: { allergies: ["Peanuts"], conditions: ["Asthma"] },
    age: 24,
    status: "active",
    appointments: 3,
  },
];

export function AdminPatients() {
  const [fullName] = useQueryState("fullName", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data.filter((patient) => {
      const matchesName =
        fullName === "" ||
        patient.fullName.toLowerCase().includes(fullName.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(patient.status);

      return matchesName && matchesStatus;
    });
  }, [fullName, status]);

  const columns = React.useMemo<ColumnDef<Patient>[]>(
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
        id: "fullName",
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Patient" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <div>
              <div className="font-medium">{row.original.fullName}</div>
              <div className="text-sm text-gray-500">
                {row.original.age ?? "N/A"} years
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Patient",
          placeholder: "Search patients...",
          variant: "text",
          icon: User,
        },
        enableColumnFilter: true,
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: ({ cell }) => (
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-gray-500" />
            {cell.getValue<string>()}
          </div>
        ),
        meta: {
          label: "Phone",
          placeholder: "Search phones...",
          variant: "text",
          icon: Phone,
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<Patient["status"]>();
          const Icon = status === "active" ? CheckCircle : XCircle;
          const variant = status === "active" ? "default" : "secondary";

          return (
            <Badge variant={variant} className="capitalize gap-2">
              <Icon className="size-4" />
              {status}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Active", value: "active", icon: CheckCircle },
            { label: "Inactive", value: "inactive", icon: XCircle },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "dateOfBirth",
        accessorKey: "dateOfBirth",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date of Birth" />
        ),
        cell: ({ cell }) => {
          const dob = cell.getValue<Date | null>();
          return (
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-500" />
              {dob ? dob.toLocaleDateString() : "N/A"}
            </div>
          );
        },
      },
      {
        id: "appointments",
        accessorKey: "appointments",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Appointments" />
        ),
        cell: ({ cell }) => {
          const count = cell.getValue<number>();
          return (
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4 text-gray-500" />
              <span>{count}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: function Cell() {
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
                <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
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
      sorting: [{ id: "fullName", desc: false }],
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
