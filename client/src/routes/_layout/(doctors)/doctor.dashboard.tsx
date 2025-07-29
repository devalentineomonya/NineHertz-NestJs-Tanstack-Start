import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorDashboardSkeleton } from "@/screens/doctor/doctor-dashboard-skeleton";
import { useGetDoctorDashboard } from "@/services/dashboard/use-get-doctor-dashboard";
import { createFileRoute } from "@tanstack/react-router";
import { motion, Variant } from "framer-motion";
import {
  Activity,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  MessageSquare,
  Pill,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_layout/(doctors)/doctor/dashboard")({
  component: DoctorDashboard,
});

// Configuration constants
const ITEMS_PER_PAGE = {
  appointments: 3,
  notifications: 2,
  resources: 2,
};

// Icon mapping for resources
const getResourceIcon = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    FileText,
    Pill,
    Activity,
    User,
    Calendar,
    Clock,
    MessageSquare,
  };
  return iconMap[iconName] || FileText;
};

// Generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "waiting":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

function DoctorDashboard() {
  const { data, isLoading, error } = useGetDoctorDashboard();
  const [currentPage, setCurrentPage] = useState(0);
  const [notificationPage, setNotificationPage] = useState(0);
  const [resourcePage, setResourcePage] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    } as Variant,
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    } as Variant,
  };

  if (isLoading) {
    return <DoctorDashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 md:p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard data</p>
          <p className="text-gray-600 mt-2">
            {error?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  // Create stats array from API data
  const doctorStats = [
    {
      title: "Today's Appointments",
      value: data.stats.todaysAppointments,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Waiting Patients",
      value: data.stats.waitingPatients,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Unread Messages",
      value: data.stats.unreadMessages,
      icon: MessageSquare,
      gradient: "from-purple-500 to-fuchsia-600",
    },
    {
      title: "Pending Prescriptions",
      value: data.stats.pendingPrescriptions,
      icon: Pill,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  // Filter active patients (those with recent visits or follow-ups needed)
  const activePatients = data.patients.filter((patient) => {
    const lastVisitDate = new Date(patient.lastVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastVisitDate >= thirtyDaysAgo;
  });

  // Filter follow-up patients (this would depend on your business logic)
  const followUpPatients = data.patients.filter((patient) => {
    // Example: patients whose last visit was more than 60 days ago might need follow-up
    const lastVisitDate = new Date(patient.lastVisit);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    return lastVisitDate <= sixtyDaysAgo;
  });

  // Pagination calculations
  const appointmentsPerPage = ITEMS_PER_PAGE.appointments;
  const totalAppointmentPages = Math.ceil(
    data.appointments.length / appointmentsPerPage
  );

  const notificationsPerPage = ITEMS_PER_PAGE.notifications;
  const totalNotificationPages = Math.ceil(
    data.notifications.length / notificationsPerPage
  );

  const resourcesPerPage = ITEMS_PER_PAGE.resources;
  const totalResourcePages = Math.ceil(
    data.resources.length / resourcesPerPage
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Doctor Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome Dr. {data.doctor.name}! Here's your schedule overview
            </p>
            <p className="text-sm text-gray-500">
              Specialization: {data.doctor.specialization}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {data.notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {data.notifications.filter((n) => !n.read).length}
                </span>
              )}
            </Button>
            <Button>
              <ClipboardList className="mr-2 h-4 w-4" />
              Patient Records
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards Carousel */}
        <motion.div variants={itemVariants} className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar md:hidden">
            {doctorStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} className="min-w-[300px]" />
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctorStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Schedule</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.appointments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No appointments scheduled for today
                      </p>
                    ) : (
                      <>
                        {/* Paginated Appointments */}
                        {data.appointments
                          .slice(
                            currentPage * appointmentsPerPage,
                            (currentPage + 1) * appointmentsPerPage
                          )
                          .map((appointment) => (
                            <motion.div
                              key={appointment.id}
                              whileHover={{ y: -5 }}
                              className="border rounded-lg p-4 grid grid-cols-5 items-center hover:shadow-md transition-shadow"
                            >
                              <div className="col-span-1 font-medium">
                                {appointment.time}
                              </div>
                              <div className="col-span-3">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarFallback className="bg-blue-100 text-blue-800">
                                      {getInitials(appointment.patient)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {appointment.patient}
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                      <span>{appointment.duration}</span>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          appointment.mode === "virtual"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {appointment.mode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-1 text-right">
                                <div
                                  className={`inline-flex px-3 py-1 rounded-full text-xs ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  {appointment.status}
                                </div>
                              </div>
                            </motion.div>
                          ))}

                        {/* Pagination Controls */}
                        {totalAppointmentPages > 1 && (
                          <div className="flex justify-center items-center mt-6 space-x-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 0))
                              }
                              disabled={currentPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex space-x-1">
                              {Array.from({
                                length: totalAppointmentPages,
                              }).map((_, index) => (
                                <Button
                                  key={index}
                                  variant={
                                    currentPage === index
                                      ? "default"
                                      : "outline"
                                  }
                                  size="icon"
                                  onClick={() => setCurrentPage(index)}
                                >
                                  {index + 1}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalAppointmentPages - 1)
                                )
                              }
                              disabled={
                                currentPage === totalAppointmentPages - 1
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Patients */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patient Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="grid grid-cols-3 w-[300px] mb-4">
                      <TabsTrigger value="all">
                        All ({data.patients.length})
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        Active ({activePatients.length})
                      </TabsTrigger>
                      <TabsTrigger value="followup">
                        Follow-up ({followUpPatients.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <div className="space-y-4">
                        {data.patients.map((patient) => (
                          <motion.div
                            key={patient.id}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-4 grid grid-cols-4 hover:shadow-md transition-shadow"
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(patient.lastVisit).toLocaleDateString()}
                            </div>
                            <div className="text-sm">{patient.condition}</div>
                            <div className="text-right">
                              <div className="inline-flex px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                Active
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="active">
                      <div className="space-y-4">
                        {activePatients.map((patient) => (
                          <motion.div
                            key={patient.id}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-4 grid grid-cols-4 hover:shadow-md transition-shadow"
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(patient.lastVisit).toLocaleDateString()}
                            </div>
                            <div className="text-sm">{patient.condition}</div>
                            <div className="text-right">
                              <div className="inline-flex px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Active
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="followup">
                      <div className="space-y-4">
                        {followUpPatients.map((patient) => (
                          <motion.div
                            key={patient.id}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-4 grid grid-cols-4 hover:shadow-md transition-shadow"
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(patient.lastVisit).toLocaleDateString()}
                            </div>
                            <div className="text-sm">{patient.condition}</div>
                            <div className="text-right">
                              <div className="inline-flex px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                                Follow-up
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Notifications
                    <Button variant="ghost" size="sm">
                      Mark all as read
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.notifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No notifications
                      </p>
                    ) : (
                      <>
                        {/* Paginated Notifications */}
                        {data.notifications
                          .slice(
                            notificationPage * notificationsPerPage,
                            (notificationPage + 1) * notificationsPerPage
                          )
                          .map((notification) => (
                            <motion.div
                              key={notification.id}
                              whileHover={{ x: 5 }}
                              className={`p-3 rounded-lg border-l-4 ${
                                notification.read
                                  ? "border-gray-300 bg-gray-50"
                                  : "border-blue-500 bg-blue-50"
                              }`}
                            >
                              <div className="font-medium">
                                {notification.title}
                              </div>
                              <p className="text-sm text-gray-600">
                                {notification.description}
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </div>
                            </motion.div>
                          ))}

                        {/* Pagination Controls */}
                        {totalNotificationPages > 1 && (
                          <div className="flex justify-center items-center mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setNotificationPage((prev) =>
                                  Math.max(prev - 1, 0)
                                )
                              }
                              disabled={notificationPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-sm text-gray-600 mx-2">
                              Page {notificationPage + 1} of{" "}
                              {totalNotificationPages}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setNotificationPage((prev) =>
                                  Math.min(prev + 1, totalNotificationPages - 1)
                                )
                              }
                              disabled={
                                notificationPage === totalNotificationPages - 1
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Medical Resources */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Medical Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.resources.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No resources available
                      </p>
                    ) : (
                      <>
                        {/* Paginated Resources */}
                        {data.resources
                          .slice(
                            resourcePage * resourcesPerPage,
                            (resourcePage + 1) * resourcesPerPage
                          )
                          .map((resource) => {
                            const Icon = getResourceIcon(resource.icon);
                            return (
                              <motion.div
                                key={resource.id}
                                whileHover={{ scale: 1.03 }}
                                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-start"
                                onClick={() =>
                                  window.open(resource.url, "_blank")
                                }
                              >
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <Icon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {resource.title}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {resource.category}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}

                        {/* Pagination Controls */}
                        {totalResourcePages > 1 && (
                          <div className="flex justify-center items-center mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setResourcePage((prev) => Math.max(prev - 1, 0))
                              }
                              disabled={resourcePage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-sm text-gray-600 mx-2">
                              Page {resourcePage + 1} of {totalResourcePages}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setResourcePage((prev) =>
                                  Math.min(prev + 1, totalResourcePages - 1)
                                )
                              }
                              disabled={resourcePage === totalResourcePages - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex-col h-24">
                      <Video className="h-6 w-6 mb-2" />
                      <span>Start Telemedicine</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      <span>Message Patient</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Write Prescription</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <User className="h-6 w-6 mb-2" />
                      <span>Add Patient</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  className = "",
}: {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  gradient: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-white ${className}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-white/90">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
