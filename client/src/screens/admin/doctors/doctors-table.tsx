import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetDoctors } from "@/services/doctors/use-get-doctors";
import { useAddDoctorStore } from "@/stores/use-add-doctor-store";
import { PlusSquare } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { doctorColumns } from "./doctor-table-columns";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DeleteDoctorConfirmModal } from "./delete-doctor-confimation-modal";

export function AdminDoctors() {
  const { onOpen } = useAddDoctorStore();
  const { data, isLoading } = useGetDoctors();
  const [fullName] = useQueryState("fullName", parseAsString.withDefault(""));
  const [specialty] = useQueryState(
    "specialty",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data?.data.filter((doctor) => {
      const matchesName =
        fullName === "" ||
        doctor.fullName.toLowerCase().includes(fullName.toLowerCase());
      const matchesSpecialty =
        specialty.length === 0 || specialty.includes(doctor.specialty);
      const matchesStatus =
        status.length === 0 || status.includes(doctor.status);

      return matchesName && matchesSpecialty && matchesStatus;
    });
  }, [fullName, specialty, status]);

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: doctorColumns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={doctorColumns.length}
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
          Add Doctor
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeleteDoctorConfirmModal />
    </div>
  );
}
