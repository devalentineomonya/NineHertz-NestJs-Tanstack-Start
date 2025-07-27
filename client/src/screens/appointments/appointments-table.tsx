import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetAppointments } from "@/services/appointments/use-get-appointments";
import { useAddAppointmentStore } from "@/stores/use-add-appointment-store";
import { Plus } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { appointmentColumns } from "./appointment-table-columns";
import { MarkAsCompleteModal } from "./mark-as-complete";
import { SendReminderModal } from "./send-reminder-modal";

export function AppointmentsTable() {
  const { data, isLoading } = useGetAppointments();
  const { onOpen } = useAddAppointmentStore();
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
    return data?.data.filter((appointment) => {
      const matchesPatient =
        patientName === "" ||
        appointment.patient.fullName
          .toLowerCase()
          .includes(patientName.toLowerCase());
      const matchesDoctor =
        doctorName === "" ||
        appointment.doctor.fullName
          .toLowerCase()
          .includes(doctorName.toLowerCase());
      const matchesStatus =
        status.length === 0 || status.includes(appointment.status);

      // Simple date filtering (for demo purposes)
      const matchesDateRange = dateRange.length === 0 || true;

      return (
        matchesPatient && matchesDoctor && matchesStatus && matchesDateRange
      );
    });
  }, [patientName, doctorName, status, dateRange]);

  const { table } = useDataTable({
    data: filteredData ?? [],
    columns: appointmentColumns,
    pageCount: Math.ceil((filteredData?.length || 10) / 10),
    initialState: {
      sorting: [{ id: "datetime", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSkeleton
          columnCount={appointmentColumns.length}
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
      <div className="my-4">
        <Button variant={"primary"} className="max-w-56" onClick={onOpen}>
          <Plus />
          Create Appointment
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <SendReminderModal />
      <MarkAsCompleteModal />
    </div>
  );
}
