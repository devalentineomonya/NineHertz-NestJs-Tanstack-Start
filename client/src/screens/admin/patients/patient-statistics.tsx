import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface PatientStatsCardsProps {
  patients: PatientResponseDto[];
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
  delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className="h-full"
  >
    <Card className={`h-full bg-gradient-to-br ${gradient} text-white border-0 shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">
          {title}
        </CardTitle>
        <div className="bg-white/20 p-2 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-white/80 mt-1">{subtitle}</p>
        )}
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

export function PatientStatsCards({
  patients,
  isLoading = false,
}: PatientStatsCardsProps) {
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
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  // Calculate statistics
  const totalPatients = patients.length;
  const verifiedPatients = patients.filter(
    (patient) => patient.user.isEmailVerified
  ).length;
  const unverifiedPatients = totalPatients - verifiedPatients;

  // Calculate recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRegistrations = patients.filter(
    (patient) => new Date(patient.createdAt || new Date()) >= thirtyDaysAgo
  ).length;

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients.toLocaleString(),
      subtitle: "Registered in system",
      icon: <Users className="h-4 w-4 text-blue-100" />,
      trend: recentRegistrations > 0 ? {
        value: Math.round((recentRegistrations / totalPatients) * 100),
        isPositive: true,
      } : undefined,
      gradient: "from-blue-500 to-indigo-600",
      delay: 0.1
    },
    {
      title: "Verified Patients",
      value: verifiedPatients.toLocaleString(),
      subtitle: `${
        totalPatients > 0
          ? Math.round((verifiedPatients / totalPatients) * 100)
          : 0
      }% of total`,
      icon: <UserCheck className="h-4 w-4 text-green-100" />,
      gradient: "from-green-500 to-emerald-600",
      delay: 0.2
    },
    {
      title: "Pending Verification",
      value: unverifiedPatients.toLocaleString(),
      subtitle: "Email not verified",
      icon: <UserX className="h-4 w-4 text-amber-100" />,
      gradient: "from-amber-500 to-orange-500",
      delay: 0.3
    },
    {
      title: "Recent Registrations",
      value: recentRegistrations.toLocaleString(),
      subtitle: "Last 30 days",
      icon: <Activity className="h-4 w-4 text-purple-100" />,
      gradient: "from-purple-500 to-fuchsia-600",
      delay: 0.4
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
