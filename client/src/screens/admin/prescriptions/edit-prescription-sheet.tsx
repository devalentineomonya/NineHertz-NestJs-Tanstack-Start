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
import { useGetMedicines } from "@/services/medicines/use-get-medicines";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useGetPharmacists } from "@/services/pharmacists/use-get-pharmacists";
import { useEditPrescriptionService } from "@/services/prescriptions/use-edit-prescription";
import { useGetPrescription } from "@/services/prescriptions/use-get-prescription";
import { useEditPrescriptionStore } from "@/stores/use-edit-prescription-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Check, ChevronsUpDown, Loader, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { frequencyOptions } from "./add-prescriptions-drawer";

const prescriptionFormSchema = z
  .object({
    issueDate: z.date(),
    expiryDate: z.date(),
    isFulfilled: z.boolean().default(false).optional(),
    patientId: z.string().min(1, "Patient selection is required"),
    doctorId: z.string().min(1, "Doctor selection is required"),
    pharmacistId: z.string().optional(),
    items: z
      .array(
        z.object({
          medicineId: z.string().uuid("Invalid medicine selection"),
          dosage: z.string().min(1, "Dosage is required"),
          frequency: z.string().min(1, "Frequency is required"),
          note: z.string().optional(),
        })
      )
      .min(1, "At least one medicine is required"),
  })
  .refine((data) => data.expiryDate > data.issueDate, {
    message: "Expiry date must be after issue date",
    path: ["expiryDate"],
  })
  .refine(
    (data) => {
      if (data.isFulfilled && !data.pharmacistId) {
        return false;
      }
      return true;
    },
    {
      message: "Pharmacist is required when prescription is fulfilled",
      path: ["pharmacistId"],
    }
  );

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export const EditPrescriptionDrawer = () => {
  const { isOpen, onClose, id: prescriptionId } = useEditPrescriptionStore();
  const editPrescriptionMutation = useEditPrescriptionService();
  const { data: prescription, isLoading: loadingPrescription } =
    useGetPrescription(prescriptionId || "");
  const { data: patients = [], isLoading: loadingPatients } = useGetPatients();
  const { data: doctors, isLoading: loadingDoctors } = useGetDoctors();
  const { data: pharmacists, isLoading: loadingPharmacists } =
    useGetPharmacists();
  const { data: medicines, isLoading: loadingMedicines } = useGetMedicines();
  const prescriptionMedicines = medicines?.data.filter(
    (medicine) => medicine.type === "prescribed"
  );

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      items: [],
      issueDate: new Date(),
      expiryDate: new Date(),
      isFulfilled: false,
      patientId: "",
      doctorId: "",
      pharmacistId: "",
    },
  });

  const isFulfilled = form.watch("isFulfilled");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Handle medicine change with duplicate check
  const handleMedicineChange = (index: number, medicineId: string) => {
    const selectedMedicines = form
      .getValues("items")
      .map((item) => item.medicineId)
      .filter((id, i) => i !== index && id !== "");

    if (selectedMedicines.includes(medicineId)) {
      toast.warning(
        "This medicine is already added. Please update the existing entry instead.",
        { duration: 3000 }
      );
      form.setValue(`items.${index}.medicineId`, "");
      return;
    }
  };

  useEffect(() => {
    if (prescription) {
      form.reset({
        issueDate: new Date(prescription.issueDate),
        expiryDate: new Date(prescription.expiryDate),
        isFulfilled: prescription.isFulfilled,
        patientId: prescription.patient.id,
        doctorId: prescription.prescribedBy.id,
        pharmacistId: prescription.pharmacistId || "",
        items: prescription.items.map((item) => ({
          medicineId: item.medicineId,
          dosage: item.dosage,
          frequency: item.frequency,
          note: item.note || "",
        })),
      });
    }
  }, [prescription, form]);

  const onSubmit = async (data: PrescriptionFormValues) => {
    if (!prescriptionId) return;

    try {
      await editPrescriptionMutation.mutateAsync({
        id: prescriptionId,
        data: {
          issueDate: data.issueDate.toISOString(),
          expiryDate: data.expiryDate.toISOString(),
          isFulfilled: data.isFulfilled,
          patientId: data.patientId,
          doctorId: data.doctorId,
          pharmacistId: data.isFulfilled ? data.pharmacistId : undefined,
          items: data.items,
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
              <div className="space-y-4">
                <FormLabel>Prescribed Medicines</FormLabel>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-3 relative"
                  >
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Medicine Selection */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.medicineId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleMedicineChange(index, value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select medicine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingMedicines ? (
                                <div className="flex justify-center py-4">
                                  <Loader className="animate-spin" />
                                </div>
                              ) : (
                                prescriptionMedicines?.map((medicine) => (
                                  <SelectItem
                                    key={medicine.id}
                                    value={medicine.id}
                                  >
                                    {medicine.name} ({medicine.type})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* Dosage */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Dosage</FormLabel>
                            <FormControl className="w-full">
                              <Input placeholder="e.g., 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Frequency */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Frequency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl className="w-full">
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {frequencyOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Note */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.note`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Special instructions"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() =>
                    append({
                      medicineId: "",
                      dosage: "",
                      frequency: "",
                      note: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Medicine
                </Button>
              </div>

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
                    name="pharmacistId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fulfilled By pharmacist</FormLabel>
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
                                  ? pharmacists?.find(
                                      (pharmacist) =>
                                        pharmacist.id === field.value
                                    )?.fullName
                                  : "Select pharmacist"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search pharmacists..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingPharmacists
                                    ? "Loading..."
                                    : "No pharmacists found"}
                                </CommandEmpty>
                                <CommandGroup>
                                  {pharmacists?.map((pharmacist) => (
                                    <CommandItem
                                      value={pharmacist.fullName}
                                      key={pharmacist.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "pharmacistId",
                                          pharmacist.id
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          pharmacist.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {pharmacist.fullName}
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
