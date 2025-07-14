import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
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
import { useDataTable } from "@/hooks/use-data-table";
import { useGetConsultations } from "@/services/consultations/use-get-consultations";
import { useAddConsultationStore } from "@/stores/use-add-consultation-store";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Activity,
  Calendar,
  Clock,
  MoreHorizontal,
  PlusSquare,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

const statusVariants = {
  scheduled: "secondary",
  "in-progress": "warning",
  completed: "default",
  ended: "outline",
};

export function AdminConsultations() {
  const { data, isLoading } = useGetConsultations();
  const { onOpen } = useAddConsultationStore();
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
    return data?.data?.filter((consultation) => {
      const matchesPatient =
        patientName === "" ||
        consultation.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());
      const matchesDoctor =
        doctorName === "" ||
        consultation.doctor.fullName
          .toLowerCase()
          .includes(doctorName.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(consultation.status);

      // Simple date filtering (for demo purposes)
      const matchesDateRange = dateRange.length === 0 || true;

      return (
        matchesPatient && matchesDoctor && matchesStatus && matchesDateRange
      );
    });
  }, [patientName, doctorName, status, dateRange]);

  const columns = React.useMemo<ColumnDef<ConsultationResponseDto>[]>(
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
              {format(
                new Date(0, 0, 0, 0, row.original.duration),
                "H 'h' mm 'm'"
              )}
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
                <DropdownMenuItem>View Notes</DropdownMenuItem>
                {row.original.recordingUrl && (
                  <DropdownMenuItem>Watch Recording</DropdownMenuItem>
                )}
                {row.original.aiAnalysis && (
                  <DropdownMenuItem>View AI Analysis</DropdownMenuItem>
                )}
                {row.original.status === "scheduled" && (
                  <DropdownMenuItem>Start Consultation</DropdownMenuItem>
                )}
                {row.original.status === "in-progress" && (
                  <DropdownMenuItem>Join Consultation</DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive">
                  Delete Record
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
    data: filteredData ?? [],
    columns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "startTime", desc: true }],
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
      <div className="w-fit min-w-56 mb-2">
        <Button variant={"primary"} onClick={onOpen}>
          <PlusSquare />
          Add Consultation
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
