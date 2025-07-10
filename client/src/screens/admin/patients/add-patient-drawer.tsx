import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { useAddPatientStore } from "@/stores/use-add-patient-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetUsers } from "@/services/users/use-get-users";
import { useAddPatientService } from "@/services/patients/use-add-patient";

const patientFormSchema = z.object({
  userId: z.string().min(1, "User selection is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(5, "Phone must be at least 5 characters"),
  dateOfBirth: z.date().optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export const AddPatientDrawer = () => {
  const { isOpen, onClose } = useAddPatientStore();
  const addPatientMutation = useAddPatientService();
  const { data: availableUsers = [], isLoading: loadingUsers } = useGetUsers();
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      userId: "",
      fullName: "",
      phone: "",
      dateOfBirth: undefined,
      allergies: [],
      conditions: [],
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      const medicalHistory: Record<string, any> = {};
      if (data.allergies?.length) medicalHistory.allergies = data.allergies;
      if (data.conditions?.length) medicalHistory.conditions = data.conditions;

      await addPatientMutation.mutateAsync({
        userId: data.userId,
        newPatient: {
          ...data,
          medicalHistory: Object.keys(medicalHistory).length
            ? medicalHistory
            : undefined,
        },
      });

      toast.success("Patient profile created successfully");
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Failed to create patient profile");
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      const currentAllergies = form.getValues("allergies") || [];
      form.setValue("allergies", [...currentAllergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      const currentConditions = form.getValues("conditions") || [];
      form.setValue("conditions", [
        ...currentConditions,
        conditionInput.trim(),
      ]);
      setConditionInput("");
    }
  };

  const removeAllergy = (index: number) => {
    const currentAllergies = [...(form.getValues("allergies") || [])];
    currentAllergies.splice(index, 1);
    form.setValue("allergies", currentAllergies);
  };

  const removeCondition = (index: number) => {
    const currentConditions = [...(form.getValues("conditions") || [])];
    currentConditions.splice(index, 1);
    form.setValue("conditions", currentConditions);
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            Create Patient Profile
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* User Selection */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Select User</FormLabel>
                    <Popover>
                      <PopoverTrigger className="w-full" asChild>
                        <FormControl className="w-full border border-input shadow-input">
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? availableUsers.find(
                                  (user) => user.id === field.value
                                )?.email
                              : "Select user"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-full p-0 border shadow-input"
                      >
                        <Command>
                          <CommandInput placeholder="Search users..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingUsers ? "Loading..." : "No users found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {availableUsers
                                .filter((user) => user.role === "patient" && !user.profile)
                                .map((user) => (
                                  <CommandItem
                                    value={user.email}
                                    key={user.id}
                                    onSelect={() => {
                                      form.setValue("userId", user.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        user.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {user.email}
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

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergies */}
              <div className="space-y-2">
                <Label>Allergies (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="Add allergy..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAllergy();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addAllergy}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("allergies")?.map((allergy, index) => (
                    <Badge key={index} variant="secondary">
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="ml-2"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <Label>Conditions (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    placeholder="Add condition..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCondition();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addCondition}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("conditions")?.map((condition, index) => (
                    <Badge key={index} variant="secondary">
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="ml-2"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="flex flex-col justify-end gap-3 border-t pt-4">
          <Button
            variant="primary"
            onClick={form.handleSubmit(onSubmit)}
            disabled={addPatientMutation.isPending}
          >
            {addPatientMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Creating...
              </div>
            ) : (
              "Create Patient Profile"
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
