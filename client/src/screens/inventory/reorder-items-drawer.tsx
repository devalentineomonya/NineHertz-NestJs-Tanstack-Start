import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInventoryDrawerStore } from "@/stores/use-inventory-drawer";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reorderSchema, type ReorderFormData } from "./reorder-schema";
import { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const ReorderItemDrawer = () => {
  const { drawerType, selectedItem, closeDrawer } = useInventoryDrawerStore();

  const form = useForm<ReorderFormData>({
    resolver: zodResolver(reorderSchema),
    defaultValues: {
      restockQuantity: 1,
      supplier: "",
      batchNumber: "",
      expiryDate: "",
      notes: "",
    },
  });

  // Reset form when selected item changes
  useEffect(() => {
    form.reset();
  }, [selectedItem, form]);

  const onSubmit = async (data: ReorderFormData) => {
    if (!selectedItem) return;
    console.log("Form submitted:", data);
    closeDrawer();
  };

  if (drawerType !== "reorder" || !selectedItem) return null;

  return (
    <Drawer
      direction="right"
      open={drawerType === "reorder"}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          closeDrawer();
        }
      }}
    >
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <div className="px-6 py-4 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DrawerHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <PlusCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <DrawerTitle>Record Restock</DrawerTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.medicine.name}
                  </p>
                </div>
              </div>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Current Quantity
                </Label>
                <p className="font-medium text-lg">
                  {selectedItem.quantity} units
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="restockQuantity">Quantity Added</Label>
                <Input
                  id="restockQuantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  {...form.register("restockQuantity", { valueAsNumber: true })}
                />
                {form.formState.errors.restockQuantity && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.restockQuantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                placeholder="Supplier name"
                {...form.register("supplier")}
              />
              {form.formState.errors.supplier && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.supplier.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  placeholder="Enter batch number"
                  {...form.register("batchNumber")}
                />
                {form.formState.errors.batchNumber && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.batchNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("expiryDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("expiryDate")
                        ? format(new Date(form.watch("expiryDate")), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        form.watch("expiryDate")
                          ? new Date(form.watch("expiryDate"))
                          : undefined
                      }
                      onSelect={(date) =>
                        form.setValue(
                          "expiryDate",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      disabled={(date) =>
                        date < new Date() || date > new Date("2100-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.expiryDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.expiryDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information"
                {...form.register("notes")}
              />
            </div>
          </form>
        </div>
        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              form.reset();
              closeDrawer();
            }}
          >
            Cancel
          </Button>
          <Button
            variant={"primary"}
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Processing..." : "Record Restock"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
