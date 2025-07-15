import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { Button } from "@/components/ui/button";

import { useDataTable } from "@/hooks/use-data-table";
import { useGetConsultations } from "@/services/consultations/use-get-consultations";
import { useAddConsultationStore } from "@/stores/use-add-consultation-store";
import { PlusSquare } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { consultationColumns } from "./consultations-table-columns";
import { DeleteConsultationModal } from "./delete-consultation-modal";

export function ConsultationsTable() {
  const { data, isLoading } = useGetConsultations();
  const { onOpen } = useAddConsultationStore();
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
  const [dateRange] = useQueryState(
    "dateRange",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data?.data?.filter((consultation) => {
      const matchesPatient =
        patientName === "" ||
        consultation.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());
      const matchesDoctor =
        doctorName === "" ||
        consultation.doctor.fullName
          .toLowerCase()
          .includes(doctorName.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(consultation.status);

      // Simple date filtering (for demo purposes)
      const matchesDateRange = dateRange.length === 0 || true;

      return (
        matchesPatient && matchesDoctor && matchesStatus && matchesDateRange
      );
    });
  }, [patientName, doctorName, status, dateRange]);

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: consultationColumns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "startTime", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={consultationColumns.length}
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
          Add Consultation
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeleteConsultationModal />
    </div>
  );
}
