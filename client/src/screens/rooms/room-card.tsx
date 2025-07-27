import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { format, formatDistanceToNow, differenceInSeconds } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppointmentPaymentStore } from "@/stores/use-appointment-payment-store";
import { Clock, LucideLaugh, Trash2, Video } from "lucide-react";
import { useRescheduleAppointmentStore } from "@/stores/use-reschedule-appointment";
import { useCancelAppointmentStore } from "@/stores/use-cancel-appointment-store";
import { useReviewStore } from "@/stores/use-create-review";
import { useUserSessionStore } from "@/stores/user-session-store";

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

const RoomCard = ({ appointment }: { appointment: AppointmentResponseDto }) => {
  const [canJoin, setCanJoin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isFutureAppointment, setIsFutureAppointment] = useState(true);
  const appointmentTime = new Date(appointment.datetime);
  const fee =
    parseFloat(appointment.doctor.appointmentFee as unknown as string) || 0;
  const { open: onAppointmentPayment } = useAppointmentPaymentStore();
  const { onOpen: onRescheduleAppointment } = useRescheduleAppointmentStore();
  const { onOpen: onCancelAppointment } = useCancelAppointmentStore();
  const { onOpen: onReviewAppointment } = useReviewStore();
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  const isPatient = currentUser?.role === "patient";
  const isDoctor = currentUser?.role === "doctor";
  const isAdmin = currentUser?.role === "admin";

  const hasSuccessfulPayment = appointment.transactions.some(
    (transaction) => transaction.status === "success"
  );

  // Check time eligibility for joining
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const fiveMinutesBefore = new Date(appointmentTime.getTime() - 5 * 60000);
      const isFuture = now < appointmentTime;

      setIsFutureAppointment(isFuture);

      // Calculate time remaining using date-fns
      if (now < fiveMinutesBefore) {
        const secondsRemaining = differenceInSeconds(fiveMinutesBefore, now);

        const days = Math.floor(secondsRemaining / (60 * 60 * 24));
        const hours = Math.floor(
          (secondsRemaining % (60 * 60 * 24)) / (60 * 60)
        );
        const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
        const seconds = secondsRemaining % 60;
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining("");
      }

      setCanJoin(now >= fiveMinutesBefore && now < appointmentTime);
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [appointmentTime]);

  // Animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants: Variants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(5, 150, 105, 0.4)",
    },
    tap: { scale: 0.98 },
  };

  // Determine if appointment is completed
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isCanceled = appointment.status === AppointmentStatus.CANCELLED;
  const isScheduled = appointment.status === AppointmentStatus.SCHEDULED;

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="max-w-2xl w-full"
      >
        <Card className="relative overflow-hidden border-0 rounded-2xl shadow-xl shadow-green-600/25">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-600 rounded-bl-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-emerald-400 to-green-500 rounded-tr-full opacity-10"></div>

          <CardHeader className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  {appointment.doctor.specialty} Consultation
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                  {format(appointmentTime, "MMM d, h:mm a")} •{" "}
                  {appointment.mode.charAt(0).toUpperCase() +
                    appointment.mode.slice(1)}
                </CardDescription>
              </div>
              <Badge
                variant={
                  appointment.status === "scheduled"
                    ? "default"
                    : appointment.status === "completed"
                    ? "secondary"
                    : "destructive"
                }
                className={`text-sm px-3 py-1 ${
                  appointment.status === "scheduled"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : appointment.status === "completed"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-gradient-to-r from-rose-500 to-red-600 text-white"
                }`}
              >
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pb-4">
            <div className="space-y-6">
              {/* Doctor Info */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <Avatar className="w-12 h-12 border-2 border-green-500">
                    <AvatarImage src="" alt={appointment.doctor.fullName} />
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      {appointment.doctor.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      Dr. {appointment.doctor.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {appointment.doctor.specialty}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    Fee:{" "}
                    <span className="font-medium text-gray-800 dark:text-white">
                      {fee.toLocaleString("en-US")} KES
                    </span>
                  </p>
                  <p className="mt-1">
                    License: {appointment.doctor.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <Avatar className="w-12 h-12 border-2 border-emerald-500">
                    <AvatarImage src="" alt={appointment.patient.fullName} />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                      {appointment.patient.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {appointment.patient.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Patient
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Phone: {appointment.patient.phone}</p>
                  <p className="mt-1">
                    DOB:{" "}
                    {format(
                      new Date(appointment.patient.dateOfBirth),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div
                className={`p-4 rounded-xl shadow-lg ${
                  isCanceled
                    ? "bg-gradient-to-br from-rose-500 to-red-600"
                    : isCompleted
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-green-500 to-emerald-600"
                } text-white ${
                  isCanceled
                    ? "shadow-rose-500/25"
                    : isCompleted
                    ? "shadow-blue-500/25"
                    : "shadow-green-600/25"
                }`}
              >
                <h4 className="font-semibold mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Session Details
                </h4>
                <div className="text-sm">
                  <p>
                    Mode:{" "}
                    {appointment.mode.charAt(0).toUpperCase() +
                      appointment.mode.slice(1)}
                  </p>
                  <p className="mt-1">Duration: 30 minutes</p>

                  {isCanceled ? (
                    <p className="mt-2 font-medium bg-white/20 px-2 py-1 rounded-md inline-block">
                      Appointment Canceled
                    </p>
                  ) : isCompleted ? (
                    <p className="mt-2 font-medium bg-white/20 px-2 py-1 rounded-md inline-block">
                      Consultation Completed
                    </p>
                  ) : timeRemaining ? (
                    <p className="mt-2 font-medium bg-white/20 px-2 py-1 rounded-md inline-block">
                      Joinable in: {timeRemaining}
                    </p>
                  ) : canJoin ? (
                    <p className="mt-2 font-medium bg-white/20 px-2 py-1 rounded-md inline-block">
                      Join now available!
                    </p>
                  ) : (
                    <p className="mt-2 font-medium bg-white/20 px-2 py-1 rounded-md inline-block">
                      Session starts {formatDistanceToNow(appointmentTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative z-10 pt-0  grid grid-cols-2 gap-x-3">
            {/* PATIENT-SPECIFIC BUTTONS */}
            {isPatient && (
              <>
                {/* Payment Button */}
                {!hasSuccessfulPayment &&
                  fee > 0 &&
                  isFutureAppointment &&
                  !isCanceled && (
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full"
                    >
                      <Button
                        onClick={() => onAppointmentPayment(appointment)}
                        size="lg"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/25"
                      >
                        Pay KES {fee.toLocaleString("en-US")}
                      </Button>
                    </motion.div>
                  )}

                {/* Cancel Button */}
                {hasSuccessfulPayment && isScheduled && isFutureAppointment && (
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full"
                  >
                    <Button
                      onClick={() => onCancelAppointment(appointment.id)}
                      size="lg"
                      variant="destructive"
                      className="w-full font-bold shadow-lg shadow-red-500/25"
                    >
                      <Trash2 />
                      Cancel
                    </Button>
                  </motion.div>
                )}

                {/* Reschedule Button */}
                {isScheduled && isFutureAppointment && !isCanceled && (
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full"
                  >
                    <Button
                      onClick={() => onRescheduleAppointment(appointment.id)}
                      size="lg"
                      variant="secondary"
                      className="w-full font-bold shadow-lg shadow-gray-500/10 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Clock />
                      Reschedule
                    </Button>
                  </motion.div>
                )}

                {/* Review Button */}
                {isCompleted && (
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full"
                  >
                    <Button
                      onClick={() => onReviewAppointment(appointment.id)}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25"
                    >
                      <LucideLaugh />
                      Your Review
                    </Button>
                  </motion.div>
                )}
              </>
            )}

            {/* JOIN BUTTON (VISIBLE TO ALL ROLES) */}
            {appointment.mode !== "physical" &&
              isScheduled &&
              canJoin &&
              !isCanceled && (
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full"
                >
                  <Button
                    size="lg"
                    className="w-full font-bold shadow-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-green-600/25"
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Join Session
                    </div>
                  </Button>
                </motion.div>
              )}

            {/* DOCTOR/ADMIN VIEW FOR PAYMENT STATUS */}
            {(isDoctor || isAdmin) &&
              isScheduled &&
              !hasSuccessfulPayment &&
              !isCanceled && (
                <div className="w-full col-span-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center">
                  <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                    <Clock className="inline mr-2 h-4 w-4" />
                    Waiting for patient payment
                  </p>
                </div>
              )}

            {/* RECORDINGS BUTTON (VISIBLE TO ALL ROLES) */}
            {isCompleted && (
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <Video />
                  Recordings
                </Button>
              </motion.div>
            )}

            {/* DOCTOR/ADMIN VIEW FOR FUTURE APPOINTMENTS */}
            {(isDoctor || isAdmin) &&
              isScheduled &&
              isFutureAppointment &&
              !isCanceled &&
              hasSuccessfulPayment && (
                <div className="w-full col-span-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    <Clock className="inline mr-2 h-4 w-4" />
                    Appointment confirmed - waiting for session time
                  </p>
                </div>
              )}
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
};

export default RoomCard;
