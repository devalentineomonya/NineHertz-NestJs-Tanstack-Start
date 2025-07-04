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
import { useAddAppointment } from "@/store/use-add-appointment-sidebar";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  CalendarCheck,
  CheckCircle,
  CircleSlash,
  Clock,
  MoreHorizontal,
  Plus,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  RESCHEDULED = "RESCHEDULED",
  NO_SHOW = "NO_SHOW",
}

interface Appointment {
  id: string;
  datetime: Date;
  status: AppointmentStatus;
  patient: {
    id: string;
    fullName: string;
  };
  doctor: {
    id: string;
    fullName: string;
    specialty: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const data: Appointment[] = [
  {
    id: "1",
    datetime: new Date(2024, 5, 15, 10, 30),
    status: AppointmentStatus.SCHEDULED,
    patient: {
      id: "p1",
      fullName: "John Doe",
    },
    doctor: {
      id: "d1",
      fullName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
    },
    createdAt: new Date(2024, 5, 1),
    updatedAt: new Date(2024, 5, 1),
  },
  {
    id: "2",
    datetime: new Date(2024, 5, 16, 14, 0),
    status: AppointmentStatus.COMPLETED,
    patient: {
      id: "p2",
      fullName: "Jane Smith",
    },
    doctor: {
      id: "d2",
      fullName: "Dr. Michael Chen",
      specialty: "Neurology",
    },
    createdAt: new Date(2024, 4, 20),
    updatedAt: new Date(2024, 5, 16, 15, 30),
  },
  {
    id: "3",
    datetime: new Date(2024, 5, 17, 11, 15),
    status: AppointmentStatus.CANCELLED,
    patient: {
      id: "p3",
      fullName: "Robert Johnson",
    },
    doctor: {
      id: "d3",
      fullName: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
    },
    createdAt: new Date(2024, 5, 5),
    updatedAt: new Date(2024, 5, 10),
  },
  {
    id: "4",
    datetime: new Date(2024, 5, 18, 9, 0),
    status: AppointmentStatus.SCHEDULED,
    patient: {
      id: "p4",
      fullName: "Emily Wilson",
    },
    doctor: {
      id: "d4",
      fullName: "Dr. James Wilson",
      specialty: "Orthopedics",
    },
    createdAt: new Date(2024, 4, 25),
    updatedAt: new Date(2024, 4, 25),
  },
  {
    id: "5",
    datetime: new Date(2024, 5, 19, 13, 45),
    status: AppointmentStatus.RESCHEDULED,
    patient: {
      id: "p5",
      fullName: "Michael Brown",
    },
    doctor: {
      id: "d5",
      fullName: "Dr. Priya Sharma",
      specialty: "Dermatology",
    },
    createdAt: new Date(2024, 5, 2),
    updatedAt: new Date(2024, 5, 10),
  },
  {
    id: "6",
    datetime: new Date(2024, 5, 20, 15, 30),
    status: AppointmentStatus.NO_SHOW,
    patient: {
      id: "p3",
      fullName: "Robert Johnson",
    },
    doctor: {
      id: "d1",
      fullName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
    },
    createdAt: new Date(2024, 4, 15),
    updatedAt: new Date(2024, 5, 20, 16, 0),
  },
];

export function AdminAppointments() {
  const [patientName] = useQueryState(
    "patientName",
    parseAsString.withDefault("")
  );
  const [doctorName] = useQueryState(
    "doctorName",
    parseAsString.withDefault("")
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [dateRange] = useQueryState(
    "dateRange",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data.filter((appointment) => {
      const matchesPatient =
        patientName === "" ||
        appointment.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());
      const matchesDoctor =
        doctorName === "" ||
        appointment.doctor.fullName
          .toLowerCase()
          .includes(doctorName.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(appointment.status);

      // Simple date filtering (for demo purposes)
      const matchesDateRange = dateRange.length === 0 || true;

      return (
        matchesPatient && matchesDoctor && matchesStatus && matchesDateRange
      );
    });
  }, [patientName, doctorName, status, dateRange]);

  const statusIcons = {
    [AppointmentStatus.SCHEDULED]: Calendar,
    [AppointmentStatus.COMPLETED]: CheckCircle,
    [AppointmentStatus.CANCELLED]: XCircle,
    [AppointmentStatus.RESCHEDULED]: CalendarCheck,
    [AppointmentStatus.NO_SHOW]: CircleSlash,
  };

  const statusVariants = {
    [AppointmentStatus.SCHEDULED]: "secondary",
    [AppointmentStatus.COMPLETED]: "default",
    [AppointmentStatus.CANCELLED]: "destructive",
    [AppointmentStatus.RESCHEDULED]: "warning",
    [AppointmentStatus.NO_SHOW]: "outline",
  };

  const columns = React.useMemo<ColumnDef<Appointment>[]>(
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
        id: "datetime",
        accessorKey: "datetime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date & Time" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-500" />
                <span className="font-medium">{date.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="size-4 text-gray-500" />
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        },
        meta: {
          label: "Date",
          variant: "date",
          icon: Calendar,
        },
        enableColumnFilter: true,
      },
      {
        id: "patient",
        accessorFn: (row) => row.patient.fullName,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Patient" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
            <div className="font-medium">{row.original.patient.fullName}</div>
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
        id: "doctor",
        accessorFn: (row) => row.doctor.fullName,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Doctor" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
            <div>
              <div className="font-medium">{row.original.doctor.fullName}</div>
              <div className="text-sm text-gray-500">
                {row.original.doctor.specialty}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Doctor",
          placeholder: "Search doctors...",
          variant: "text",
          icon: Stethoscope,
        },
        enableColumnFilter: true,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<AppointmentStatus>();
          const Icon = statusIcons[status];
          const variant = statusVariants[status] as
            | "default"
            | "destructive"
            | "secondary"
            | "warning"
            | "outline";

          return (
            <Badge variant={variant} className="capitalize gap-2">
              <Icon className="size-4" />
              {status.toLowerCase()}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            {
              label: "Scheduled",
              value: AppointmentStatus.SCHEDULED,
              icon: Calendar,
            },
            {
              label: "Completed",
              value: AppointmentStatus.COMPLETED,
              icon: CheckCircle,
            },
            {
              label: "Cancelled",
              value: AppointmentStatus.CANCELLED,
              icon: XCircle,
            },
            {
              label: "Rescheduled",
              value: AppointmentStatus.RESCHEDULED,
              icon: CalendarCheck,
            },
            {
              label: "No Show",
              value: AppointmentStatus.NO_SHOW,
              icon: CircleSlash,
            },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return (
            <div className="text-sm text-gray-500">
              {date.toLocaleDateString()}
            </div>
          );
        },
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
                <DropdownMenuItem>
                  {row.original.status === AppointmentStatus.SCHEDULED
                    ? "Reschedule"
                    : "Reschedule (New)"}
                </DropdownMenuItem>
                {row.original.status === AppointmentStatus.SCHEDULED && (
                  <DropdownMenuItem variant="destructive">
                    Cancel Appointment
                  </DropdownMenuItem>
                )}
                {row.original.status !== AppointmentStatus.COMPLETED && (
                  <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                )}
                {row.original.status === AppointmentStatus.SCHEDULED && (
                  <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                )}
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
      sorting: [{ id: "datetime", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });
  const { onOpen } = useAddAppointment();
  return (
    <div className="data-table-container">
      <div className="my-4">
        <Button variant={"primary"} className="max-w-56" onClick={onOpen}>
          <Plus />
          Create Appointment
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
