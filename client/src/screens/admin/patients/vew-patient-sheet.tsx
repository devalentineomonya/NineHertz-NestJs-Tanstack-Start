import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetPatient } from "@/services/patients/use-get-patient";
import { useAddAppointmentStore } from "@/stores/use-add-appointment-store";
import { useViewPatientStore } from "@/stores/use-view-patient-store";
import { format } from "date-fns";
import {
  Calendar,
  ClipboardList,
  HeartPulse,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";

// Main component
export const VewPatientSheet = () => {
  const { id, onClose, isOpen } = useViewPatientStore();
  const [activeTab, setActiveTab] = useState("overview");
  const { onOpen: newAppointment } = useAddAppointmentStore();
  const { data, isLoading } = useGetPatient(id || "");
  const patient = data?.data;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-fit bg-gradient-to-b from-white to-gray-50 rounded-md">
        {/* Header */}
        <DrawerHeader>
          {/* Main Header - Responsive Layout */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            {/* Patient Info - Column on mobile, Row on larger screens */}
            <div className="flex flex-col xs:flex-row gap-4 items-start xs:items-center">
              {isLoading ? (
                <Skeleton className="w-16 h-16 rounded-full" />
              ) : (
                <Avatar className="w-16 h-16 rounded-md">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${patient?.fullName}`}
                  />
                  <AvatarFallback>
                    {patient?.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}

              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {patient?.fullName}
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                      Patient ID: {patient?.id}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Button - Full width on mobile, auto on larger screens */}
            <div className="w-full xs:w-auto">
              <Button
                onClick={newAppointment}
                variant={"primary"}
                className="w-full xs:w-fit"
              >
                New Appointment
              </Button>
            </div>
          </div>

          {/* Tabs Navigation - Responsive Solution */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
            {/* Visible Tabs */}
            <div className="relative">
              <TabsList className="w-full overflow-x-auto hide-scrollbar">
                <TabsTrigger value="overview">
                  <UserIcon className="hidden sm:mr-2 h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  <Calendar className="hidden sm:mr-2 h-4 w-4" />
                  <span>Appointments</span>
                </TabsTrigger>
                <TabsTrigger value="medical">
                  <HeartPulse className="hidden sm:mr-2 h-4 w-4" />
                  <span>Medical</span>
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  <ClipboardList className="hidden sm:mr-2 h-4 w-4" />
                  <span>Prescriptions</span>
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <ShoppingCart className="hidden sm:mr-2 h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </DrawerHeader>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab}>
            <TabsContent value="overview">
              <OverviewTab patient={patient} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="appointments">
              <AppointmentsTab patient={patient} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="medical">
              <MedicalHistoryTab patient={patient} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="prescriptions">
              <PrescriptionsTab patient={patient} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTab patient={patient} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

// Tab Components
const OverviewTab = ({
  patient,
  isLoading,
}: {
  patient?: PatientResponseDto | undefined;
  isLoading: boolean;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Personal Info Card */}
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{patient?.fullName || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{patient?.phone || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {patient?.dateOfBirth
                  ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Account</p>
              <p className="font-medium">
                {patient?.user?.email || "No linked account"}
                {patient?.user?.isEmailVerified && (
                  <Badge className="ml-2" variant="success">
                    Verified
                  </Badge>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant={
                  patient?.status === "active"
                    ? "success"
                    : patient?.status === "inactive"
                    ? "destructive"
                    : "secondary"
                }
              >
                {patient?.status || "N/A"}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Stats Card */}
    <Card>
      <CardHeader>
        <CardTitle>Medical Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold">
                {patient?.appointments?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Appointments</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold">
                {patient?.consultations?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Consultations</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold">
                {patient?.prescriptions?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold">
                {patient?.orders?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Recent Activity Card */}
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Last 5 actions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ...(patient?.appointments?.map((a) => ({
                  ...a,
                  activityType: "appointment",
                })) || []),
                ...(patient?.consultations?.map((c) => ({
                  ...c,
                  activityType: "consultation",
                })) || []),
              ]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {item.activityType === "appointment"
                        ? "Appointment"
                        : "Consultation"}
                    </TableCell>
                    <TableCell>
                      {item.activityType === "appointment"
                        ? `Physical: ${item.type}`
                        : "Consultation"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  </div>
);

const AppointmentsTab = ({
  patient,
  isLoading,
}: {
  patient?: PatientResponseDto;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Appointment History</CardTitle>
      <CardDescription>All scheduled appointments</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : patient?.appointments && patient.appointments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patient.appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {format(
                    new Date(appointment.datetime),
                    "MMM dd, yyyy hh:mm a"
                  )}
                </TableCell>
                <TableCell className="capitalize">{appointment.type}</TableCell>
                <TableCell>
                  {format(new Date(appointment.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === "completed"
                        ? "success"
                        : appointment.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500">No appointments found</p>
      )}
    </CardContent>
  </Card>
);

const MedicalHistoryTab = ({
  patient,
  isLoading,
}: {
  patient?: PatientResponseDto;
  isLoading: boolean;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Medical Conditions</CardTitle>
        <CardDescription>Chronic and past conditions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : patient?.medicalHistory?.conditions &&
          patient.medicalHistory.conditions.length > 0 ? (
          <ul className="space-y-2">
            {patient.medicalHistory.conditions.map(
              (condition: string, index: number) => (
                <li key={index} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                  <span>{condition}</span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-gray-500">No medical conditions recorded</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Allergies</CardTitle>
        <CardDescription>Medication and food allergies</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : patient?.medicalHistory?.allergies &&
          patient.medicalHistory.allergies.length > 0 ? (
          <ul className="space-y-2">
            {patient.medicalHistory.allergies.map(
              (allergy: string, index: number) => (
                <li key={index} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                  <span>{allergy}</span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-gray-500">No allergies recorded</p>
        )}
      </CardContent>
    </Card>

    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Treatment History</CardTitle>
        <CardDescription>Past procedures and treatments</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : patient?.medicalHistory?.treatments &&
          patient.medicalHistory.treatments.length > 0 ? (
          <div className="space-y-4">
            {patient.medicalHistory.treatments.map(
              (treatment: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{treatment.procedure}</h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(treatment.date), "MMM yyyy")}
                    </p>
                  </div>
                  <p className="text-sm mt-2">{treatment.details}</p>
                  {treatment.outcome && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Outcome:</span>{" "}
                      {treatment.outcome}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500">No treatment history recorded</p>
        )}
      </CardContent>
    </Card>
  </div>
);

const PrescriptionsTab = ({
  patient,
  isLoading,
}: {
  patient?: PatientResponseDto;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Prescriptions</CardTitle>
      <CardDescription>Current and past medications</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : patient?.prescriptions && patient.prescriptions.length > 0 ? (
        <div className="space-y-4">
          {patient.prescriptions.map((prescription) => (
            <div key={prescription.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {prescription.medication?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {prescription.medication?.dosage}
                  </p>
                </div>
                <Badge
                  variant={
                    prescription.status === "active"
                      ? "success"
                      : prescription.status === "expired"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {prescription.status}
                </Badge>
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p>
                    {format(new Date(prescription.issueDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p>
                    {format(new Date(prescription.expiryDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Frequency</p>
                  <p>{prescription?.frequency}</p>
                </div>
              </div>

              {prescription.notes && (
                <div className="mt-3">
                  <p className="text-gray-500">Doctor's Notes</p>
                  <p className="text-sm">{prescription?.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No prescriptions found</p>
      )}
    </CardContent>
  </Card>
);

const OrdersTab = ({
  patient,
  isLoading,
}: {
  patient?: PatientResponseDto;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Orders & Purchases</CardTitle>
      <CardDescription>Medication and equipment orders</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : patient?.orders && patient.orders.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patient.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {format(new Date(order.orderDate), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {order.items
                    .slice(0, 2)
                    .map((item) => item.name)
                    .join(", ")}
                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "success"
                        : order.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.trackingNumber || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500">No orders found</p>
      )}
    </CardContent>
  </Card>
);
