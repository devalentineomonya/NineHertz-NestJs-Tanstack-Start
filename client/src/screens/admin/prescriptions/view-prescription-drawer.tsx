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
import { useAddOrderStore } from "@/stores/use-add-order-store";
import { useViewPrescriptionStore } from "@/stores/use-view-prescription-store";
import { format, differenceInDays, parseISO } from "date-fns";
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
  const { onOpen: onAddOrderOpen } = useAddOrderStore();

  if (!selectedPrescription) return null;

  // Improved date handling with parseISO
  const issueDate = parseISO(selectedPrescription.issueDate);
  const expiryDate = parseISO(selectedPrescription.expiryDate);
  const isExpired = differenceInDays(new Date(), expiryDate) > 0;
  const daysRemaining = Math.max(0, differenceInDays(expiryDate, new Date()));

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-0 top-0 bottom-0 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50 w-full sm:w-[36rem]">
        <DrawerHeader className="flex-row justify-between items-center border-b px-6 py-4">
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
            className="text-sm py-1 px-3"
          >
            {selectedPrescription.isFulfilled ? "Fulfilled" : "Pending"}
          </Badge>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto space-y-4">
          <div className="space-y-6">
            {/* Prescription Summary Card - Updated with status indicator */}
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
                      {selectedPrescription.items.map((item, index) => (
                        <span key={index}>
                          {item.medicineId || "Unknown Item"}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Issued</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(issueDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p
                      className={`font-medium flex items-center gap-1 ${
                        isExpired ? "text-destructive" : "text-amber-600"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      {format(expiryDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium flex items-center gap-2">
                        {selectedPrescription.isFulfilled ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Fulfilled
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-amber-500" />
                            Pending
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Validity</p>
                      <p
                        className={`font-medium ${
                          isExpired ? "text-destructive" : "text-green-600"
                        }`}
                      >
                        {isExpired
                          ? "Expired"
                          : `${daysRemaining} day${
                              daysRemaining !== 1 ? "s" : ""
                            } remaining`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information Card - Added responsive layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Avatar className="h-16 w-16 rounded-md mb-4 sm:mb-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
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
                            selectedPrescription.patient.dateOfBirth,
                            "MMM d, yyyy"
                          )
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{"Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescribing Doctor Card - Added email and clinic info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Stethoscope className="h-5 w-5" />
                  Prescribing Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Avatar className="h-16 w-16 rounded-md mb-4 sm:mb-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
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
                    <p className="font-medium">{"Not provided"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Clinic</p>
                    <p className="font-medium">{"Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medication Details Card - Added dosage information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <ClipboardList className="h-5 w-5" />
                  Medication Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPrescription.items.map((item) => (
                    <>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Medication Name
                          </p>
                          <p className="font-medium">{item.medicineId}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            Dosage
                          </p>
                          <p className="font-medium">
                            {item.dosage || "Not specified"}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            Frequency
                          </p>
                          <p className="font-medium">
                            {item.frequency || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {item.note && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            Special Instructions
                          </p>
                          <p className="font-medium whitespace-pre-line">
                            {item.note}
                          </p>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fulfillment History Card - Added pharmacy details */}
            {selectedPrescription.isFulfilled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Fulfillment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fulfillment Date
                      </p>
                      <p className="font-medium">
                        {selectedPrescription.fulfillmentDate
                          ? format(
                              parseISO(selectedPrescription.fulfillmentDate),
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
                        {selectedPrescription.pharmacistId || "Not recorded"}
                      </p>
                    </div>
                    {/* {selectedPrescription.pharmacy?.address && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground">
                          Pharmacy Address
                        </p>
                        <p className="font-medium">
                          {selectedPrescription.pharmacy.address}
                        </p>
                      </div>
                    )} */}
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
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {format(
                      parseISO(selectedPrescription.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {format(
                      parseISO(selectedPrescription.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Last Updated By
                  </p>
                  <p className="font-medium">
                    {selectedPrescription.prescribedBy.fullName || "System"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <DrawerFooter className="pb-6">
          <Button onClick={() => onAddOrderOpen()} variant={"primary"}>
            Create Order
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
