import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, Variant } from "framer-motion";
import {
  Calendar,
  Pill,
  Stethoscope,
  Video,
  MessageSquare,
  Bell,
  ShoppingCart,
  CreditCard,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGetPatientDashboard } from "@/services/dashboard/use-get-patient-dashboard";
import { PatientDashboardSkeleton } from "@/screens/patient/dashboard-skeleton";

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

const quickLinks = [
  {
    to: "/patient/rooms",
    icon: Video,
    label: "Start Telemedicine",
  },
  {
    to: "/patient/chat",
    icon: MessageSquare,
    label: "Message Doctor",
  },
  {
    to: "/patient/orders",
    icon: ShoppingCart,
    label: "Order Medicine",
  },
  {
    to: "/patient/transactions",
    icon: CreditCard,
    label: "Pay Bills",
  },
];

export const Route = createFileRoute("/_layout/(patients)/patient/dashboard")({
  component: PatientDashboard,
});

function PatientDashboard() {
  const { currentIndex, next, prev, setIndex } = useCarousel(3);
  const { data, isLoading, error } = useGetPatientDashboard();

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
    return <PatientDashboardSkeleton />;
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Map API stats to display format
  const patientStats = [
    {
      title: "Upcoming Appointments",
      value: data.stats.upcomingAppointments,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Pending Prescriptions",
      value: data.stats.pendingPrescriptions,
      icon: Pill,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Unread Notifications",
      value: data.stats.unreadNotifications,
      icon: MessageSquare,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Virtual Appointments",
      value: data.stats.virtualAppointments,
      icon: Video,
      gradient: "from-purple-500 to-fuchsia-600",
    },
  ];

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time helper
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
          className="flex max-md:flex-col justify-between items-center"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Patient Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your healthcare overview
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {data.stats.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {data.stats.unreadNotifications}
                </span>
              )}
            </Button>
            <Button>
              <Stethoscope className="mr-2 h-4 w-4" />
              Find a Doctor
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards Carousel */}
        <motion.div variants={itemVariants} className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar md:hidden">
            {patientStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} className="min-w-[300px]" />
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {patientStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointments */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upcoming Appointments</span>
                    <Button variant="ghost" size="sm">
                      View Calendar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.appointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No upcoming appointments</p>
                      </div>
                    ) : (
                      data.appointments.map((appointment) => (
                        <motion.div
                          key={appointment.id}
                          whileHover={{ y: -5 }}
                          className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                        >
                          <div>
                            <div className="font-medium">
                              {appointment.doctor.fullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {appointment.doctor.specialty}
                            </div>
                            <div className="flex items-center mt-2 text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                              <span>
                                {formatDate(appointment.datetime as unknown as string)} at{" "}
                                {formatTime(appointment.startTime  as unknown as string)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`px-3 py-1 rounded-full text-xs ${
                                appointment.mode === "virtual"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {appointment.mode === "virtual"
                                ? "Virtual"
                                : "In-person"}
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs ${
                                appointment.status === "scheduled"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status ===
                                    AppointmentStatus.CANCELLED
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {appointment.status}
                            </div>
                            <Button size="sm">Details</Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prescriptions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>My Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.prescriptions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No prescriptions found</p>
                      </div>
                    ) : (
                      data.prescriptions.map((prescription) => (
                        <motion.div
                          key={prescription.id}
                          whileHover={{ scale: 1.02 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium">
                                Prescription #{prescription.id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Issued: {formatDate(prescription.issueDate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Expires: {formatDate(prescription.expiryDate)}
                              </div>
                            </div>
                            <div
                              className={`inline-flex px-3 py-1 rounded-full text-xs ${
                                prescription.isFulfilled
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {prescription.isFulfilled
                                ? "Fulfilled"
                                : "Pending"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {prescription.items.map((item, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded"
                              >
                                <div className="font-medium">
                                  Medicine ID: {item.medicineId}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Dosage: {item.dosage} | Frequency:{" "}
                                  {item.frequency}
                                </div>
                                {item.note && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    Note: {item.note}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
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
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      data.notifications?.splice(0, 5)?.map((notification) => (
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
                            {notification.eventType}
                          </div>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Medicine Search */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Find Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search medicines..."
                      className="pl-10"
                    />
                  </div>
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    {data.medicines.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No medicines available</p>
                      </div>
                    ) : (
                      data.medicines.map((medicine) => (
                        <div
                          key={medicine.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="font-medium">{medicine.name}</div>
                          <div className="text-sm text-gray-600 mb-1">
                            {medicine.genericName}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {medicine.type || "General"} •{" "}
                              {medicine.manufacturer}
                            </span>
                            <span className="font-medium text-green-600">
                              Kes {medicine.price}
                            </span>
                          </div>
                        </div>
                      ))
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
                    {quickLinks.map(({ to, icon: Icon, label }) => (
                      <Button
                        key={to}
                        variant="outline"
                        className="flex-col h-24"
                      >
                        <Link
                          to={to}
                          className="w-full h-full flex flex-col items-center justify-center"
                        >
                          <Icon className="h-6 w-6 mb-2" />
                          <span>{label}</span>
                        </Link>
                      </Button>
                    ))}
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

// Carousel Hook
function useCarousel(totalItems: number) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const setIndex = (index: number) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  };

  return { currentIndex, next, prev, setIndex };
}
