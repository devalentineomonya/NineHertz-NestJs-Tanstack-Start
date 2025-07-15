import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteConsultationStore } from "@/stores/use-delete-consultation-store";
import { useViewConsultationStore } from "@/stores/use-view-consultation-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Activity,
  Calendar,
  Clock,
  MoreHorizontal,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
const statusVariants = {
  scheduled: "secondary",
  "in-progress": "warning",
  completed: "default",
  ended: "outline",
};

export const consultationColumns: ColumnDef<ConsultationResponseDto>[] = [
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
    id: "startTime",
    accessorKey: "startTime",
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
              {format(new Date(date), "MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="size-4 text-gray-500" />
            {format(new Date(date), "hh:mm a")}
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
            src={`https://avatar.vercel.sh/${encodeURIComponent(
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
            src={`https://avatar.vercel.sh/${encodeURIComponent(
              row.original.doctor.fullName
            )}`}
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
    id: "duration",
    accessorKey: "durationText",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-gray-500" />
        <span>
          {format(new Date(0, 0, 0, 0, row.original.duration), "H 'h' mm 'm'")}
        </span>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<ConsultationResponseDto["status"]>();
      const variant = statusVariants[status] as
        | "default"
        | "secondary"
        | "warning"
        | "outline";

      return (
        <Badge variant={variant} className="capitalize">
          {status.replace("-", " ")}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Scheduled", value: "scheduled" },
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
        { label: "Ended", value: "ended" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "recording",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recording" />
    ),
    cell: ({ row }) => {
      const hasRecording = !!row.original.recordingUrl;
      return hasRecording ? (
        <a
          href={row.original.recordingUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <Video className="size-4 mr-2" />
          <span>View</span>
        </a>
      ) : (
        <span className="text-gray-400">None</span>
      );
    },
  },
  {
    id: "aiAnalysis",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AI Analysis" />
    ),
    cell: ({ row }) => {
      const hasAnalysis = !!row.original.aiAnalysis;
      return hasAnalysis ? (
        <Badge variant="secondary">
          <Activity className="size-4 mr-2" />
          <span>Available</span>
        </Badge>
      ) : (
        <span className="text-gray-400">None</span>
      );
    },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { onOpen: onViewConsultation } = useViewConsultationStore();
      const { onOpen: onDeleteConsultation } = useDeleteConsultationStore();
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
              onClick={() => onViewConsultation(row.original.id, row.original)}
            >
              View Details
            </DropdownMenuItem>

            {row.original.recordingUrl && (
              <DropdownMenuItem>Watch Recording</DropdownMenuItem>
            )}
            {row.original.aiAnalysis && (
              <DropdownMenuItem>View AI Analysis</DropdownMenuItem>
            )}
            {row.original.status === "scheduled" &&
              row.original.doctor.id === currentUser?.id && (
                <DropdownMenuItem>
                  <Link
                    to="/call/join/$callId"
                    params={{ callId: row.original.videoSessionId }}
                  >
                    Start Consultation
                  </Link>
                </DropdownMenuItem>
              )}

            {row.original.status === "in-progress" && (
              <DropdownMenuItem>Join Consultation</DropdownMenuItem>
            )}
            {currentUser?.role === "admin" && (
              <DropdownMenuItem
                onClick={() => onDeleteConsultation(row.original.id)}
                variant="destructive"
              >
                Delete Record
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
