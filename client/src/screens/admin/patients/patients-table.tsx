import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useAddPatientStore } from "@/stores/use-add-patient-store";
import { PlusSquare } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { DeletePatientConfirmModal } from "./delete-patient-confirm";
import { patientColumns } from "./patient-table-columns";
import { useUserSessionStore } from "@/stores/user-session-store";

export function PatientsTable() {
  const { data: patients, isLoading } = useGetPatients();
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  const { onOpen: onPatientDrawerOpen } = useAddPatientStore();
  const [fullName] = useQueryState("fullName", parseAsString.withDefault(""));
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return patients?.filter((patient) => {
      const matchesName =
        fullName === "" ||
        patient.fullName.toLowerCase().includes(fullName.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(patient.status);

      return matchesName && matchesStatus;
    });
  }, [patients, fullName, status]);

  const { table } = useDataTable({
    data: filteredData || [],
    columns: patientColumns,
    pageCount: Math.ceil((filteredData?.length || 0) / 10),
    initialState: {
      sorting: [{ id: "fullName", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={patientColumns.length}
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
      {currentUser?.role === "admin" && (
        <div className="w-fit min-w-56 mb-2">
          <Button variant={"primary"} onClick={onPatientDrawerOpen}>
            <PlusSquare />
            Add Patient
          </Button>
        </div>
      )}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeletePatientConfirmModal />
    </div>
  );
}
