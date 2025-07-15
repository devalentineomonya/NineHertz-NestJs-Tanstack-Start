import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewMedicineStore } from "@/stores/use-view-medicine-store";
import { Pill, FileText, DollarSign, Factory, Barcode } from "lucide-react";

export const ViewMedicineDrawer = () => {
  const {
    isOpen,
    onClose,
    medicine: selectedMedicine,
    id: medicineId,
  } = useViewMedicineStore();

  if (!selectedMedicine) return null;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DrawerTitle className="font-extrabold text-xl">
                {selectedMedicine.name}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">ID: {medicineId}</p>
            </div>
          </div>
          <Badge variant="secondary">Medicine</Badge>
        </DrawerHeader>

        <ScrollArea className="px-6 py-4 h-[calc(100dvh-172px)]">
          <div className="space-y-4">
            {/* Medicine Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Pill className="h-5 w-5" />
                  Medicine Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Brand Name</p>
                  <p className="font-medium">{selectedMedicine.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Generic Name</p>
                  <p className="font-medium">{selectedMedicine.genericName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-line">
                    {selectedMedicine.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Manufacturer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Manufacturer
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">Kes: {selectedMedicine.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{selectedMedicine.manufacturer}</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Barcode className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Barcode</p>
                    <p className="font-medium">
                      {selectedMedicine.barcode || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {new Date(selectedMedicine.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {new Date(selectedMedicine.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DrawerFooter className="flex flex-row justify-end gap-3 border-t pt-4">
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
