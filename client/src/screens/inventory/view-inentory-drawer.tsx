import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";

import {
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useInventoryDrawerStore } from "@/stores/use-inventory-drawer";

type DrawerType = "view" | "adjust" | "reorder" | null;

export function ViewInventoryDrawer() {
  const { drawerType, selectedItem, closeDrawer } = useInventoryDrawerStore();

  if (drawerType !== "view" || !selectedItem) return null;

  return (
    <Drawer
      direction="right"
      open={drawerType === "view"}
      onOpenChange={(open) => !open && closeDrawer()}
    >
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DrawerTitle className="text-lg">
                {selectedItem.medicine.name}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                {selectedItem.medicine.type.toUpperCase()} • {selectedItem.id}
              </p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Current Quantity</Label>
              <p className="font-medium text-lg">
                {selectedItem.quantity} units
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Reorder Threshold</Label>
              <p className="font-medium text-lg">
                {selectedItem.reorderThreshold} units
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground">Last Restocked</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(selectedItem.lastRestocked).toLocaleDateString()} •{" "}
                {Math.floor(
                  (new Date().getTime() -
                    new Date(selectedItem.lastRestocked).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days ago
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground">Status</Label>
            {selectedItem.quantity === 0 ? (
              <Badge variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" />
                Out of Stock
              </Badge>
            ) : selectedItem.quantity <= selectedItem.reorderThreshold ? (
              <Badge variant="warning" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low Stock
              </Badge>
            ) : (
              <Badge variant="success" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                In Stock
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground">
              Medicine Information
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Type</Label>
                <p>{selectedItem.medicine.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Manufacturer
                </Label>
                <p>{selectedItem.medicine.manufacturer || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Manufacturer
                </Label>
                <p>{selectedItem.medicine.manufacturer || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Reorder Threshold
                </Label>
                <p>{selectedItem.reorderThreshold || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
