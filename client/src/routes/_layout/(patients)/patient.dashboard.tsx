import { createFileRoute } from "@tanstack/react-router";
import { motion, Variant } from "framer-motion";
import {
  Calendar,
  Clock,
  Pill,
  Stethoscope,
  Video,
  MessageSquare,
  Bell,
  ShoppingCart,
  CreditCard,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
// import { useCarousel } from "@/hooks/use-carousel";

export const Route = createFileRoute("/_layout/(patients)/patient/dashboard")({
  component: PatientDashboard,
});

function PatientDashboard() {
  const { currentIndex, next, prev, setIndex } = useCarousel(3);
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

  // Mock data
  const patientStats = [
    {
      title: "Upcoming Appointments",
      value: 2,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Pending Prescriptions",
      value: 1,
      icon: Pill,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Unread Messages",
      value: 3,
      icon: MessageSquare,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Active Rooms",
      value: 1,
      icon: Video,
      gradient: "from-purple-500 to-fuchsia-600",
    },
  ];

  const appointments = [
    {
      id: 1,
      date: "2023-10-15",
      time: "10:30 AM",
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiology",
      mode: "Virtual",
    },
    {
      id: 2,
      date: "2023-10-20",
      time: "02:15 PM",
      doctor: "Dr. Michael Chen",
      specialty: "Dermatology",
      mode: "In-person",
    },
  ];

  const prescriptions = [
    {
      id: 1,
      medication: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      status: "Active",
      refills: 2,
    },
    {
      id: 2,
      medication: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      status: "Pending",
      refills: 0,
    },
  ];

  const medicines = [
    {
      id: 1,
      name: "Metformin",
      price: 12.99,
      stock: "In stock",
      category: "Diabetes",
    },
    {
      id: 2,
      name: "Amoxicillin",
      price: 8.5,
      stock: "In stock",
      category: "Antibiotic",
    },
    {
      id: 3,
      name: "Lisinopril",
      price: 15.75,
      stock: "Low stock",
      category: "Blood Pressure",
    },
    {
      id: 4,
      name: "Atorvastatin",
      price: 22.4,
      stock: "In stock",
      category: "Cholesterol",
    },
  ];

  const notifications = [
    {
      id: 1,
      title: "Appointment Reminder",
      description: "Your appointment with Dr. Wilson is tomorrow at 10:30 AM",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Prescription Ready",
      description: "Your prescription for Lisinopril is ready for pickup",
      time: "1 day ago",
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
              Patient Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your healthcare overview
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                3
              </span>
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
                    {appointments.map((app) => (
                      <motion.div
                        key={app.id}
                        whileHover={{ y: -5 }}
                        className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="font-medium">{app.doctor}</div>
                          <div className="text-sm text-gray-600">
                            {app.specialty}
                          </div>
                          <div className="flex items-center mt-2 text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span>
                              {app.date} at {app.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs ${
                              app.mode === "Virtual"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {app.mode}
                          </div>
                          <Button size="sm">Details</Button>
                        </div>
                      </motion.div>
                    ))}
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
                    {prescriptions.map((pres) => (
                      <motion.div
                        key={pres.id}
                        whileHover={{ scale: 1.02 }}
                        className="border rounded-lg p-4 grid grid-cols-3 hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="font-medium">{pres.medication}</div>
                          <div className="text-sm text-gray-600">
                            {pres.dosage}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm">{pres.frequency}</div>
                          <div className="text-xs text-gray-500">
                            Refills: {pres.refills}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-xs ${
                              pres.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pres.status}
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
                    {medicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="font-medium">{med.name}</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{med.category}</span>
                          <span
                            className={`font-medium ${
                              med.stock === "In stock"
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {med.stock} • ${med.price}
                          </span>
                        </div>
                      </div>
                    ))}
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
                      <span>Message Doctor</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <ShoppingCart className="h-6 w-6 mb-2" />
                      <span>Order Medicine</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <CreditCard className="h-6 w-6 mb-2" />
                      <span>Pay Bills</span>
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
