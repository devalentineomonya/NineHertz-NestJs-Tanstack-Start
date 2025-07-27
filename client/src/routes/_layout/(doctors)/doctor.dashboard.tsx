import { createFileRoute } from "@tanstack/react-router";
import { motion, Variant } from "framer-motion";
import {
  Calendar,
  Clock,
  Stethoscope,
  User,
  Pill,
  MessageSquare,
  Video,
  Bell,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useCarousel } from "@/hooks/use-carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export const Route = createFileRoute("/_layout/(doctors)/doctor/dashboard")({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const { currentIndex, next, prev, setIndex } = useCarousel(4);
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

  // Mock data for doctor dashboard
  const doctorStats = [
    {
      title: "Today's Appointments",
      value: 8,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Waiting Patients",
      value: 3,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Unread Messages",
      value: 5,
      icon: MessageSquare,
      gradient: "from-purple-500 to-fuchsia-600",
    },
    {
      title: "Pending Prescriptions",
      value: 2,
      icon: Pill,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const appointments = [
    {
      id: 1,
      time: "09:30 AM",
      patient: "John Smith",
      status: "Checked In",
      duration: "30 min",
      avatar: "JS",
    },
    {
      id: 2,
      time: "10:15 AM",
      patient: "Emily Johnson",
      status: "Waiting",
      duration: "15 min",
      avatar: "EJ",
    },
    {
      id: 3,
      time: "11:00 AM",
      patient: "Michael Brown",
      status: "Confirmed",
      duration: "45 min",
      avatar: "MB",
    },
    {
      id: 4,
      time: "02:30 PM",
      patient: "Sarah Davis",
      status: "Confirmed",
      duration: "30 min",
      avatar: "SD",
    },
  ];

  const patients = [
    {
      id: 1,
      name: "John Smith",
      lastVisit: "2023-10-10",
      condition: "Hypertension",
      status: "Stable",
    },
    {
      id: 2,
      name: "Emily Johnson",
      lastVisit: "2023-10-12",
      condition: "Diabetes",
      status: "Improving",
    },
    {
      id: 3,
      name: "Michael Brown",
      lastVisit: "2023-10-15",
      condition: "Migraine",
      status: "Needs Follow-up",
    },
  ];

  const resources = [
    {
      id: 1,
      title: "Clinical Guidelines",
      category: "Cardiology",
      icon: FileText,
    },
    { id: 2, title: "Drug Interactions", category: "Pharmacology", icon: Pill },
    { id: 3, title: "Research Update", category: "Neurology", icon: Activity },
  ];

  const notifications = [
    {
      id: 1,
      title: "New Appointment",
      description: "Sarah Davis booked an appointment for tomorrow",
      time: "30 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Lab Results",
      description: "Lab results for John Smith are ready",
      time: "2 hours ago",
      read: true,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-6 bg-gray-50"
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
              Welcome Dr. Wilson! Here's your schedule overview
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                5
              </span>
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
                    {appointments.map((app) => (
                      <motion.div
                        key={app.id}
                        whileHover={{ y: -5 }}
                        className="border rounded-lg p-4 grid grid-cols-5 items-center hover:shadow-md transition-shadow"
                      >
                        <div className="col-span-1 font-medium">{app.time}</div>
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback className="bg-blue-100 text-blue-800">
                                {app.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{app.patient}</div>
                              <div className="text-sm text-gray-600">
                                {app.duration}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-1 text-right">
                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-xs ${
                              app.status === "Checked In"
                                ? "bg-green-100 text-green-800"
                                : app.status === "Waiting"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {app.status}
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="followup">Follow-up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                      <div className="space-y-4">
                        {patients.map((patient) => (
                          <motion.div
                            key={patient.id}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-4 grid grid-cols-4 hover:shadow-md transition-shadow"
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-600">
                              {patient.lastVisit}
                            </div>
                            <div className="text-sm">{patient.condition}</div>
                            <div className="text-right">
                              <div
                                className={`inline-flex px-3 py-1 rounded-full text-xs ${
                                  patient.status === "Stable"
                                    ? "bg-green-100 text-green-800"
                                    : patient.status === "Improving"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {patient.status}
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
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        whileHover={{ x: 5 }}
                        className={`p-3 rounded-lg border-l-4 ${
                          notif.read
                            ? "border-gray-300 bg-gray-50"
                            : "border-blue-500 bg-blue-50"
                        }`}
                      >
                        <div className="font-medium">{notif.title}</div>
                        <p className="text-sm text-gray-600">
                          {notif.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {notif.time}
                        </div>
                      </motion.div>
                    ))}
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
                    {resources.map((resource) => {
                      const Icon = resource.icon;
                      return (
                        <motion.div
                          key={resource.id}
                          whileHover={{ scale: 1.03 }}
                          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-start"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-sm text-gray-600">
                              {resource.category}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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
