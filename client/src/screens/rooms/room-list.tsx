import React, { useEffect } from "react";
import { motion, Variant } from "framer-motion";
import RoomCard from "./room-card";
import { useGetAppointments } from "@/services/appointments/use-get-appointments";
import RoomCardSkeleton from "./room-card-skeleton";
import { useQueryState } from "nuqs";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

export const RoomsList = () => {
  const { data: appointments, isLoading, isError } = useGetAppointments();

  const [token] = useQueryState("token");
  const [error] = useQueryState("error");
  const [cancelled] = useQueryState("cancelled");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);

        if (decoded.success) {
          toast.success(`Payment successful! Reference: ${decoded.reference}`);
        } else if (decoded.cancelled) {
          toast.info("Payment was cancelled by the user.");
        } else {
          toast.error(decoded.error || "Payment verification failed.");
        }
      } catch (err) {
        toast.error("Invalid or expired token.");
      }
    } else if (error) {
      toast.error("Payment verification failed.");
    } else if (cancelled) {
      toast.info("Payment was cancelled by the user.");
    }
  }, [token, error, cancelled]);

  const virtualAppointments =
    appointments?.data?.filter(
      (appointment) => appointment.mode === "virtual"
    ) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    } as Variant,
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto px-4 py-12 text-center"
      >
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-100 dark:border-red-900/50">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Error Loading Appointments
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            We encountered an issue while fetching your virtual appointments.
            Please try again later.
          </p>
          <button
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  if (virtualAppointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-12 text-center"
      >
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-indigo-100 dark:border-gray-700">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            No Virtual Appointments Scheduled
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            You don't have any upcoming virtual consultations. Schedule an
            appointment to get started.
          </p>
          <div className="flex justify-center gap-3">
            <button className="bg-gradient-to-r from-green-500 to-lime-500 text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
              Schedule Appointment
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto px-4 py-8"
    >
      <div className="space-y-4">
        {virtualAppointments.map((appointment) => (
          <motion.div
            key={appointment.id}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <RoomCard appointment={appointment} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
