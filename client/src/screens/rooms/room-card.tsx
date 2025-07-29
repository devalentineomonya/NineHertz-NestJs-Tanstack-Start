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
import {
  Clock,
  LucideLaugh,
  Trash2,
  Video,
  User,
  Stethoscope,
} from "lucide-react";
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
      scale: 1.02,
      boxShadow: "0px 3px 10px rgba(5, 150, 105, 0.3)",
    },
    tap: { scale: 0.98 },
  };

  // Determine if appointment is completed
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isCanceled = appointment.status === AppointmentStatus.CANCELLED;
  const isScheduled = appointment.status === AppointmentStatus.SCHEDULED;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full max-w-4xl"
    >
      <Card className="relative overflow-hidden border-0 rounded-xl shadow-lg shadow-green-600/20">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-l from-green-400/20 to-transparent rounded-bl-full"></div>

        <div className="relative z-10">
          {/* Header Section */}
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
                    {appointment.doctor.specialty} Consultation
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  {format(appointmentTime, "MMM d, h:mm a")} •{" "}
                  {appointment.mode.charAt(0).toUpperCase() +
                    appointment.mode.slice(1)}{" "}
                  • 30 min
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
                className={`text-xs px-2 py-1 ${
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

          <CardContent className="py-3">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Doctor & Patient Info - Combined Section */}
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Doctor Info */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-green-100 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Avatar className="w-10 h-10 border-2 border-green-500">
                        <AvatarImage src="" alt={appointment.doctor.fullName} />
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm">
                          {appointment.doctor.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                          Dr. {appointment.doctor.fullName}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {appointment.doctor.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <p>
                        Fee:{" "}
                        <span className="font-medium text-gray-800 dark:text-white">
                          {fee.toLocaleString("en-US")} KES
                        </span>
                      </p>
                      <p>License: {appointment.doctor.licenseNumber}</p>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-emerald-100 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Avatar className="w-10 h-10 border-2 border-emerald-500">
                        <AvatarImage
                          src=""
                          alt={appointment.patient.fullName}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm">
                          {appointment.patient.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                          {appointment.patient.fullName}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Patient
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <p>Phone: {appointment.patient.phone}</p>
                      <p>
                        DOB:{" "}
                        {format(
                          new Date(appointment.patient.dateOfBirth),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Timer Section */}
              <div className="lg:col-span-1 h-full">
                <div
                  className={`p-4 rounded-lg shadow-sm text-white text-center h-full grid place-content-center ${
                    isCanceled
                      ? "bg-gradient-to-br from-rose-500 to-red-600"
                      : isCompleted
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gradient-to-br from-green-500 to-emerald-600"
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-semibold text-sm">
                      Session Status
                    </span>
                  </div>

                  <div className="text-xs">
                    {isCanceled ? (
                      <p className="font-medium bg-white/20 px-2 py-1 rounded-md">
                        Appointment Canceled
                      </p>
                    ) : isCompleted ? (
                      <p className="font-medium bg-white/20 px-2 py-1 rounded-md">
                        Consultation Completed
                      </p>
                    ) : timeRemaining ? (
                      <div>
                        <p className="mb-1">Joinable in:</p>
                        <p className="font-mono font-bold bg-white/20 px-2 py-1 rounded-md">
                          {timeRemaining}
                        </p>
                      </div>
                    ) : canJoin ? (
                      <p className="font-bold bg-white/20 px-2 py-1 rounded-md animate-pulse">
                        🟢 Join Now Available!
                      </p>
                    ) : (
                      <p className="font-medium bg-white/20 px-2 py-1 rounded-md">
                        Starts {formatDistanceToNow(appointmentTime)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="pt-3 pb-4">
            <div className="w-full">
              {/* Payment Status for Doctor/Admin */}
              {(isDoctor || isAdmin) &&
                isScheduled &&
                !hasSuccessfulPayment &&
                !isCanceled && (
                  <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center">
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                      <Clock className="inline mr-1 h-3 w-3" />
                      Waiting for patient payment
                    </p>
                  </div>
                )}

              {/* Confirmed Status for Doctor/Admin */}
              {(isDoctor || isAdmin) &&
                isScheduled &&
                isFutureAppointment &&
                !isCanceled &&
                hasSuccessfulPayment && (
                  <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                    <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                      <Clock className="inline mr-1 h-3 w-3" />
                      Appointment confirmed - waiting for session time
                    </p>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {/* Patient-specific buttons */}
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
                          className="col-span-2 sm:col-span-1"
                        >
                          <Button
                            onClick={() => onAppointmentPayment(appointment)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-sm text-xs"
                          >
                            Pay {fee.toLocaleString("en-US")} KES
                          </Button>
                        </motion.div>
                      )}

                    {/* Cancel Button */}
                    {hasSuccessfulPayment &&
                      isScheduled &&
                      isFutureAppointment && (
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            onClick={() => onCancelAppointment(appointment.id)}
                            size="sm"
                            variant="destructive"
                            className="w-full font-bold shadow-sm text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
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
                      >
                        <Button
                          onClick={() =>
                            onRescheduleAppointment(appointment.id)
                          }
                          size="sm"
                          variant="secondary"
                          className="w-full font-bold shadow-sm text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
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
                      >
                        <Button
                          onClick={() => onReviewAppointment(appointment.id)}
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-sm text-xs"
                        >
                          <LucideLaugh className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Join Button (visible to all roles) */}
                {appointment.mode !== "physical" &&
                  isScheduled &&
                  canJoin &&
                  !isCanceled && (
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="col-span-2 sm:col-span-1"
                    >
                      <Button
                        size="sm"
                        className="w-full font-bold shadow-sm bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white text-xs"
                      >
                        🎥 Join Session
                      </Button>
                    </motion.div>
                  )}

                {/* Recordings Button */}
                {isCompleted && (
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      Recordings
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
};

export default RoomCard;
