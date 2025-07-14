import { useEffect, useInsertionEffect, useState } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, X, Loader, ChevronsUpDown, Check } from "lucide-react";
import { useGetPharmacies } from "@/services/pharmacies/use-get-pharmacies";
import { useGetMedicine } from "@/services/medicines/use-get-medicine";
import { useAddOrderStore } from "@/stores/use-add-order-store";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useAddOrderService } from "@/services/order/use-add-order";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

const orderSchema = z.object({
  patientId: z.string().uuid("Invalid UUID format"),
  pharmacyId: z.string().uuid("Invalid UUID format"),
  items: z
    .array(
      z.object({
        medicineId: z.string().uuid("Invalid UUID format"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        pricePerUnit: z.number().min(0.01, "Price must be positive"),
      })
    )
    .min(1, "At least one item is required"),
  status: z.nativeEnum(OrderStatus).optional(),
  totalAmount: z.number().min(0.01, "Total must be positive"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export function AddOrderDrawer() {
  const [total, setTotal] = useState(0);
  const { data: patients, isLoading: loadingPatients } = useGetPatients();
  const { data: pharmacies, isLoading: loadingPharmacies } = useGetPharmacies();
  const { data: medicines, isLoading: loadingMedicines } = useGetMedicine();
  const { onClose, isOpen } = useAddOrderStore();
  const handler = useAddOrderService();
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      patientId: "",
      pharmacyId: "",
      items: [{ medicineId: "", quantity: 1, pricePerUnit: 0 }],
      status: OrderStatus.PENDING,
      totalAmount: 0,
    },
  });

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
    const selectedMedicine = medicines?.data.find((m) => m.id === medicineId);
    if (selectedMedicine) {
      form.setValue(`items.${index}.pricePerUnit`, selectedMedicine.price);
    }
    calculateTotal();
  };

  const handleQuantityChange = (index: number, value: number) => {
    form.setValue(`items.${index}.quantity`, value);
    calculateTotal();
  };
  useEffect(() => {
    console.log(form.formState.errors);
  });
  const handleSubmit: SubmitHandler<OrderFormValues> = async (data) => {
    try {
      await handler.mutateAsync(data);
      toast.success("Order was created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

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

              {/* Pharmacy Selection */}
              <FormField
                control={form.control}
                name="pharmacyId"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Select Pharmacy</FormLabel>
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
                              : "Select Pharmacy"}
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
                                    form.setValue("pharmacyId", pharmacy.id);
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

              {/* Order Items */}
              <div className="space-y-4">
                <FormLabel>Order Items</FormLabel>
                {fields.map((field, index) => {
                  const selectedMedicine = medicines?.data.find(
                    (med) => med.id === form.watch(`items.${index}.medicineId`)
                  );

                  // FIXED: Use actual price instead of 0
                  const price = selectedMedicine?.price || 0;
                  const lineTotal =
                    form.watch(`items.${index}.quantity`) * price;
                  return (
                    <div key={field.id} className="flex gap-4 items-center">
                      {/* Medicine Selection */}
                      <div className="flex-1 min-w-[200px]">
                        <FormField
                          control={form.control}
                          name={`items.${index}.medicineId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleMedicineChange(index, value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select medicine" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {medicines?.data.map((medicine) => (
                                    <SelectItem
                                      key={medicine.id}
                                      value={medicine.id}
                                    >
                                      <div className="flex justify-between w-full">
                                        <span>{medicine.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
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
                          ${lineTotal.toFixed(2)}
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
                  className="mt-2"
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

              {/* Order Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {/* Total Amount */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold">${total.toFixed(2)}</span>
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
