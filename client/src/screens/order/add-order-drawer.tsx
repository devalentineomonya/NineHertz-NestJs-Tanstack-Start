import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useGetMedicines } from "@/services/medicines/use-get-medicines";
import { useAddOrderService } from "@/services/order/use-add-order";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useGetPrescriptionsByPatient } from "@/services/prescriptions/use-get-patient-prescription";
import { useAddOrderStore } from "@/stores/use-add-order-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { orderSchema, OrderStatus, OrderFormValues } from "./order-schema";
enum MedicineType {
  OTC = "otc",
  PRESCRIBED = "prescribed",
}

export function AddOrderDrawer() {
  const [total, setTotal] = useState(0);
  const { data: patients, isLoading: loadingPatients } = useGetPatients();
  const { data: medicinesData } = useGetMedicines();
  const medicines = medicinesData?.data;
  const { onClose, isOpen } = useAddOrderStore();
  const handler = useAddOrderService();
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      patientId: "",
      items: [{ medicineId: "", quantity: 1, pricePerUnit: 0 }],
      status: OrderStatus.PENDING,
      totalAmount: 0,
    },
  });

  const patientId = form.watch("patientId");
  const { data: prescriptions, isLoading: loadingPrescriptions } =
    useGetPrescriptionsByPatient(patientId, { enabled: !!patientId });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateTotal = () => {
    const items = form.getValues("items");
    const newTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );
    setTotal(newTotal);
    form.setValue("totalAmount", newTotal);
    return newTotal;
  };

  const handleMedicineChange = (index: number, medicineId: string) => {
    const selectedMedicine = medicines?.find((m) => m.id === medicineId);
    if (!selectedMedicine) return;

    // Check for duplicate medicine
    const currentItems = form.getValues("items");
    const duplicateIndex = currentItems.findIndex(
      (item, i) => i !== index && item.medicineId === medicineId
    );

    if (duplicateIndex !== -1) {
      toast.warning(
        "This medicine is already in your order. Please update the existing item instead.",
        { position: "top-center" }
      );
      form.setValue(`items.${index}.medicineId`, "");
      return;
    }

    // Set price
    form.setValue(`items.${index}.pricePerUnit`, selectedMedicine.price);

    if (selectedMedicine.type === MedicineType.PRESCRIBED) {
      if (!patientId) {
        toast.error(
          "Please select a patient first for prescription medicines",
          {
            position: "top-center",
          }
        );
        form.setValue(`items.${index}.medicineId`, "");
        return;
      }

      // Validate prescriptions
      if (!loadingPrescriptions && prescriptions) {
        const today = new Date();
        const isValid = prescriptions.some((prescription) => {
          const expiryDate = new Date(prescription.expiryDate);
          return (
            expiryDate >= today &&
            prescription.items.some((item) => item.medicineId === medicineId)
          );
        });

        if (!isValid) {
          toast.error(
            "Patient doesn't have a valid prescription for this medicine",
            { position: "top-center" }
          );
          form.setValue(`items.${index}.medicineId`, "");
        }
      }
    }

    calculateTotal();
  };

  const handleQuantityChange = (index: number, value: number) => {
    form.setValue(`items.${index}.quantity`, value);
    calculateTotal();
  };

  const handleSubmit: SubmitHandler<OrderFormValues> = async (data) => {
    try {
      await handler.mutateAsync({ ...data, totalAmount: parseFloat(data.totalAmount.toString())});
      toast.success("Order created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [fields.length]);

  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];

    const validPrescriptionIds = new Set(
      prescriptions?.flatMap((prescription) =>
        prescription.items.map((item) => item.medicineId)
      ) || []
    );

    return medicines
      .filter((medicine) => {
        if (medicine.type === MedicineType.OTC) return true;
        return patientId && validPrescriptionIds.has(medicine.id);
      })
      .sort((a, b) => {
        if (
          a.type === MedicineType.PRESCRIBED &&
          b.type !== MedicineType.PRESCRIBED
        )
          return -1;
        if (
          b.type === MedicineType.PRESCRIBED &&
          a.type !== MedicineType.PRESCRIBED
        )
          return 1;
        return a.name.localeCompare(b.name);
      });
  }, [medicines, prescriptions, patientId]);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Create New Order
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-auto p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 mt-4"
            >
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
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
                              ? patients?.find(
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
                              {patients?.map((patient) => (
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

              {/* Order Items */}
              <div className="space-y-4">
                <FormLabel>Order Items</FormLabel>
                {fields.map((field, index) => {
                  const selectedMedicine = medicines?.find(
                    (med) => med.id === form.watch(`items.${index}.medicineId`)
                  );

                  const price = selectedMedicine?.price || 0;
                  const lineTotal =
                    form.watch(`items.${index}.quantity`) * price;

                  return (
                    <div
                      key={field.id}
                      className="flex gap-4 items-center max-lg:flex-wrap"
                    >
                      <div className="flex-1 w-[200px]">
                        <FormField
                          control={form.control}
                          name={`items.${index}.medicineId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                disabled={!patientId}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleMedicineChange(index, value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue
                                      placeholder={
                                        patientId
                                          ? "Select medicine"
                                          : "Select patient first"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredMedicines.map((medicine) => (
                                    <SelectItem
                                      key={medicine.id}
                                      value={medicine.id}
                                    >
                                      <div className="flex justify-between w-full">
                                        <span>{medicine.name}</span>
                                        <span className="text-muted-foreground text-xs">
                                          {medicine.type ===
                                          MedicineType.PRESCRIBED
                                            ? "(Rx)"
                                            : "(OTC)"}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                  {filteredMedicines.length === 0 && (
                                    <div className="text-sm p-2 text-center">
                                      {patientId
                                        ? "No available medicines"
                                        : "Select a patient first"}
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="w-[120px]">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-r-none"
                                    onClick={() =>
                                      handleQuantityChange(
                                        index,
                                        Math.max(1, field.value - 1)
                                      )
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    {...field}
                                    type="number"
                                    min={1}
                                    className="rounded-none h-8 w-14 text-center"
                                    onChange={(e) => {
                                      const value =
                                        parseInt(e.target.value) || 1;
                                      field.onChange(value);
                                      handleQuantityChange(index, value);
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-l-none"
                                    onClick={() =>
                                      handleQuantityChange(
                                        index,
                                        field.value + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <input
                        type="hidden"
                        {...form.register(`items.${index}.pricePerUnit`, {
                          valueAsNumber: true,
                        })}
                      />
                      {/* Line Total */}
                      <div className="w-[80px] text-right">
                        <p className="text-sm font-medium">
                          Kes {lineTotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <div className="w-[40px]">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            remove(index);
                            calculateTotal();
                          }}
                          disabled={fields.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() =>
                    append({
                      medicineId: "",
                      quantity: 1,
                      pricePerUnit: 0,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              {currentUser?.role !== "patient" && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(OrderStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Order Status */}

              {/* Total Amount */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold">
                  Kes {total.toFixed(2)}
                </span>
                <input
                  type="hidden"
                  {...form.register("totalAmount")}
                  value={total}
                />
              </div>
            </form>
          </Form>
        </div>
        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="primary"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={handler.isPending}
          >
            {handler.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Ordering...
              </div>
            ) : (
              "Create Order"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
