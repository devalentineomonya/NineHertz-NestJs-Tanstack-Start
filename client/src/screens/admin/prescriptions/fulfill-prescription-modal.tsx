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
import { cn } from "@/lib/utils";
import { useGetPharmacists } from "@/services/pharmacists/use-get-pharmacists";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFulfillPrescriptionService } from "@/services/prescriptions/use-fulfil-prescription";
import { useGetPrescription } from "@/services/prescriptions/use-get-prescription";

export function FulfillPrescriptionModal() {
  const { isOpen, onClose, prescriptionId } = useFulfillPrescriptionStore();
  const { data: pharmacies, isLoading: loadingPharmacies } =
    useGetPharmacists();
  const fulfillMutation = useFulfillPrescriptionService();
  const [open, setOpen] = useState(false);
  const [pharmacistId, setPharmacistId] = useState("");
  const { data: prescription } = useGetPrescription(prescriptionId || "");

  const handleFulfill = async () => {
    if (!prescriptionId || !pharmacistId) return;

    try {
      await fulfillMutation.mutateAsync({
        id: prescriptionId,
        data: { ...prescription, isFulfilled: true, pharmacistId },
      });
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
                {pharmacistId
                  ? pharmacies?.find(
                      (pharmacist) => pharmacist.id === pharmacistId
                    )?.fullName
                  : "Select pharmacist..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search pharmacists..." />
                <CommandList>
                  <CommandEmpty>
                    {loadingPharmacies ? "Loading..." : "No pharmacists found"}
                  </CommandEmpty>
                  <CommandGroup>
                    {pharmacies?.map((pharmacist) => (
                      <CommandItem
                        key={pharmacist.id}
                        value={pharmacist.fullName}
                        onSelect={() => {
                          setPharmacistId(pharmacist.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            pharmacistId === pharmacist.id
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={fulfillMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFulfill}
            disabled={!pharmacistId || fulfillMutation.isPending}
          >
            {fulfillMutation.isPending ? (
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
