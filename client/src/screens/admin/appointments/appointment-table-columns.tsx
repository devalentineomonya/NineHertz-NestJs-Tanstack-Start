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
import { useRescheduleAppointmentStore } from "@/stores/use-reschedule-appointment";
import useViewAppointmentStore from "@/stores/use-view-appointment-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

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

export const appointmentColumns: ColumnDef<AppointmentResponseDto>[] = [
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
            }.png?name=${encodeURIComponent(row.original.patient.fullName)}`}
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
          <Icon className="size-4" />
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
      const { onOpen: onViewAppointment } = useViewAppointmentStore();
      const { onOpen: onRescheduleAppointment } =
        useRescheduleAppointmentStore();
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
              onClick={() => onViewAppointment(row.original.id, row.original)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRescheduleAppointment(row.original.id)}
            >
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
];
