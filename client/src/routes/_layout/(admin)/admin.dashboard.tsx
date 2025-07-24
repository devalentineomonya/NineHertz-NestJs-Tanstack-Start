import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CalendarCheck,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Stethoscope,
  Users,
  Video,
  Monitor,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminDashboard } from "@/services/dashboard/use-get-admin-dashboard";
import { JSX } from "react";

export const Route = createFileRoute("/_layout/(admin)/admin/dashboard")({
  component: AdminDashboard,
});

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

const iconMap: Record<string, JSX.Element> = {
  users: <Users />,
  stethoscope: <Stethoscope />,
  calendarCheck: <CalendarCheck />,
  clock: <Clock />,
};
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const appointmentColumns: ColumnDef<AppointmentResponseDto>[] = [
  {
    id: "patient",
    accessorFn: (row) => row.patient.fullName,
    header: "Patient",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.patient.fullName}</div>
    ),
  },
  {
    id: "doctor",
    accessorFn: (row) => row.doctor.fullName,
    header: "Doctor",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.doctor.fullName}</div>
        <div className="text-sm text-gray-500">
          {row.original.doctor.specialty}
        </div>
      </div>
    ),
  },
  {
    id: "datetime",
    accessorKey: "datetime",
    header: "Date & Time",
    cell: ({ cell }) => {
      const date = cell.getValue<Date>();
      return (
        <div className="flex flex-col text-sm">
          <span>{format(date, "MMMM dd, yyyy")}</span>
          <span className="text-gray-500">{format(date, "hh:mm a")}</span>
        </div>
      );
    },
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Appointment Type",
    cell: ({ cell }) => {
      const type = cell.getValue<AppointmentType>();
      return (
        <Badge variant="secondary" className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    id: "mode",
    accessorKey: "mode",
    header: "Appointment Mode",
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
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
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
  },
];

function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboard();

  // Stats data from API
  const stats = data?.stats || [];
  // Departments data from API
  const departments = data?.departments || [];
  // Appointments data from API
  const appointments = data?.appointments || [];

  // DataTable hook with API data
  const { table } = useDataTable({
    data: appointments,
    columns: appointmentColumns,
    pageCount: Math.ceil(appointments.length / 10),
    getRowId: (row) => String(row.id),
  });

  // Skeleton for stats cards
  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((id) => (
        <Card key={id}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-3/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Actual stats cards
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-2xl font-bold mt-1">
                  {stat.value}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {iconMap[stat.icon]}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Skeleton for appointments chart
  const renderChartSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );

  // Skeleton for department stats
  const renderDepartmentSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4, 5].map((id) => (
          <div key={id} className="flex items-center">
            <Skeleton className="h-4 w-24" />
            <div className="flex-1 ml-4">
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Skeleton for appointments table
  const renderTableSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-8 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-16" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  console.log(typeof departments, "Departments", departments);

  return (
    <div className="bg-background min-h-screen p-4">
      {/* Stats Grid */}
      {isLoading ? renderStatsSkeleton() : renderStats()}

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointments Chart */}
        {isLoading ? (
          renderChartSkeleton()
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointments Trend</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Appointments visualization chart
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    (Would show appointment trends over time)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department Stats */}
        {isLoading ? (
          renderDepartmentSkeleton()
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {"departments" in departments &&
                  departments.departments.map((dept, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-32 text-sm font-medium text-gray-600">
                        {dept.specialty}
                      </div>
                      <div className="flex-1 ml-4">
                        <Progress
                          value={dept.count as unknown as number}
                          className="h-2.5"
                          // style={{
                          //   backgroundColor: dept.,
                          // }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium">
                        {dept.count}%
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Appointments Table */}
      {isLoading ? (
        renderTableSkeleton()
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Appointments</CardTitle>
              <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                <FileText className="w-4 h-4 mr-1" />
                Export Report
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable table={table} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
