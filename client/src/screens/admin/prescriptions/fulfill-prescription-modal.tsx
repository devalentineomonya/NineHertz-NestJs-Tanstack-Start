import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFulfillPrescriptionStore } from "@/stores/use-fulfill-prescription-store";
// import { useFulfillPrescriptionService } from "@/services/prescriptions/use-fulfill-prescription";
import { useGetPharmacies } from "@/services/pharmacies/use-get-pharmacies";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FulfillPrescriptionModal() {
  const { isOpen, onClose, prescriptionId } = useFulfillPrescriptionStore();
  const { data: pharmacies, isLoading: loadingPharmacies } = useGetPharmacies();
  //   const fulfillMutation = useFulfillPrescriptionService();
  const [open, setOpen] = useState(false);
  const [pharmacyId, setPharmacyId] = useState("");

  const handleFulfill = async () => {
    if (!prescriptionId || !pharmacyId) return;

    try {
      //   await fulfillMutation.mutateAsync({
      //     id: prescriptionId,
      //     pharmacyId,
      //   });
      toast.success("Prescription marked as fulfilled");
      onClose();
    } catch (error) {
      toast.error("Failed to fulfill prescription");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark as Fulfilled</DialogTitle>
          <DialogDescription>
            Select the pharmacy that fulfilled this prescription
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {pharmacyId
                  ? pharmacies?.find((pharmacy) => pharmacy.id === pharmacyId)
                      ?.name
                  : "Select pharmacy..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search pharmacies..." />
                <CommandList>
                  <CommandEmpty>
                    {loadingPharmacies ? "Loading..." : "No pharmacies found"}
                  </CommandEmpty>
                  <CommandGroup>
                    {pharmacies?.map((pharmacy) => (
                      <CommandItem
                        key={pharmacy.id}
                        value={pharmacy.name}
                        onSelect={() => {
                          setPharmacyId(pharmacy.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            pharmacyId === pharmacy.id
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            // disabled={fulfillMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFulfill}
            // disabled={!pharmacyId || fulfillMutation.isPending}
          >
            {true ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin h-4 w-4" />
                Updating...
              </div>
            ) : (
              "Confirm Fulfillment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
