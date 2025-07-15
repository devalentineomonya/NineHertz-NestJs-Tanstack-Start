import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useGetDoctors } from "@/services/doctors/use-get-doctors";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useGetPharmacies } from "@/services/pharmacies/use-get-pharmacies";
import { useEditPrescriptionService } from "@/services/prescriptions/use-edit-prescription";
import { useGetPrescription } from "@/services/prescriptions/use-get-prescription";
import { useEditPrescriptionStore } from "@/stores/use-edit-prescription-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const prescriptionFormSchema = z
  .object({
    medicationDetails: z.string().min(1, "Medication details are required"),
    issueDate: z.date(),
    expiryDate: z.date(),
    isFulfilled: z.boolean().default(false),
    patientId: z.string().min(1, "Patient selection is required"),
    doctorId: z.string().min(1, "Doctor selection is required"),
    pharmacyId: z.string().optional(),
  })
  .refine((data) => data.expiryDate > data.issueDate, {
    message: "Expiry date must be after issue date",
    path: ["expiryDate"],
  });

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export const EditPrescriptionDrawer = () => {
  const { isOpen, onClose, id: prescriptionId } = useEditPrescriptionStore();
  const editPrescriptionMutation = useEditPrescriptionService();
  const { data: prescription, isLoading: loadingPrescription } =
    useGetPrescription(prescriptionId || "");
  const { data: patients = [], isLoading: loadingPatients } = useGetPatients();
  const { data: doctors, isLoading: loadingDoctors } = useGetDoctors();
  const { data: pharmacies, isLoading: loadingPharmacies } = useGetPharmacies();

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      medicationDetails: "",
      issueDate: new Date(),
      expiryDate: new Date(),
      isFulfilled: false,
      patientId: "",
      doctorId: "",
      pharmacyId: "",
    },
  });

  const isFulfilled = form.watch("isFulfilled");

  // Set form values when prescription data is loaded
  useEffect(() => {
    if (prescription) {
      form.reset({
        medicationDetails: prescription.medicationDetails,
        issueDate: new Date(prescription.issueDate),
        expiryDate: new Date(prescription.expiryDate),
        isFulfilled: prescription.isFulfilled,
        patientId: prescription.patient.id,
        doctorId: prescription.prescribedBy.id,
        pharmacyId: prescription.pharmacyId || "",
      });
    }
  }, [prescription, form]);

  const onSubmit = async (data: PrescriptionFormValues) => {
    if (!prescriptionId) return;

    try {
      await editPrescriptionMutation.mutateAsync({
        id: prescriptionId,
        data: {
          medicationDetails: data.medicationDetails,
          issueDate: data.issueDate,
          expiryDate: data.expiryDate,
          isFulfilled: data.isFulfilled,
          patientId: data.patientId,
          doctorId: data.doctorId,
          pharmacyId: data.isFulfilled ? data.pharmacyId : undefined,
        },
      });

      toast.success("Prescription updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update prescription");
    }
  };

  if (loadingPrescription) {
    return (
      <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-center justify-center h-full">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Edit Prescription
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Medication Details */}
              <FormField
                control={form.control}
                name="medicationDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Drug name, dosage, frequency..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates Section */}
              <div className="grid grid-cols-2 gap-4">
                {/* Issue Date */}
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues("issueDate")
                            }
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fulfillment Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isFulfilled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Prescription fulfilled?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {isFulfilled && (
                  <FormField
                    control={form.control}
                    name="pharmacyId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fulfilled By Pharmacy</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? pharmacies?.find(
                                      (pharmacy) => pharmacy.id === field.value
                                    )?.name
                                  : "Select pharmacy"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search pharmacies..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingPharmacies
                                    ? "Loading..."
                                    : "No pharmacies found"}
                                </CommandEmpty>
                                <CommandGroup>
                                  {pharmacies?.map((pharmacy) => (
                                    <CommandItem
                                      value={pharmacy.name}
                                      key={pharmacy.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "pharmacyId",
                                          pharmacy.id
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          pharmacy.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {pharmacy.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Patient</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? patients.find(
                                  (patient) => patient.id === field.value
                                )?.fullName
                              : "Select patient"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search patients..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingPatients
                                ? "Loading..."
                                : "No patients found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {patients.map((patient) => (
                                <CommandItem
                                  value={patient.fullName}
                                  key={patient.id}
                                  onSelect={() => {
                                    form.setValue("patientId", patient.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      patient.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {patient.fullName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Doctor Selection */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Prescribing Doctor</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? doctors?.data.find(
                                  (doctor) => doctor.id === field.value
                                )?.fullName
                              : "Select doctor"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search doctors..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingDoctors
                                ? "Loading..."
                                : "No doctors found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {doctors?.data.map((doctor) => (
                                <CommandItem
                                  value={doctor.fullName}
                                  key={doctor.id}
                                  onSelect={() => {
                                    form.setValue("doctorId", doctor.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      doctor.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {doctor.fullName} ({doctor.specialty})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="primary"
            onClick={form.handleSubmit(onSubmit)}
            disabled={editPrescriptionMutation.isPending}
          >
            {editPrescriptionMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              "Update Prescription"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
