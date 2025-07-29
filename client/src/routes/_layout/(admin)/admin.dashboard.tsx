import React, { useState } from "react";
import { motion, Variant } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Clock,
  Video,
  Monitor,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Heart,
  Brain,
  Eye,
  Bone,
  UserPlus,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Star,
  LucideProps,
} from "lucide-react";
import { useGetAdminDashboard } from "@/services/dashboard/use-get-admin-dashboard";
import { DashboardLoader } from "@/screens/admin/doctors/dashboard-loader";

// Animation variants
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
      damping: 12,
    },
  } as Variant,
};

export const Route = createFileRoute("/_layout/(admin)/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { data: dashboardData, isLoading, error } = useGetAdminDashboard();

  const iconMap: Record<
    string,
    React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >
  > = {
    Users: Users,
    Stethoscope: Stethoscope,
    CalendarCheck: CalendarCheck,
    Clock: Clock,
  };

  const departmentIcons: Record<
    string,
    React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >
  > = {
    Cardiologist: Heart,
    Radiology: Activity,
    Neurology: Brain,
    Orthopedics: Bone,
    Pediatrics: Users,
  };

  const activityIcons: Record<string, typeof CalendarCheck> = {
    appointment: CalendarCheck,
    patient: UserPlus,
    doctor: Stethoscope,
  };

  const getStatusColor = (status: "scheduled" | "completed" | "cancelled") => {
    const colors = {
      scheduled: "bg-amber-100 text-amber-800 border-amber-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getModeIcon = (mode: "virtual" | "physical") => {
    return mode === "virtual" ? Video : Monitor;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Loading state
  if (isLoading) {
    return <DashboardLoader />;
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Healthcare Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {dashboardData.stats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            const gradients = [
              "from-blue-500 to-blue-600",
              "from-emerald-500 to-emerald-600",
              "from-amber-500 to-orange-500",
              "from-purple-500 to-purple-600",
            ];

            return (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`relative overflow-hidden bg-gradient-to-br ${gradients[index]} rounded-xl p-6 text-white cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      {stat.change === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-300" />
                      ) : stat.change === "down" ? (
                        <ArrowDownRight className="h-4 w-4 text-red-300" />
                      ) : null}
                      <span className="text-xs text-white/80">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      scale: hoveredCard === index ? 1.1 : 1,
                      rotate: hoveredCard === index ? 5 : 0,
                    }}
                    className="bg-white/20 p-3 rounded-full backdrop-blur-sm"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Department Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Satisfaction Chart */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Patient Satisfaction
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monthly satisfaction trends
                  </p>
                </div>
                <div className="flex space-x-2">
                  {["week", "month", "year"].map((timeframe) => (
                    <motion.button
                      key={timeframe}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedTimeframe === timeframe
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end h-48 gap-2">
                  {dashboardData.patientSatisfaction.map((data, index) => {
                    const height = (parseFloat(data.score) / 5) * 80 + 10;
                    return (
                      <motion.div
                        key={data.month}
                        className="flex flex-col items-center flex-1 h-full group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          className="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {data.score}
                        </motion.div>
                        <motion.div
                          className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg"
                          style={{ height: `${height}%`, minHeight: "10px" }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            delay: index * 0.1,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          whileHover={{
                            background:
                              "linear-gradient(to top, #10b981, #34d399)",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {data.month}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Department Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Department Performance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Patient distribution by specialty
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </motion.button>
              </div>
              <div className="space-y-4">
                {dashboardData.departments.departments.map((dept, index) => {
                  const Icon = departmentIcons[dept.specialty] || Activity;
                  const colors = [
                    "from-emerald-400 to-emerald-500",
                    "from-blue-400 to-blue-500",
                    "from-purple-400 to-purple-500",
                    "from-amber-400 to-amber-500",
                    "from-pink-400 to-pink-500",
                  ];
                  const progress = parseInt(dept.count);

                  return (
                    <motion.div
                      key={dept.specialty}
                      className="group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${
                              colors[index % colors.length]
                            } text-white`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {dept.specialty}
                            </p>
                            <p className="text-sm text-gray-600">
                              {dept.count || 0} patients
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {progress}%
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            {`+${Math.floor(Math.random() * 11) + 5}%`}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${
                              colors[index % colors.length]
                            } rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{
                              delay: index * 0.1 + 0.2,
                              duration: 0.8,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Activity Feed and Quick Actions */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </motion.button>
              </div>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity, index) => {
                  const Icon = activityIcons[activity?.type ?? ""] || Activity;
                  return (
                    <motion.div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.createdAt}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Doctors */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Doctors
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </motion.button>
              </div>
              <div className="space-y-2">
                {dashboardData.topDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.doctor_id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {doctor.doctor_fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {doctor.doctor_specialty}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {doctor.rating && (
                          <>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">
                                {doctor.rating}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                          </>
                        )}
                        <span className="text-xs text-gray-600">
                          {doctor.patients} patients
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Appointments Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Appointments
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and track patient appointments
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">New Appointment</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.appointments.map((appointment, index) => {
                  const { date, time } = formatDate(
                    appointment.datetime as unknown as string
                  );
                  const ModeIcon = getModeIcon(appointment.mode);
                  return (
                    <motion.tr
                      key={appointment.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.doctor.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.doctor.specialty}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-sm text-gray-500">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {appointment.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize gap-1">
                          <ModeIcon className="h-3 w-3" />
                          {appointment.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize gap-1 ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status === "scheduled" ? (
                            <Clock className="h-3 w-3" />
                          ) : appointment.status === "completed" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          >
                            <Phone className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom Section - Upcoming Appointments and Footer Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Appointments
                </h3>
                <p className="text-sm text-gray-600">
                  Next scheduled appointments
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Schedule
              </motion.button>
            </div>
            <div className="space-y-4">
              {dashboardData.upcomingAppointments.map((appointment, index) => {
                const { date, time } = formatDate(
                  appointment.datetime as unknown as string
                );
                return (
                  <motion.div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {appointment.patient.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {time}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.type.replace("_", " ")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Stats */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Key Metrics
                </h3>
                <p className="text-sm text-gray-600">Performance indicators</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {dashboardData.footerStats.map((stat, index) => {
                const colors = [
                  "text-green-600",
                  "text-blue-600",
                  "text-orange-600",
                  "text-purple-600",
                ];
                return (
                  <motion.div
                    key={stat.label}
                    className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    <p
                      className={`text-xs font-medium mt-1 ${
                        colors[index % colors.length]
                      }`}
                    >
                      {stat.change}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
