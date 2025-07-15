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
import { useViewPrescriptionStore } from "@/stores/use-view-prescription-store";
import { format, differenceInDays } from "date-fns";
import {
  Pill,
  Calendar,
  User,
  Stethoscope,
  CheckCircle,
  ClipboardList,
  FileText,
  Clock,
  ChevronRight,
} from "lucide-react";

export const ViewPrescriptionDrawer = () => {
  const {
    isOpen,
    onClose,
    prescription: selectedPrescription,
    id: prescriptionId,
  } = useViewPrescriptionStore();

  if (!selectedPrescription) return null;

  const isExpired =
    differenceInDays(new Date(), new Date(selectedPrescription.expiryDate)) > 0;
  const daysRemaining = Math.max(
    0,
    differenceInDays(new Date(selectedPrescription.expiryDate), new Date())
  );

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DrawerTitle className="font-extrabold text-xl">
                Prescription Details
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                ID: {prescriptionId}
              </p>
            </div>
          </div>
          <Badge
            variant={selectedPrescription.isFulfilled ? "success" : "warning"}
          >
            {selectedPrescription.isFulfilled ? "Fulfilled" : "Pending"}
          </Badge>
        </DrawerHeader>

        <ScrollArea className="px-6 py-4 h-[calc(100dvh-172px)]">
          <div className="space-y-4">
            {/* Prescription Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-5 w-5" />
                  Prescription Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 rounded-full p-2 mt-0.5">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Medication</p>
                    <p className="font-medium">
                      {selectedPrescription.medicationDetails}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Issued</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(selectedPrescription.issueDate),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p
                      className={`font-medium flex items-center gap-1 ${
                        isExpired ? "text-destructive" : ""
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      {format(
                        new Date(selectedPrescription.expiryDate),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {selectedPrescription.isFulfilled
                          ? "Fulfilled"
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Validity</p>
                      <p
                        className={`font-medium ${
                          isExpired ? "text-destructive" : "text-success"
                        }`}
                      >
                        {isExpired
                          ? "Expired"
                          : `${daysRemaining} days remaining`}
                      </p>
                    </div>
                  </div>
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
                    src={`https://avatar.vercel.sh/${selectedPrescription.patient.id}`}
                  />
                  <AvatarFallback>
                    {selectedPrescription.patient.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedPrescription.patient.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient ID</p>
                    <p className="font-medium text-sm">
                      {selectedPrescription.patient.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">
                      {selectedPrescription.patient.dateOfBirth
                        ? format(
                            new Date(selectedPrescription.patient.dateOfBirth),
                            "MMM d, yyyy"
                          )
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">
                      {selectedPrescription.patient.gender || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescribing Doctor Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Stethoscope className="h-5 w-5" />
                  Prescribing Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedPrescription.prescribedBy.id}`}
                  />
                  <AvatarFallback>
                    {selectedPrescription.prescribedBy.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor Name</p>
                    <p className="font-medium">
                      {selectedPrescription.prescribedBy.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Specialty</p>
                    <p className="font-medium">
                      {selectedPrescription.prescribedBy.specialty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      License Number
                    </p>
                    <p className="font-medium">
                      {selectedPrescription.prescribedBy.licenseNumber ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">
                      {selectedPrescription.prescribedBy.phone ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medication Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <ClipboardList className="h-5 w-5" />
                  Medication Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Medication Name
                      </p>
                      <p className="font-medium">
                        {selectedPrescription.medicationDetails}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  {selectedPrescription.medicationDetails && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Additional Notes
                      </p>
                      <p className="font-medium whitespace-pre-line">
                        {selectedPrescription.medicationDetails}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fulfillment History Card */}
            {selectedPrescription.isFulfilled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Fulfillment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fulfillment Date
                      </p>
                      <p className="font-medium">
                        {selectedPrescription.updatedAt
                          ? format(
                              new Date(selectedPrescription.updatedAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )
                          : "Not recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fulfilled By
                      </p>
                      <p className="font-medium">
                        {selectedPrescription.pharmacyId || "Not recorded"}
                      </p>
                    </div>
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
                      new Date(selectedPrescription.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedPrescription.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DrawerFooter className="flex flex-row justify-end gap-3 border-t pt-4">
          <Button variant="outline">Print Prescription</Button>
          {!selectedPrescription.isFulfilled && (
            <Button>Mark as Fulfilled</Button>
          )}
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
