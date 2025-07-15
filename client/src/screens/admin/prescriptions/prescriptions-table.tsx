import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetPrescriptions } from "@/services/prescriptions/use-get-prescriptions";
import { useAddPrescriptionStore } from "@/stores/use-add-prescription-store";
import { PlusSquare } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { DeletePrescriptionModal } from "./delete-prescription-modal";
import { FulfillPrescriptionModal } from "./fulfill-prescription-modal";
import { prescriptionColumns } from "./prescriptions-table-columns";

export function PrescriptionsTable() {
  const { onOpen } = useAddPrescriptionStore();
  const { data, isLoading } = useGetPrescriptions();
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

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: prescriptionColumns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "issueDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={prescriptionColumns.length}
          rowCount={10}
          filterCount={5}
          optionsCount={2}
          withViewOptions={true}
          withPagination={true}
          cellWidths={[
            "40px",
            "120px",
            "200px",
            "180px",
            "180px",
            "120px",
            "100px",
            "140px",
            "140px",
            "40px",
          ]}
        />
      </div>
    );
  }
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
      <DeletePrescriptionModal />
      <FulfillPrescriptionModal />
    </div>
  );
}
