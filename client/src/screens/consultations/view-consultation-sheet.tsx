import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewConsultationStore } from "@/stores/use-view-consultation-store";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const ViewConsultationDrawer = () => {
  const {
    isOpen,
    onClose,
    consultation: selectedConsultation,
    id: consultationId,
  } = useViewConsultationStore();

  if (!selectedConsultation) return null;

  const statusVariant = {
    [AppointmentStatus.SCHEDULED]: "secondary",
    [AppointmentStatus.COMPLETED]: "success",
    [AppointmentStatus.CANCELLED]: "destructive",
  }[selectedConsultation.status] as
    | "secondary"
    | "success"
    | "destructive"
    | "default"
    | "outline"
    | "warning"
    | null
    | undefined;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div>
            <DrawerTitle className="font-extrabold text-xl flex items-center gap-2">
              Consultation Details
              <Badge variant={statusVariant} className="capitalize">
                {selectedConsultation.status.toLowerCase()}
              </Badge>
            </DrawerTitle>
            <p className="text-sm text-muted-foreground">
              ID: {consultationId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="font-medium">
              {format(new Date(selectedConsultation.startTime), "MMM d, yyyy")}
            </span>
          </div>
        </DrawerHeader>

        <ScrollArea className="px-6 py-4 h-[calc(100dvh-172px)]">
          <div className="space-y-4">
            {/* Consultation Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  Consultation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(selectedConsultation.startTime),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedConsultation.endTime
                      ? format(
                          new Date(selectedConsultation.endTime),
                          "MMM d, yyyy 'at' h:mm a"
                        )
                      : "Not ended"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedConsultation.duration} minutes
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Video Session</p>
                  {selectedConsultation.videoSessionId ? (
                    <Badge variant="outline" className="mt-1">
                      <Video className="h-4 w-4 mr-2" />
                      {selectedConsultation.videoSessionId}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No session
                    </span>
                  )}
                </div>
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
              <CardContent className="flex gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedConsultation.patient.id}`}
                  />
                  <AvatarFallback>
                    {selectedConsultation.patient.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedConsultation.patient.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient ID</p>
                    <p className="font-medium text-sm">
                      {selectedConsultation.patient.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">
                      {selectedConsultation.patient.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {selectedConsultation.patient.email}
                    </p>
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
              <CardContent className="flex gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedConsultation.doctor.id}`}
                  />
                  <AvatarFallback>
                    {selectedConsultation.doctor.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedConsultation.doctor.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor ID</p>
                    <p className="font-medium text-sm">
                      {selectedConsultation.doctor.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Specialty</p>
                    <p className="font-medium">
                      {selectedConsultation.doctor.specialty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        selectedConsultation.doctor.isActive
                          ? "success"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      <div className="flex items-center gap-1">
                        {selectedConsultation.doctor.isActive ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {selectedConsultation.doctor.isActive
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Card */}
            {selectedConsultation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <MessageSquare className="h-5 w-5" />
                    Consultation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-line">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedConsultation.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedConsultation.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DrawerFooter className="flex flex-row justify-end gap-3 border-t pt-4">
          <Button variant="outline">Reschedule</Button>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
