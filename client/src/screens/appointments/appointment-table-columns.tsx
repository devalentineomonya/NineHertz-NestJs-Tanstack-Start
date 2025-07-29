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
import { useCancelAppointmentStore } from "@/stores/use-cancel-appointment-store";
import { useMarkAsCompleteStore } from "@/stores/use-mark-as-complete-store";
import { useRescheduleAppointmentStore } from "@/stores/use-reschedule-appointment";
import { useSendReminderStore } from "@/stores/use-send-reminder-store";
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
  Video,
  Monitor,
  Copy,
  Check,
} from "lucide-react";
import { useUserSessionStore } from "@/stores/user-session-store";
import { useEditAppointmentStore } from "@/stores/use-edit-appointment-store";
import React from "react";

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

enum AppointmentMode {
  VIRTUAL = "virtual",
  PHYSICAL = "physical",
}

enum AppointmentType {
  CONSULTATION = "consultation",
  CHECKUP = "checkup",
  FOLLOW_UP = "follow_up",
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

// Add custom filter functions
const dateRangeFilterFn = (row: any, columnId: string, value: [Date, Date]) => {
  if (!value || value.length !== 2) return true;
  const [start, end] = value;
  const rowValue = new Date(row.getValue(columnId));
  return rowValue >= start && rowValue <= end;
};

const multiSelectFilterFn = (row: any, columnId: string, value: string[]) => {
  if (!value || value.length === 0) return true;
  const rowValue = row.getValue(columnId);
  return value.includes(rowValue);
};

const textFilterFn = (row: any, columnId: string, value: string) => {
  if (!value) return true;
  const rowValue = row.getValue(columnId);
  return rowValue?.toLowerCase().includes(value.toLowerCase());
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
      const date = new Date(cell.getValue<string>());
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-500" />
            <span className="font-medium">{format(date, "MMMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="size-4 text-gray-500" />
            {format(date, "hh:mm a")}
          </div>
        </div>
      );
    },
    // Add proper sorting function for dates
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime();
    },
    // Add custom filter function for date ranges
    filterFn: dateRangeFilterFn,
    meta: {
      label: "Date",
      variant: "date",
      icon: Calendar,
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "type",
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<AppointmentType>();
      return (
        <Badge variant="secondary" className="capitalize">
          {type?.replace("_", " ")}
        </Badge>
      );
    },
    // Add custom filter function
    filterFn: multiSelectFilterFn,
    // Add sorting function
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = rowA.getValue(columnId) as string;
      const valueB = rowB.getValue(columnId) as string;
      return valueA?.localeCompare(valueB) || 0;
    },
    meta: {
      label: "Type",
      variant: "multiSelect",
      options: Object.values(AppointmentType).map((value) => ({
        label: value.replace("_", " "),
        value,
      })),
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "mode",
    accessorKey: "mode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mode" />
    ),
    cell: ({ cell }) => {
      const mode = cell.getValue<AppointmentMode>();
      const Icon = mode === AppointmentMode.VIRTUAL ? Video : Monitor;
      return (
        <Badge variant="outline" className="capitalize gap-1">
          <Icon className="size-4" />
          {mode}
        </Badge>
      );
    },
    // Add custom filter function
    filterFn: multiSelectFilterFn,
    // Add sorting function
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = rowA.getValue(columnId) as string;
      const valueB = rowB.getValue(columnId) as string;
      return valueA?.localeCompare(valueB) || 0;
    },
    meta: {
      label: "Mode",
      variant: "multiSelect",
      options: [
        { label: "Virtual", value: AppointmentMode.VIRTUAL, icon: Video },
        { label: "Physical", value: AppointmentMode.PHYSICAL, icon: Monitor },
      ],
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  // Add to your appointmentColumns array
  {
    id: "videoSessionId",
    accessorKey: "videoSessionId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Video Session ID" />
    ),
    cell: ({ cell }) => {
      const sessionId = cell.getValue<string>();
      const [copied, setCopied] = React.useState(false);

      const handleCopy = () => {
        if (!sessionId) return;

        navigator.clipboard.writeText(sessionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      };

      return sessionId ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{sessionId}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      );
    },
    enableColumnFilter: true,
    filterFn: textFilterFn,
    meta: {
      label: "Session ID",
      placeholder: "Search IDs...",
      variant: "text",
    },
  },
  {
    id: "patient",
    accessorFn: (row) => row.patient?.fullName || "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient" />
    ),
    cell: ({ row }) => {
      const patient = row.original.patient;
      if (!patient) return null;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-md overflow-hidden">
            <AvatarImage
              src={`https://avatar.vercel.sh/${
                row.original.id
              }.png?name=${encodeURIComponent(patient.fullName)}`}
              alt={patient.fullName}
            />
            <AvatarFallback>
              {patient.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{patient.fullName}</div>
        </div>
      );
    },
    // Add custom filter function
    filterFn: textFilterFn,
    // Add sorting function
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = rowA.getValue(columnId) as string;
      const valueB = rowB.getValue(columnId) as string;
      return valueA?.localeCompare(valueB) || 0;
    },
    meta: {
      label: "Patient",
      placeholder: "Search patients...",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "doctor",
    accessorFn: (row) => row.doctor?.fullName || "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Doctor" />
    ),
    cell: ({ row }) => {
      const doctor = row.original.doctor;
      if (!doctor) return null;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-md overflow-hidden">
            <AvatarImage
              src={`https://avatar.vercel.sh/${
                row.original.id
              }.png?name=${encodeURIComponent(doctor.fullName)}`}
              alt={doctor.fullName}
            />
            <AvatarFallback>
              {doctor.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{doctor.fullName}</div>
            <div className="text-sm text-gray-500">{doctor.specialty}</div>
          </div>
        </div>
      );
    },
    // Add custom filter function
    filterFn: textFilterFn,
    // Add sorting function
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = rowA.getValue(columnId) as string;
      const valueB = rowB.getValue(columnId) as string;
      return valueA?.localeCompare(valueB) || 0;
    },
    meta: {
      label: "Doctor",
      placeholder: "Search doctors...",
      variant: "text",
      icon: Stethoscope,
    },
    enableColumnFilter: true,
    enableSorting: true,
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
    // Add custom filter function
    filterFn: multiSelectFilterFn,
    // Add sorting function with custom order
    sortingFn: (rowA, rowB, columnId) => {
      const statusOrder = {
        [AppointmentStatus.SCHEDULED]: 0,
        [AppointmentStatus.COMPLETED]: 1,
        [AppointmentStatus.CANCELLED]: 2,
      };

      const valueA = rowA.getValue(columnId) as AppointmentStatus;
      const valueB = rowB.getValue(columnId) as AppointmentStatus;

      return (statusOrder[valueA] ?? 999) - (statusOrder[valueB] ?? 999);
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
    enableSorting: true,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ cell }) => {
      const date = new Date(cell.getValue<string>());
      return (
        <div className="text-sm text-gray-500">
          {format(date, "MMMM dd, yyyy")}
        </div>
      );
    },
    // Add proper sorting function for dates
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime();
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { onOpen: onViewAppointment } = useViewAppointmentStore();
      const { onOpen: onRescheduleAppointment } =
        useRescheduleAppointmentStore();
      const { onOpen: onCancelAppointment } = useCancelAppointmentStore();
      const { onOpen: onSendReminder } = useSendReminderStore();
      const { onOpen: onMarkAsComplete } = useMarkAsCompleteStore();
      const { onOpen: onEditAppointment } = useEditAppointmentStore();
      const { getCurrentUser } = useUserSessionStore();
      const currentUser = getCurrentUser();

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

            {/* Disable edit/reschedule for cancelled appointments */}
            {row.original.status !== AppointmentStatus.CANCELLED && (
              <>
                <DropdownMenuItem
                  onClick={() => onEditAppointment(row.original.id)}
                  disabled={
                    (row.original.status as AppointmentStatus) ===
                    AppointmentStatus.CANCELLED
                  }
                >
                  Edit Appointment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRescheduleAppointment(row.original.id)}
                  disabled={
                    (row.original.status as AppointmentStatus) ===
                    AppointmentStatus.CANCELLED
                  }
                >
                  {row.original.status === AppointmentStatus.SCHEDULED
                    ? "Reschedule"
                    : "Reschedule (New)"}
                </DropdownMenuItem>
              </>
            )}

            {/* Cancellation only for scheduled appointments */}
            {row.original.status === AppointmentStatus.SCHEDULED && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onCancelAppointment(row.original.id)}
              >
                Cancel Appointment
              </DropdownMenuItem>
            )}

            {/* Admin/doctor actions */}
            {(currentUser?.role === "admin" ||
              currentUser?.role === "doctor") && (
              <>
                {row.original.status !== AppointmentStatus.COMPLETED &&
                  row.original.mode === "physical" &&
                  row.original.status !== AppointmentStatus.CANCELLED && (
                    <DropdownMenuItem
                      onClick={() => onMarkAsComplete(row.original.id)}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                {row.original.status === AppointmentStatus.SCHEDULED && (
                  <DropdownMenuItem
                    onClick={() => onSendReminder(row.original.id)}
                  >
                    Send Reminder
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
    enableSorting: false,
    enableHiding: false,
  },
];
