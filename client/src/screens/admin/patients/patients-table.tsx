import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { useAddPatientStore } from "@/stores/use-add-patient-store";
import { PlusSquare } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsInteger,
  useQueryState,
} from "nuqs";
import * as React from "react";
import { DeletePatientConfirmModal } from "./delete-patient-confirm";
import { patientColumns } from "./patient-table-columns";
import { useUserSessionStore } from "@/stores/user-session-store";
import {
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { PatientStatsCards } from "./patient-statistics";

export function PatientsTable() {
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  const { onOpen: onPatientDrawerOpen } = useAddPatientStore();

  // URL state management for persistence
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));
  const [globalFilter] = useQueryState("search", parseAsString.withDefault(""));

  // Table state management
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "fullName", desc: false },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: pageSize,
  });

  // Sync URL state with table state
  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: pageSize,
    });
  }, [page, pageSize]);

  // Fetch data (modify this if your API supports server-side operations)
  const { data: patients = [], isLoading, error } = useGetPatients();

  // Client-side filtering (remove if using server-side filtering)
  const filteredPatients = React.useMemo(() => {
    let filtered = [...patients];

    // Apply global filter
    if (globalFilter) {
      filtered = filtered.filter((patient) =>
        Object.values(patient).some((value) =>
          String(value).toLowerCase().includes(globalFilter.toLowerCase())
        )
      );
    }

    // Apply column filters
    columnFilters.forEach((filter) => {
      const { id, value } = filter;

      if (!value) return;

      filtered = filtered.filter((patient) => {
        const columnValue = patient[id as keyof typeof patient];

        if (Array.isArray(value)) {
          // Multi-select filter
          return value.includes(String(columnValue));
        } else if (typeof value === "string") {
          // Text filter
          return String(columnValue)
            .toLowerCase()
            .includes(value.toLowerCase());
        } else if (Array.isArray(value) && value.length === 2) {
          // Date range filter
          const [start, end] = value;
          const itemDate = new Date(String(columnValue));
          return itemDate >= new Date(start) && itemDate <= new Date(end);
        }

        return true;
      });
    });

    return filtered;
  }, [patients, globalFilter, columnFilters]);

  const { table } = useDataTable({
    data: filteredPatients,
    columns: patientColumns,

    // Pagination configuration
    pageCount: Math.ceil(filteredPatients.length / pagination.pageSize),

    // State change handlers
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,

    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableRowSelection: true,

    // Initial state
    initialState: {
      sorting: [{ id: "fullName", desc: false }],
      columnPinning: { right: ["actions"] },
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },

    // Row identification
    getRowId: (row) => row.id,

    // Debug (remove in production)
    debugTable: process.env.NODE_ENV === "development",
  });

  // Handle loading state
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

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load patients</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
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
      {!isLoading && !error && (
        <PatientStatsCards patients={patients} isLoading={isLoading} />
      )}

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

      <DeletePatientConfirmModal />
    </div>
  );
}
