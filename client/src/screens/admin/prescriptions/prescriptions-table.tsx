import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetPrescription } from "@/services/prescriptions/use-get-prescription";
import { useAddPrescriptionStore } from "@/stores/use-add-prescription-store";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { differenceInDays, format, formatDistanceStrict } from "date-fns";
import {
  Pill,
  Calendar,
  User,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ClipboardList,
  PlusSquare,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

export function AdminPrescriptions() {
  const { onOpen } = useAddPrescriptionStore();
  const { data, isLoading } = useGetPrescription();
  const [patientName] = useQueryState(
    "patientName",
    parseAsString.withDefault("")
  );
  const [doctorName] = useQueryState(
    "doctorName",
    parseAsString.withDefault("")
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [issueDateRange] = useQueryState(
    "issueDate",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [expiryDateRange] = useQueryState(
    "expiryDate",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data?.filter((prescription) => {
      const matchesPatient =
        patientName === "" ||
        prescription.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());

      const matchesDoctor =
        doctorName === "" ||
        prescription.prescribedBy.fullName
          .toLowerCase()
          .includes(doctorName.toLowerCase());

      const matchesStatus =
        status.length === 0 ||
        (status.includes("fulfilled") && prescription.isFulfilled) ||
        (status.includes("pending") && !prescription.isFulfilled);

      // Date filtering
      const matchesIssueDate = issueDateRange.length < 2 || true;
      const matchesExpiryDate = expiryDateRange.length < 2 || true;

      return (
        matchesPatient &&
        matchesDoctor &&
        matchesStatus &&
        matchesIssueDate &&
        matchesExpiryDate
      );
    });
  }, [patientName, doctorName, status, issueDateRange, expiryDateRange]);

  const columns = React.useMemo<ColumnDef<PrescriptionResponseDto>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        id: "medication",
        accessorKey: "medicationDetails",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Medication" />
        ),
        cell: ({ cell }) => {
          const details = cell.getValue<string>();
          return (
            <div className="flex items-center gap-3">
              <Pill className="size-5 text-blue-500" />
              <div className="max-w-[300px] truncate font-medium">
                {details}
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
          const isExpired =
            Math.max(
              0,
              differenceInDays(today, new Date(Date.parse(expiryDate)))
            ) === 0;

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-500" />
                <span className="font-medium">
                  {format(issueDate, "do MMM yyyy")}
                </span>
                <span className="text-gray-400">to</span>
                <span className={isExpired ? "text-red-500 font-medium" : ""}>
                  {format(issueDate, "do MMM yyyy")}
                </span>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {Math.max(
                  0,
                  differenceInDays(today, new Date(Date.parse(expiryDate)))
                )}{" "}
                days remaining
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
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Prescription</DropdownMenuItem>
                {!row.original.isFulfilled && (
                  <DropdownMenuItem>Mark as Fulfilled</DropdownMenuItem>
                )}
                <DropdownMenuItem>Renew Prescription</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Void Prescription
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "issueDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="data-table-container">
      <div className="w-fit min-w-56 mb-2">
        <Button variant={"primary"} onClick={onOpen}>
          <PlusSquare />
          Add Prescription
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
