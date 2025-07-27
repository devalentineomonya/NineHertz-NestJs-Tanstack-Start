import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Link } from "@tanstack/react-router";
import useViewAppointmentStore from "@/stores/use-view-appointment-store";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  BadgeDollarSign,
  ClipboardList,
  Phone,
  Cake,
  AlertCircle,
  HeartPulse,
  Mail,
  Shield,
  Video,
  Monitor,
  StickyNote,
} from "lucide-react";

export const ViewAppointmentDrawer = () => {
  const { appointment, isOpen, onClose } = useViewAppointmentStore();
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.datetime);
  const patientDOB = new Date(appointment.patient.dateOfBirth);
  const age = new Date().getFullYear() - patientDOB.getFullYear();

  const isVirtual = appointment.mode === "virtual";
  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="rounded-md h-12 w-12">
              <AvatarImage
                src={`https://avatar.vercel.sh/${appointment.patient.fullName}?rounded=5`}
              />
              <AvatarFallback>
                {appointment.patient.fullName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle className="font-extrabold text-xl capitalize flex items-center gap-2">
                {appointment.patient.fullName}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                Appointment • {format(appointmentDate, "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <Badge
            variant={
              appointment.status === "scheduled"
                ? "default"
                : appointment.status === "cancelled"
                ? "destructive"
                : "success"
            }
            className="capitalize"
          >
            {appointment.status}
          </Badge>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-4 grid grid-cols-2 ">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 rounded-full p-2 mt-0.5">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(appointmentDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-50 rounded-full p-2 mt-0.5">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {format(appointmentDate, "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-teal-50 rounded-full p-2 mt-0.5">
                    {isVirtual ? (
                      <Video className="h-5 w-5 text-teal-600" />
                    ) : (
                      <Monitor className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium capitalize">{appointment.mode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-pink-50 rounded-full p-2 mt-0.5">
                    <ClipboardList className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{appointment.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-50 rounded-full p-2 mt-0.5">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">
                      Dr. {appointment.doctor.fullName}
                    </p>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {appointment.doctor.specialty}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-yellow-50 rounded-full p-2 mt-0.5">
                    <BadgeDollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee</p>
                    <p className="font-medium">
                      Kes {appointment.doctor.appointmentFee}
                    </p>
                  </div>
                </div>
              </div>
              {appointment.notes && (
                <div className="flex items-start gap-3 w-full mt-3">
                  <div className="bg-orange-50 rounded-full p-2 mt-0.5">
                    <StickyNote className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">
                      {appointment.notes}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 grid grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 rounded-full p-2 mt-0.5">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{appointment.patient.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-50 rounded-full p-2 mt-0.5">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{appointment.patient.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-50 rounded-full p-2 mt-0.5">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate max-w-1/2">
                    {appointment.patient.user?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-pink-50 rounded-full p-2 mt-0.5">
                  <Cake className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {format(patientDOB, "MMM d, yyyy")} ({age} years old)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <ClipboardList className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-50 rounded-full p-2 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  {appointment.patient.medicalHistory?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {appointment.patient.medicalHistory?.allergies?.map(
                        (allergy: string, index: number) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="capitalize"
                          >
                            {allergy}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No allergies recorded
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-50 rounded-full p-2 mt-0.5">
                  <HeartPulse className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Medical Conditions
                  </p>
                  {appointment.patient.medicalHistory?.conditions?.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {appointment.patient.medicalHistory?.conditions?.map(
                        (condition: string, index: number) => (
                          <Badge
                            key={index}
                            variant="warning"
                            className="capitalize"
                          >
                            {condition}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No conditions recorded
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-4 grid grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 rounded-full p-2 mt-0.5">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    Dr. {appointment.doctor.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-50 rounded-full p-2 mt-0.5">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialty</p>
                  <p className="font-medium">{appointment.doctor.specialty}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-50 rounded-full p-2 mt-0.5">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    License Number
                  </p>
                  <p className="font-medium">
                    {appointment.doctor.licenseNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-yellow-50 rounded-full p-2 mt-0.5">
                  <BadgeDollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Appointment Fee
                  </p>
                  <p className="font-medium">
                    Kes {appointment.doctor.appointmentFee}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {appointment.mode === "virtual" && (
          <DrawerFooter className="pb-6">
            <Button variant={"primary"}>
              <Link to="/">View Rooms</Link>
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
