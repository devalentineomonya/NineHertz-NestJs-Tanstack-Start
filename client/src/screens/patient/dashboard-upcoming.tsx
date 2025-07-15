import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { FileText } from "lucide-react";

type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No-show";
};

const appointmentColumns = [
  {
    accessorKey: "patientName",
    header: "Patient",
    enableSorting: true,
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
    enableSorting: true,
  },
  {
    accessorKey: "department",
    header: "Department",
    enableSorting: true,
  },
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: true,
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusClass = {
        Scheduled: "bg-blue-100 text-blue-800",
        Completed: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800",
        "No-show": "bg-yellow-100 text-yellow-800",
      }[status];

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
        >
          {status}
        </span>
      );
    },
  },
];

// Mock data for appointments
const mockAppointments: Appointment[] = Array.from({ length: 10 }, (_, i) => ({
  id: `apt-${i + 1000}`,
  patientName: `Patient ${i + 1}`,
  doctorName: `Dr. ${
    ["Smith", "Johnson", "Williams", "Brown", "Jones"][i % 5]
  }`,
  department: [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Oncology",
    "Orthopedics",
  ][i % 5],
  date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
  time: `${9 + (i % 8)}:00 ${i % 2 ? "PM" : "AM"}`,
  status: ["Scheduled", "Completed", "Cancelled", "No-show"][i % 4] as any,
}));

export function PatientActivityTable() {
  const { table } = useDataTable({
    data: mockAppointments,
    columns: appointmentColumns,
    pageCount: Math.ceil(mockAppointments.length / 10),
    getRowId: (row) => row.id,
  });

  return (
    <div className="bg-background my-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Appointments
            </h3>
            <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              <FileText className="w-4 h-4 mr-1" />
              Export Report
            </button>
          </div>
        </div>
        <div className="p-1">
          <DataTable table={table} />
        </div>
      </div>
    </div>
  );
}
