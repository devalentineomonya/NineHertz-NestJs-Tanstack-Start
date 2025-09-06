import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  HandCoins,
  HeartPulse,
  MoreHorizontal,
  User,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDoctorAvailabilityStore } from "@/stores/use-doctor-availability-store";
import { useUpdateDoctorAvailabilityStore } from "@/stores/use-update-doctor-availability-store";
import { useUpdateDoctorStore } from "@/stores/use-update-doctor-store";
import { useDeleteDoctorStore } from "@/stores/use-delete-doctor-store";
import { useUserSessionStore } from "@/stores/user-session-store";

export const doctorColumns: ColumnDef<DoctorResponseDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 32,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "fullName",
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Doctor" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
        <div>
          <div className="font-medium">{row.original.fullName}</div>
          <div className="text-sm text-gray-500">
            {row.original.licenseNumber || "License pending"}
          </div>
        </div>
      </div>
    ),
    meta: {
      label: "Doctor",
      placeholder: "Search doctors...",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
  },
  {
    id: "specialty",
    accessorKey: "specialty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Specialty" />
    ),
    cell: ({ cell }) => (
      <Badge variant="secondary" className="capitalize">
        <HeartPulse className="size-4 mr-2" />
        {cell.getValue<string>()}
      </Badge>
    ),
    meta: {
      label: "Specialty",
      variant: "multiSelect",
      options: [
        { label: "Cardiology", value: "Cardiology" },
        { label: "Neurology", value: "Neurology" },
        { label: "Pediatrics", value: "Pediatrics" },
        { label: "Orthopedics", value: "Orthopedics" },
        { label: "Dermatology", value: "Dermatology" },
      ],
      icon: HeartPulse,
    },
    enableColumnFilter: true,
  },
  {
    id: "availability",
    accessorKey: "availability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Availability" />
    ),
    cell: ({ row }) => {
      const { days, hours } = row.original.availability;
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-gray-500" />
            <span className="font-medium">{days.join(", ")}</span>
          </div>
          <div className="text-sm text-gray-500 truncate max-w-96">
            {hours.join(" & ")}
          </div>
        </div>
      );
    },
    meta: {
      label: "Availability",
      placeholder: "Filter by days...",
      variant: "multiSelect",
      options: [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
      ],
      icon: Clock,
    },
    enableColumnFilter: true,
    filterFn: (row, _, filterValues: string[]) => {
      if (filterValues.length === 0) return true;
      const availabilityDays = row.original.availability.days;
      return filterValues.some((day) => availabilityDays.includes(day));
    },
  },
  {
    id: "appointmentFee",
    accessorKey: "appointmentFee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fee" />
    ),
    cell: ({ cell }) => {
      const fee = cell.getValue<number>();
      return (
        <div className="flex items-center gap-1">
          <HandCoins className="size-4" />
          <span className="font-medium">{fee}</span>
          <span className="text-gray-500 text-sm">/consult</span>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue();
      const variant = status === "active" ? "default" : "secondary";

      return (
        <Badge variant={variant} className="capitalize">
          {status as string}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "active" },
        { label: "On Leave", value: "on leave" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "appointmentCount",
    accessorKey: "appointmentCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Appointments" />
    ),
    cell: ({ cell }) => {
      const count = cell.getValue<number>();
      return (
        <Badge variant="outline">
          {count} {count === 1 ? "appt" : "appts"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { openDrawer: openDoctorAvailabilityDrawer } =
        useDoctorAvailabilityStore();
      const { onOpen: openUpdateDoctorAvailability } =
        useUpdateDoctorAvailabilityStore();
      const { onOpen: onUpdateDoctorProfile } = useUpdateDoctorStore();
      const { openModal: onDeleteModalOpen } = useDeleteDoctorStore();
      const { getCurrentUser } = useUserSessionStore();
      const currentUser = getCurrentUser();
      const doctorId = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => openDoctorAvailabilityDrawer(doctorId)}
            >
              View Schedule
            </DropdownMenuItem>
            {currentUser?.role === "admin" && (
              <>
                <DropdownMenuItem
                  onClick={() => onUpdateDoctorProfile(row.original)}
                >
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openUpdateDoctorAvailability(row.original)}
                >
                  Update Availability
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteModalOpen(row.original.id)}
                  variant="destructive"
                >
                  Suspend Account
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
