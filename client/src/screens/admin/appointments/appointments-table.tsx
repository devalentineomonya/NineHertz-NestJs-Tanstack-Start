import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
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
import { useGetAppointments } from "@/services/appointments/use-get-appointments";
import { useAddAppointmentStore } from "@/stores/use-add-appointment-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Plus,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { format } from "date-fns";

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export function AdminAppointments() {
  const { data, isLoading } = useGetAppointments();
  const { onOpen } = useAddAppointmentStore();
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
    return data?.data.filter((appointment) => {
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
  };

  const statusVariants = {
    [AppointmentStatus.SCHEDULED]: "warning",
    [AppointmentStatus.COMPLETED]: "success",
    [AppointmentStatus.CANCELLED]: "destructive",
  };

  const columns = React.useMemo<ColumnDef<AppointmentResponseDto>[]>(
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
                <span className="font-medium">
                  {" "}
                  {format(date, "MMMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="size-4 text-gray-500" />
                {format(date, "hh:mm a")}
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
            <Avatar className="w-10 h-10 rounded-md overflow-hidden">
              <AvatarImage
                src={`https://avatar.vercel.sh/${
                  row.original.id
                }.png?name=${encodeURIComponent(
                  row.original.patient.fullName
                )}`}
                alt={row.original.patient.fullName}
              />
              <AvatarFallback>
                {row.original.patient.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
            <Avatar className="w-10 h-10 rounded-md overflow-hidden">
              <AvatarImage
                src={`https://avatar.vercel.sh/${
                  row.original.id
                }.png?name=${encodeURIComponent(row.original.doctor.fullName)}`}
                alt={row.original.doctor.fullName}
              />
              <AvatarFallback>
                {row.original.doctor.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
              {/* <Icon className="size-4" /> */}
              {status ?? "null"}
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
              {format(date, "MMMM dd, yyyy")}
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
    data: filteredData ?? [],
    columns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "datetime", desc: false }],
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
