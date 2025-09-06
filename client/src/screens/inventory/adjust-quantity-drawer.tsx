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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInventoryDrawerStore } from "@/stores/use-inventory-drawer";
import { ArrowLeftRight } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdjustmentReason,
  AdjustmentType,
  adjustQuantitySchema,
  type AdjustQuantityFormData,
} from "./adjust-quantity-schema";
import { useEffect } from "react";

export const AdjustQuantity = () => {
  const { drawerType, selectedItem, closeDrawer } = useInventoryDrawerStore();

  const form = useForm<AdjustQuantityFormData>({
    resolver: zodResolver(adjustQuantitySchema),
    defaultValues: {
      adjustmentType: "add",
      quantity: 1,
      reason: "other",
      notes: "",
    },
  });

  useEffect(() => {
    form.reset();
  }, [selectedItem, form]);

  const onSubmit = (data: AdjustQuantityFormData) => {
    if (!selectedItem) return;

    console.log("Form submitted:", data);
    // Here you would typically call your API to adjust the quantity
    // Then close the drawer
    closeDrawer();
  };

  const handleAdjustmentTypeChange = (value: string) => {
    form.setValue("adjustmentType", value as AdjustmentType);
  };

  const handleReasonChange = (value: string) => {
    form.setValue("reason", value as AdjustmentReason);
  };

  if (drawerType !== "adjust" || !selectedItem) return null;

  return (
    <Drawer
      direction="right"
      open={drawerType === "adjust"}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          closeDrawer();
        }
      }}
    >
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <div className=" py-4 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DrawerHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ArrowLeftRight className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <DrawerTitle>Adjust Quantity</DrawerTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.medicine.name}
                  </p>
                </div>
              </div>
            </DrawerHeader>

            <div className="p-6 space-y-6">
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
                  <Label htmlFor="adjustmentType">Adjustment Type</Label>
                  <Select
                    onValueChange={handleAdjustmentTypeChange}
                    defaultValue={form.watch("adjustmentType")}
                  >
                    <SelectTrigger className="w-full" id="adjustmentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Stock</SelectItem>
                      <SelectItem value="remove">Remove Stock</SelectItem>
                      <SelectItem value="set">Set to Specific Value</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.adjustmentType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.adjustmentType.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select
                  onValueChange={handleReasonChange}
                  defaultValue={form.watch("reason")}
                >
                  <SelectTrigger className="w-full" id="reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged Goods</SelectItem>
                    <SelectItem value="expired">Expired Stock</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.reason.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information"
                  {...form.register("notes")}
                />
              </div>
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
            variant="primary"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Processing..." : "Apply Adjustment"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
