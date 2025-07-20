import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDataTable } from "@/hooks/use-data-table";
import { userColumns } from "@/screens/users/users-table-columns";
import { useGetPharmacists } from "@/services/pharmacists/use-get-pharmacists";
import { useAddPharmacistStore } from "@/stores/use-add-pharmacist-store";
import { PlusSquare } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import * as React from "react";
import { pharmacistColumns } from "./pharmacist-table-columns";
import { DeletePharmacistConfirmModal } from "./delete-pharmacist-modal";

export function AdminPharmacist() {
  const { onOpen } = useAddPharmacistStore();
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [email] = useQueryState("email", parseAsString.withDefault(""));
  const [role] = useQueryState(
    "role",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [verified] = useQueryState(
    "verified",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const { data: users, isLoading } = useGetPharmacists();

  const filteredData = React.useMemo(() => {
    return users?.filter((user) => {
      const matchesEmail =
        email === "" ||
        user.user.email.toLowerCase().includes(email.toLowerCase());

      const matchesRole = role.length === 0 || role.includes(user.user.role);

      const matchesVerified =
        verified.length === 0 ||
        (verified.includes("verified") && user.user.isEmailVerified) ||
        (verified.includes("unverified") && !user.user.isEmailVerified);

      return matchesEmail && matchesRole && matchesVerified;
    });
  }, [email, role, verified]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredData?.slice(start, start + perPage) || [];
  }, [filteredData, page, perPage]);

  const pageCount = Math.ceil((filteredData?.length || 0) / perPage);

  const { table } = useDataTable({
    data: paginatedData ?? [],
    columns: pharmacistColumns,
    pageCount,
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
          columnCount={userColumns.length}
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
          Add Pharmacist
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <DeletePharmacistConfirmModal />
    </div>
  );
}
