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
  Clock,
  DollarSign,
  HeartPulse,
  MoreHorizontal,
  User,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  availability: { days: string[]; hours: string[] };
  consultationFee: number;
  licenseNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Derived fields
  appointmentCount: number;
  status: "active" | "on leave";
}

const data: Doctor[] = [
  {
    id: "1",
    fullName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: ["09:00-12:00", "14:00-17:00"],
    },
    consultationFee: 150,
    licenseNumber: "MD123456",
    createdAt: new Date(2020, 5, 15),
    updatedAt: new Date(2023, 8, 22),
    appointmentCount: 24,
    status: "active",
  },
  {
    id: "2",
    fullName: "Dr. Michael Chen",
    specialty: "Neurology",
    availability: {
      days: ["Tuesday", "Thursday"],
      hours: ["10:00-13:00", "15:00-18:00"],
    },
    consultationFee: 175,
    licenseNumber: "MD654321",
    createdAt: new Date(2018, 2, 10),
    updatedAt: new Date(2024, 0, 15),
    appointmentCount: 18,
    status: "active",
  },
  {
    id: "3",
    fullName: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    availability: {
      days: ["Monday", "Tuesday", "Thursday", "Saturday"],
      hours: ["08:00-12:00"],
    },
    consultationFee: 125,
    licenseNumber: "PD789012",
    createdAt: new Date(2022, 7, 30),
    updatedAt: new Date(2023, 11, 5),
    appointmentCount: 32,
    status: "on leave",
  },
  {
    id: "4",
    fullName: "Dr. James Wilson",
    specialty: "Orthopedics",
    availability: {
      days: ["Wednesday", "Friday"],
      hours: ["08:00-11:00", "13:00-16:00"],
    },
    consultationFee: 200,
    licenseNumber: "OR345678",
    createdAt: new Date(2019, 11, 1),
    updatedAt: new Date(2024, 2, 10),
    appointmentCount: 15,
    status: "active",
  },
  {
    id: "5",
    fullName: "Dr. Priya Sharma",
    specialty: "Dermatology",
    availability: {
      days: ["Monday", "Wednesday", "Friday", "Sunday"],
      hours: ["10:00-14:00"],
    },
    consultationFee: 160,
    licenseNumber: "DT901234",
    createdAt: new Date(2021, 3, 18),
    updatedAt: new Date(2023, 9, 30),
    appointmentCount: 27,
    status: "active",
  },
];

export function AdminDoctors() {
  const [fullName] = useQueryState("fullName", parseAsString.withDefault(""));
  const [specialty] = useQueryState(
    "specialty",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data.filter((doctor) => {
      const matchesName =
        fullName === "" ||
        doctor.fullName.toLowerCase().includes(fullName.toLowerCase());
      const matchesSpecialty =
        specialty.length === 0 || specialty.includes(doctor.specialty);
      const matchesStatus =
        status.length === 0 || status.includes(doctor.status);

      return matchesName && matchesSpecialty && matchesStatus;
    });
  }, [fullName, specialty, status]);

  const columns = React.useMemo<ColumnDef<Doctor>[]>(
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
          <DataTableColumnHeader column={column} title="Doctor" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <div>
              <div className="font-medium">{row.original.fullName}</div>
              <div className="text-sm text-gray-500">
                {row.original.licenseNumber || "License pending"}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Doctor",
          placeholder: "Search doctors...",
          variant: "text",
          icon: User,
        },
        enableColumnFilter: true,
      },
      {
        id: "specialty",
        accessorKey: "specialty",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Specialty" />
        ),
        cell: ({ cell }) => (
          <Badge variant="secondary" className="capitalize">
            <HeartPulse className="size-4 mr-2" />
            {cell.getValue<string>()}
          </Badge>
        ),
        meta: {
          label: "Specialty",
          variant: "multiSelect",
          options: [
            { label: "Cardiology", value: "Cardiology" },
            { label: "Neurology", value: "Neurology" },
            { label: "Pediatrics", value: "Pediatrics" },
            { label: "Orthopedics", value: "Orthopedics" },
            { label: "Dermatology", value: "Dermatology" },
          ],
          icon: HeartPulse,
        },
        enableColumnFilter: true,
      },
      {
        id: "availability",
        accessorKey: "availability",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Availability" />
        ),
        cell: ({ row }) => {
          const { days, hours } = row.original.availability;
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-500" />
                <span className="font-medium">{days.join(", ")}</span>
              </div>
              <div className="text-sm text-gray-500">{hours.join(" & ")}</div>
            </div>
          );
        },
        meta: {
          label: "Availability",
          placeholder: "Filter by days...",
          variant: "multiSelect",
          options: [
            { label: "Monday", value: "Monday" },
            { label: "Tuesday", value: "Tuesday" },
            { label: "Wednesday", value: "Wednesday" },
            { label: "Thursday", value: "Thursday" },
            { label: "Friday", value: "Friday" },
            { label: "Saturday", value: "Saturday" },
            { label: "Sunday", value: "Sunday" },
          ],
          icon: Clock,
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValues: string[]) => {
          if (filterValues.length === 0) return true;
          const availabilityDays = row.original.availability.days;
          return filterValues.some((day) => availabilityDays.includes(day));
        },
      },
      {
        id: "consultationFee",
        accessorKey: "consultationFee",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fee" />
        ),
        cell: ({ cell }) => {
          const fee = cell.getValue<number>();
          return (
            <div className="flex items-center gap-1">
              <DollarSign className="size-4" />
              <span className="font-medium">{fee.toFixed(2)}</span>
              <span className="text-gray-500 text-sm">/consult</span>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<Doctor["status"]>();
          const variant = status === "active" ? "default" : "secondary";

          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Active", value: "active" },
            { label: "On Leave", value: "on leave" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "appointmentCount",
        accessorKey: "appointmentCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Appointments" />
        ),
        cell: ({ cell }) => {
          const count = cell.getValue<number>();
          return (
            <Badge variant="outline">
              {count} {count === 1 ? "appt" : "appts"}
            </Badge>
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
                <DropdownMenuItem>View Schedule</DropdownMenuItem>
                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                <DropdownMenuItem>Update Availability</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Suspend Account
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
      sorting: [{ id: "appointmentCount", desc: true }],
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
