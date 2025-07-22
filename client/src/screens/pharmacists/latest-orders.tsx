import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Users,
  Stethoscope,
  Clock,
  CalendarCheck,
  FileText,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_layout/(admin)/admin/dashboard")({
  component: AdminDashboard,
});

// Mock data types for appointments
type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No-show";
};

// Appointment table columns
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
    cell: () => {
      // const status = row.original.status;
      // const statusClass = {
      //   Scheduled: "bg-blue-100 text-blue-800",
      //   Completed: "bg-green-100 text-green-800",
      //   Cancelled: "bg-red-100 text-red-800",
      //   "No-show": "bg-yellow-100 text-yellow-800",
      // }[status];

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium`}
        >
          {/* {status} */}
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

// Latest orders data
const orders = [
  { id: "ORD-007", customer: "Ekaterina Tankova", date: "Jun 26, 2025", status: "pending" },
  { id: "ORD-006", customer: "Cao Yu", date: "Jun 26, 2025", status: "delivered" },
  { id: "ORD-004", customer: "Alexa Richardson", date: "Jun 26, 2025", status: "refunded" },
  { id: "ORD-003", customer: "Anje Keizer", date: "Jun 26, 2025", status: "pending" },
  { id: "ORD-002", customer: "Clarke Gillebert", date: "Jun 26, 2025", status: "delivered" },
  { id: "ORD-001", customer: "Adam Denisov", date: "Jun 26, 2025", status: "delivered" },
];

function AdminDashboard() {
  // Stats data
  const stats = [
    {
      title: "Total Patients",
      value: "1,842",
      icon: <Users className="w-6 h-6" />,
      change: "+12% from last month",
      color: "bg-gradient-to-r from-blue-400 to-blue-600",
    },
    {
      title: "Active Appointments",
      value: "124",
      icon: <CalendarCheck className="w-6 h-6" />,
      change: "+8% from yesterday",
      color: "bg-gradient-to-r from-green-400 to-green-600",
    },
    {
      title: "Doctors On Duty",
      value: "28",
      icon: <Stethoscope className="w-6 h-6" />,
      change: "5 on leave",
      color: "bg-gradient-to-r from-purple-400 to-purple-600",
    },
    {
      title: "Avg. Wait Time",
      value: "15 min",
      icon: <Clock className="w-6 h-6" />,
      change: "-3 min from last week",
      color: "bg-gradient-to-r from-amber-400 to-amber-600",
    },
  ];

  // For the appointments table
  const { table } = useDataTable({
    data: mockAppointments,
    columns: appointmentColumns,
    pageCount: Math.ceil(mockAppointments.length / 10),
    getRowId: (row) => row.id,
  });

  const departments = [
    { name: "Cardiology", value: 24, color: "#3b82f6" }, // blue-500
    { name: "Pediatrics", value: 18, color: "#22c55e" }, // green-500
    { name: "Orthopedics", value: 15, color: "#f59e0b" }, // amber-500
    { name: "Neurology", value: 12, color: "#a855f7" }, // purple-500
    { name: "Oncology", value: 8, color: "#ef4444" }, // rose-500
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointments Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointments Trend
            </h3>
            <div className="flex space-x-2">
              <button className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                Week
              </button>
              <button className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                Month
              </button>
              <button className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                Year
              </button>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Appointments visualization chart</p>
              <p className="text-sm text-gray-400 mt-1">
                (Would show appointment trends over time)
              </p>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Department Distribution
          </h3>

          <div className="space-y-4">
            {departments.map((dept, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-600">
                  {dept.name}
                </div>
                <div className="flex-1 ml-4">
                  <Progress
                    value={dept.value}
                    className="h-2.5"
                    style={{
                      backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`,
                      backgroundSize: "16px 16px",
                      backgroundColor: dept.color,
                    }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium">
                  {dept.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Combined Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Appointments Table */}
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

        {/* Latest Orders Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Latest Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "success"
                            : order.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              View all
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
