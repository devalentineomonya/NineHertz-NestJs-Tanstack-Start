import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeletePatientStore } from "@/stores/use-delete-patient";
import { useEditPatientStore } from "@/stores/use-edit-patient-store";
import { useViewPatientStore } from "@/stores/use-view-patient-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Phone,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";

const calculateAge = (dob: string | null | Date): string => {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return `${age} years`;
};

export const patientColumns: ColumnDef<PatientResponseDto>[] = [
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
      <DataTableColumnHeader column={column} title="Patient" />
    ),
    cell: ({ row }) => {
      const patient = row.original;
      // Generate initials for avatar fallback
      const initials = patient.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-md">
            <AvatarImage
              src={`https://avatar.vercel.sh/${
                patient.id
              }.png?name=${encodeURIComponent(patient.fullName)}`}
              alt={patient.fullName}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{patient.fullName}</div>
            <div className="text-sm text-gray-500">
              {calculateAge(patient.dateOfBirth)}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      label: "Patient",
      placeholder: "Search patients...",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ cell }) => (
      <div className="flex items-center gap-2">
        <Phone className="size-4 text-gray-500" />
        {cell.getValue<string>()}
      </div>
    ),
    meta: {
      label: "Phone",
      placeholder: "Search phones...",
      variant: "text",
      icon: Phone,
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
      const Icon = status === "active" ? CheckCircle : XCircle;
      const variant = status === "active" ? "default" : "secondary";

      return (
        <Badge variant={variant} className="capitalize gap-2">
          <Icon className="size-4" />
          {status as string}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "active", icon: CheckCircle },
        { label: "Inactive", value: "inactive", icon: XCircle },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "dateOfBirth",
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ cell }) => {
      const dob = cell.getValue<Date | null>();
      return (
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-gray-500" />
          {dob ? new Date(dob).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    id: "appointments",
    accessorKey: "appointments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Appointments" />
    ),
    cell: ({ cell }) => {
      const appointments = cell.getValue<AppointmentResponseDto[]>();
      const count = appointments?.length || 0;
      return (
        <div className="flex items-center gap-2">
          <Stethoscope className="size-4 text-gray-500" />
          <span>{count}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: function Cell({ cell }) {
      const { onOpen: onViewPatientOpen } = useViewPatientStore();
      const { onOpen: onEditPatientOpen } = useEditPatientStore();
      const { openModal: onDeletePatientModalOpen } = useDeletePatientStore();
      const { getCurrentUser } = useUserSessionStore();
      const currentUser = getCurrentUser();
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
              onClick={() =>
                onViewPatientOpen(cell.row.original.id, cell.row.original)
              }
            >
              View Details
            </DropdownMenuItem>
            {currentUser?.role === "admin" && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    onEditPatientOpen(cell.row.original.id, cell.row.original)
                  }
                >
                  Edit Patient
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeletePatientModalOpen(cell.row.original.id)}
                  variant="destructive"
                >
                  Delete
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
