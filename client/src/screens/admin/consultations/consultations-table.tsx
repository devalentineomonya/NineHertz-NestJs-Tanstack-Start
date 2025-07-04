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
  Activity,
  Calendar,
  Clock,
  MoreHorizontal,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

interface Consultation {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  videoSessionId: string | null;
  notes: string | null;
  recordingUrl: string | null;
  aiAnalysis: Record<string, any> | null;
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
  // Derived fields
  status: "completed" | "in-progress" | "scheduled" | "ended";
  durationText: string;
}

const data: Consultation[] = [
  {
    id: "1",
    startTime: new Date(2024, 5, 15, 10, 30),
    endTime: new Date(2024, 5, 15, 11, 15),
    duration: 45,
    videoSessionId: "vid_12345",
    notes: "Patient reported improved symptoms. Prescribed medication refill.",
    recordingUrl: "https://example.com/recordings/1",
    aiAnalysis: {
      sentiment: "positive",
      keyTopics: ["medication refill", "symptom improvement"],
    },
    patient: {
      id: "p1",
      fullName: "John Doe",
    },
    doctor: {
      id: "d1",
      fullName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
    },
    createdAt: new Date(2024, 5, 10),
    updatedAt: new Date(2024, 5, 15, 11, 30),
    status: "completed",
    durationText: "45 min",
  },
  {
    id: "2",
    startTime: new Date(2024, 5, 16, 14, 0),
    endTime: null,
    duration: null,
    videoSessionId: "vid_67890",
    notes: null,
    recordingUrl: null,
    aiAnalysis: null,
    patient: {
      id: "p2",
      fullName: "Jane Smith",
    },
    doctor: {
      id: "d2",
      fullName: "Dr. Michael Chen",
      specialty: "Neurology",
    },
    createdAt: new Date(2024, 5, 12),
    updatedAt: new Date(2024, 5, 12),
    status: "scheduled",
    durationText: "Scheduled",
  },
  {
    id: "3",
    startTime: new Date(2024, 5, 17, 11, 15),
    endTime: null,
    duration: 20,
    videoSessionId: "vid_54321",
    notes: "Ongoing consultation for chronic condition management",
    recordingUrl: "https://example.com/recordings/3",
    aiAnalysis: {
      sentiment: "neutral",
      keyTopics: ["chronic condition", "management plan"],
    },
    patient: {
      id: "p3",
      fullName: "Robert Johnson",
    },
    doctor: {
      id: "d3",
      fullName: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
    },
    createdAt: new Date(2024, 5, 15),
    updatedAt: new Date(2024, 5, 17, 11, 35),
    status: "in-progress",
    durationText: "20 min (ongoing)",
  },
  {
    id: "4",
    startTime: new Date(2024, 5, 14, 9, 0),
    endTime: new Date(2024, 5, 14, 9, 40),
    duration: 40,
    videoSessionId: "vid_98765",
    notes: "Initial consultation. Ordered lab tests.",
    recordingUrl: "https://example.com/recordings/4",
    aiAnalysis: {
      sentiment: "neutral",
      keyTopics: ["lab tests", "initial assessment"],
    },
    patient: {
      id: "p4",
      fullName: "Emily Wilson",
    },
    doctor: {
      id: "d4",
      fullName: "Dr. James Wilson",
      specialty: "Orthopedics",
    },
    createdAt: new Date(2024, 5, 5),
    updatedAt: new Date(2024, 5, 14, 10, 0),
    status: "completed",
    durationText: "40 min",
  },
  {
    id: "5",
    startTime: new Date(2024, 5, 18, 13, 45),
    endTime: new Date(2024, 5, 18, 14, 30),
    duration: 45,
    videoSessionId: null,
    notes: "Follow-up for skin condition. Prescribed topical treatment.",
    recordingUrl: null,
    aiAnalysis: {
      sentiment: "positive",
      keyTopics: ["skin condition", "topical treatment"],
    },
    patient: {
      id: "p5",
      fullName: "Michael Brown",
    },
    doctor: {
      id: "d5",
      fullName: "Dr. Priya Sharma",
      specialty: "Dermatology",
    },
    createdAt: new Date(2024, 5, 10),
    updatedAt: new Date(2024, 5, 18, 14, 45),
    status: "completed",
    durationText: "45 min",
  },
];

const statusVariants = {
  scheduled: "secondary",
  "in-progress": "warning",
  completed: "default",
  ended: "outline",
};

export function AdminConsultations() {
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
    return data.filter((consultation) => {
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

  const columns = React.useMemo<ColumnDef<Consultation>[]>(
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
        id: "duration",
        accessorKey: "durationText",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Duration" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-gray-500" />
            <span>{row.original.durationText}</span>
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
          const status = cell.getValue<Consultation["status"]>();
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
    data: filteredData,
    columns,
    pageCount: Math.ceil(filteredData.length / 10),
    initialState: {
      sorting: [{ id: "startTime", desc: true }],
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
