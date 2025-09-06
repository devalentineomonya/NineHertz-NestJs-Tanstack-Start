import { Button } from "@/components/ui/button";
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
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEditMedicineService } from "@/services/medicines/use-edit-medicine";
import { useGetMedicine } from "@/services/medicines/use-get-medicine";
import { useEditMedicineStore } from "@/stores/use-edit-medicine-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectContent } from "@radix-ui/react-select";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const medicineFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  genericName: z.string().min(2, "Generic name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be at least $0.01"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  type: z.enum(["otc", "prescribed"], {
    required_error: "Type is required",
  }),
  barcode: z.string().optional(),
});

type MedicineFormValues = z.infer<typeof medicineFormSchema>;

export const EditMedicineDrawer = () => {
  const { isOpen, onClose, id: medicineId } = useEditMedicineStore();
  const { data: medicine, isLoading: loadingMedicine } = useGetMedicine(
    medicineId || ""
  );
  const editMedicineMutation = useEditMedicineService();

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: "",
      genericName: "",
      description: "",
      price: 10.00,
      manufacturer: "",
      barcode: "",
    },
  });

  useEffect(() => {
    if (medicine) {
      form.reset({
        name: medicine.name,
        genericName: medicine.genericName,
        description: medicine.description,
        price: Number(medicine.price),
        manufacturer: medicine.manufacturer,
        barcode: medicine.barcode || "",
      });
    }
  }, [medicine, form]);

  const onSubmit = async (data: MedicineFormValues) => {
    if (!medicineId) return;

    try {
      await editMedicineMutation.mutateAsync({
        id: medicineId,
        data,
      });
      toast.success("Medicine updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update medicine");
    }
  };

  if (loadingMedicine) {
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
            Edit Medicine
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Medicine Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Amoxicillin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Generic Name */}
              <FormField
                control={form.control}
                name="genericName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Amoxicillin trihydrate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="border rounded px-3 py-2 w-full">
                          <SelectValue placeholder=" Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="otc">OTC</SelectItem>
                          <SelectItem value="prescribed">Prescribed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Antibiotic used to treat bacterial infections"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="15.99"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Manufacturer */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="PharmaCorp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Barcode */}
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890123" {...field} />
                    </FormControl>
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
            disabled={editMedicineMutation.isPending}
          >
            {editMedicineMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              "Update Medicine"
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
