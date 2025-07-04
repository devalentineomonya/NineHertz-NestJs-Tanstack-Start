import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAddAppointment } from "@/store/use-add-appointment-sidebar";

export const AddAppointmentSheet = () => {
  const { isOpen, onClose } = useAddAppointment();
  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose} >
      <DrawerContent className="right-2 top-2 bottom-2 fixed  flex"  style={{ '--initial-transform': 'calc(100% + 4px)' } as React.CSSProperties}>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="[data-vaul-drawer][data-vaul-drawer-direction=right]::after:hidden">
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
