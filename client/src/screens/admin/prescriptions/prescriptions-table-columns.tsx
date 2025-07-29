import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeletePrescriptionStore } from "@/stores/use-delete-prescription-store";
import { useEditPrescriptionStore } from "@/stores/use-edit-prescription-store";
import { useFulfillPrescriptionStore } from "@/stores/use-fulfill-prescription-store";
import { useViewPrescriptionStore } from "@/stores/use-view-prescription-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import type { ColumnDef } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import {
  Pill,
  Calendar,
  User,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ClipboardList,
} from "lucide-react";

export const prescriptionColumns: ColumnDef<PrescriptionResponseDto>[] = [
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
    id: "items",
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ cell }) => {
      const details = cell.getValue<PrescriptionResponseDto["items"]>();
      return (
        <div className="flex items-center gap-3">
          <Pill className="size-5 text-blue-500" />
          <div className="max-w-[300px] truncate font-medium">
            {details.length} Item {details.length > 1 && "s"} :
            {details.map((item) => item.medicineId.split("-")[0]).join(", ")}
          </div>
        </div>
      );
    },
    meta: {
      label: "Medication",
      placeholder: "Search medications...",
      variant: "text",
      icon: ClipboardList,
    },
    enableColumnFilter: true,
  },
  {
    id: "patient",
    accessorFn: (row) => row.patient.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
        <div className="font-medium">{row.original.patient.fullName}</div>
      </div>
    ),
    meta: {
      label: "Patient",
      placeholder: "Search patients...",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
  },
  {
    id: "doctor",
    accessorFn: (row) => row.prescribedBy.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prescribed By" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
        <div>
          <div className="font-medium">
            {row.original.prescribedBy.fullName}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.prescribedBy.specialty}
          </div>
        </div>
      </div>
    ),
    meta: {
      label: "Doctor",
      placeholder: "Search doctors...",
      variant: "text",
      icon: Stethoscope,
    },
    enableColumnFilter: true,
  },
  {
    id: "dates",
    header: "Dates",
    cell: ({ row }) => {
      const { issueDate, expiryDate } = row.original;
      const today = new Date();
      const daysRemaining = differenceInDays(new Date(expiryDate), today);
      const isExpired = daysRemaining <= 0;

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-500" />
            <span className="font-medium">
              {format(new Date(issueDate), "do MMM yyyy")}
            </span>
            <span className="text-gray-400">to</span>
            <span className={isExpired ? "text-red-500 font-medium" : ""}>
              {format(new Date(expiryDate), "do MMM yyyy")}
            </span>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {isExpired
              ? "Expired"
              : `${daysRemaining} day${
                  daysRemaining === 1 ? "" : "s"
                } remaining`}
          </div>
        </div>
      );
    },
  },

  {
    id: "status",
    accessorKey: "isFulfilled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const isFulfilled = cell.getValue<boolean>();

      return (
        <Badge
          variant={isFulfilled ? "default" : "warning"}
          className="capitalize gap-2"
        >
          {isFulfilled ? (
            <CheckCircle className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {isFulfilled ? "Fulfilled" : "Pending"}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        {
          label: "Fulfilled",
          value: "fulfilled",
          icon: CheckCircle,
        },
        {
          label: "Pending",
          value: "pending",
          icon: AlertCircle,
        },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const { onOpen: onViewPrescription } = useViewPrescriptionStore();
      const { onOpen: onEditPrescription } = useEditPrescriptionStore();
      const { onOpen: onFulfillPrescription } = useFulfillPrescriptionStore();
      const { onOpen: onDeletePrescription } = useDeletePrescriptionStore();
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
              onClick={() => onViewPrescription(row.original.id, row.original)}
            >
              View Details
            </DropdownMenuItem>
            {currentUser?.role !== "patient" && (
              <>
                {!row.original.isFulfilled &&
                  (currentUser?.role === "pharmacist" ||
                    currentUser?.role === "admin") && (
                    <DropdownMenuItem
                      onClick={() => onFulfillPrescription(row.original.id)}
                    >
                      Mark as Fulfilled
                    </DropdownMenuItem>
                  )}
                {currentUser?.role !== "pharmacist" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onEditPrescription(row.original.id)}
                    >
                      Edit Prescription
                    </DropdownMenuItem>
                    {(currentUser?.role === "admin" ||
                      currentUser?.role === "doctor") && (
                      <DropdownMenuItem
                        onClick={() => onDeletePrescription(row.original.id)}
                        variant="destructive"
                      >
                        Void Prescription
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];
