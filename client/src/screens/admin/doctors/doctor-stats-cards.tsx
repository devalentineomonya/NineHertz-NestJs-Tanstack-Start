import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  User,
  Stethoscope,
  Clock,
  HandCoins,
  HeartPulse,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface DoctorStatsCardsProps {
  doctors: DoctorResponseDto[];
  isLoading?: boolean;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className="h-full"
  >
    <Card
      className={`h-full bg-gradient-to-br ${gradient} text-white border-0 shadow-lg overflow-hidden relative`}
    >
      <div className="absolute top-4 right-4 opacity-10">{icon}</div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white/90">
          {title}
        </CardTitle>
        <div className="bg-white/20 p-2 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-white/80 mt-1">{subtitle}</p>}
        {trend && (
          <div
            className={`text-xs mt-1 flex items-center ${
              trend.isPositive ? "text-green-200" : "text-red-200"
            }`}
          >
            <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export function DoctorStatsCards({
  doctors,
  isLoading = false,
}: DoctorStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 mt-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="animate-pulse bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-gray-300" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2 bg-gray-300" />
                <Skeleton className="h-3 w-32 bg-gray-300" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  // Calculate statistics
  const totalDoctors = doctors.length;

  const activeDoctors = doctors.filter(
    (doctor) => doctor.status === "active"
  ).length;

  const onLeaveDoctors = totalDoctors - activeDoctors;

  // Calculate average appointment fee
  const totalFees = doctors.reduce(
    (sum, doctor) => sum + doctor.appointmentFee,
    0
  );
  const averageFee = totalFees / totalDoctors;

  // Calculate doctors with appointments today
  const today = new Date().toISOString().split("T")[0];
  const doctorsWithAppointmentsToday = doctors.filter((doctor) =>
    doctor.availability.days.some(
      (day) =>
        day.toLowerCase() ===
        new Date()
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase()
    )
  ).length;

  const stats = [
    {
      title: "Total Doctors",
      value: totalDoctors,
      subtitle: "Registered in system",
      icon: <Stethoscope className="h-4 w-4" />,
      trend:
        totalDoctors > 0
          ? {
              value: Math.round(
                (doctorsWithAppointmentsToday / totalDoctors) * 100
              ),
              isPositive: true,
            }
          : undefined,
      gradient: "from-blue-500 to-indigo-600",
      delay: 0.1,
    },
    {
      title: "Active Doctors",
      value: activeDoctors,
      subtitle: `${Math.round((activeDoctors / totalDoctors) * 100)}% of total`,
      icon: <CheckCircle className="h-4 w-4" />,
      gradient: "from-green-500 to-emerald-600",
      delay: 0.2,
    },
    {
      title: "On Leave",
      value: onLeaveDoctors,
      subtitle: "Currently unavailable",
      icon: <Clock className="h-4 w-4" />,
      gradient: "from-amber-500 to-orange-500",
      delay: 0.3,
    },
    {
      title: "Avg. Fee",
      value: `$${averageFee.toFixed(0)}`,
      subtitle: "Per consultation",
      icon: <HandCoins className="h-4 w-4" />,
      gradient: "from-purple-500 to-fuchsia-600",
      delay: 0.4,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
