"use client";

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
import { Input } from "@/components/ui/input";
import { useDataTable } from "@/hooks/use-data-table";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  Pill,
  FlaskConical,
  Factory,
  Barcode,
  Calendar,
  MoreHorizontal,
  Package,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import * as React from "react";

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  description: string;
  price: number;
  manufacturer: string;
  barcode: string;
  createdAt: Date;
  updatedAt: Date;
}

const data: Medicine[] = [
  {
    id: "med-1",
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    description: "Antibiotic for bacterial infections",
    price: 15.99,
    manufacturer: "PharmaCorp",
    barcode: "123456789012",
    createdAt: new Date(2023, 1, 15),
    updatedAt: new Date(2024, 2, 10),
  },
  {
    id: "med-2",
    name: "Lipitor",
    genericName: "Atorvastatin Calcium",
    description: "Cholesterol-lowering medication",
    price: 42.5,
    manufacturer: "MediHealth",
    barcode: "234567890123",
    createdAt: new Date(2022, 8, 20),
    updatedAt: new Date(2024, 1, 15),
  },
  {
    id: "med-3",
    name: "Ventolin",
    genericName: "Albuterol Sulfate",
    description: "Bronchodilator for asthma",
    price: 28.75,
    manufacturer: "Respira Labs",
    barcode: "345678901234",
    createdAt: new Date(2023, 5, 10),
    updatedAt: new Date(2024, 3, 5),
  },
  {
    id: "med-4",
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    description: "Oral diabetes medicine",
    price: 12.25,
    manufacturer: "DiabetoPharm",
    barcode: "456789012345",
    createdAt: new Date(2022, 11, 5),
    updatedAt: new Date(2023, 10, 22),
  },
  {
    id: "med-5",
    name: "Synthroid",
    genericName: "Levothyroxine Sodium",
    description: "Thyroid hormone replacement",
    price: 24.99,
    manufacturer: "Hormone Solutions",
    barcode: "567890123456",
    createdAt: new Date(2023, 3, 18),
    updatedAt: new Date(2024, 0, 30),
  },
  {
    id: "med-6",
    name: "Advil",
    genericName: "Ibuprofen",
    description: "NSAID for pain and fever",
    price: 8.99,
    manufacturer: "PainFree Inc.",
    barcode: "678901234567",
    createdAt: new Date(2021, 9, 12),
    updatedAt: new Date(2023, 6, 18),
  },
  {
    id: "med-7",
    name: "Zoloft",
    genericName: "Sertraline Hydrochloride",
    description: "Antidepressant SSRI",
    price: 35.2,
    manufacturer: "NeuroPharma",
    barcode: "789012345678",
    createdAt: new Date(2023, 2, 8),
    updatedAt: new Date(2024, 4, 15),
  },
];

export function AdminMedicines() {
  const [name] = useQueryState("name", parseAsString.withDefault(""));
  const [genericName] = useQueryState(
    "genericName",
    parseAsString.withDefault("")
  );
  const [manufacturer] = useQueryState(
    "manufacturer",
    parseAsString.withDefault("")
  );
  const [barcode] = useQueryState("barcode", parseAsString.withDefault(""));
  const [priceRange] = useQueryState(
    "priceRange",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [dateRange] = useQueryState(
    "dateRange",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const filteredData = React.useMemo(() => {
    return data.filter((medicine) => {
      const matchesName =
        name === "" || medicine.name.toLowerCase().includes(name.toLowerCase());
      const matchesGenericName =
        genericName === "" ||
        medicine.genericName.toLowerCase().includes(genericName.toLowerCase());
      const matchesManufacturer =
        manufacturer === "" ||
        medicine.manufacturer.toLowerCase().includes(manufacturer.toLowerCase());
      const matchesBarcode =
        barcode === "" || medicine.barcode.includes(barcode);

      // Price range filtering
      const minPrice = priceRange[0] ? parseFloat(priceRange[0]) : 0;
      const maxPrice = priceRange[1] ? parseFloat(priceRange[1]) : Infinity;
      const matchesPriceRange = medicine.price >= minPrice && medicine.price <= maxPrice;

      // Date filtering (simplified)
      const matchesDateRange = dateRange.length === 0 || true;

      return (
        matchesName &&
        matchesGenericName &&
        matchesManufacturer &&
        matchesBarcode &&
        matchesPriceRange &&
        matchesDateRange
      );
    });
  }, [name, genericName, manufacturer, barcode, priceRange, dateRange]);

  const columns = React.useMemo<ColumnDef<Medicine>[]>(
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
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Medicine" />
        ),
        cell: ({ cell, row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Pill className="size-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{cell.getValue<string>()}</div>
              <div className="text-sm text-gray-500">
                {row.original.genericName}
              </div>
            </div>
          </div>
        ),
        meta: {
          label: "Name",
          placeholder: "Search medicines...",
          variant: "text",
          icon: FlaskConical,
        },
        enableColumnFilter: true,
      },
      {
        id: "manufacturer",
        accessorKey: "manufacturer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Manufacturer" />
        ),
        cell: ({ cell }) => (
          <div className="flex items-center gap-2">
            <Factory className="size-4 text-gray-500" />
            <span>{cell.getValue<string>()}</span>
          </div>
        ),
        meta: {
          label: "Manufacturer",
          placeholder: "Search manufacturers...",
          variant: "text",
          icon: Factory,
        },
        enableColumnFilter: true,
      },
      {
        id: "barcode",
        accessorKey: "barcode",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Barcode" />
        ),
        cell: ({ cell }) => (
          <div className="flex items-center gap-2">
            <Barcode className="size-4 text-gray-500" />
            <code className="font-mono">{cell.getValue<string>()}</code>
          </div>
        ),
        meta: {
          label: "Barcode",
          placeholder: "Search barcodes...",
          variant: "text",
          icon: Barcode,
        },
        enableColumnFilter: true,
      },
      {
        id: "price",
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ cell }) => {
          const price = cell.getValue<number>();
          return (
            <div className="flex items-center gap-2 font-medium">
              <DollarSign className="size-4 text-gray-500" />
              {price.toFixed(2)}
            </div>
          );
        },
        meta: {
          label: "Price",
          variant: "range",
          icon: DollarSign,
        },
        enableColumnFilter: true,
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ cell }) => (
          <div className="text-sm text-gray-600 max-w-[200px] truncate">
            {cell.getValue<string>()}
          </div>
        ),
        meta: {
          label: "Description",
          placeholder: "Search descriptions...",
          variant: "text",
          icon: ClipboardList,
        },
        enableColumnFilter: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Added" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="size-4 text-gray-500" />
              {date.toLocaleDateString()}
            </div>
          );
        },
        meta: {
          label: "Created At",
          variant: "date",
          icon: Calendar,
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
                <DropdownMenuItem>Edit Medicine</DropdownMenuItem>
                <DropdownMenuItem>Manage Inventory</DropdownMenuItem>
                <DropdownMenuItem>View Orders</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Archive Medicine
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
    data: filteredData,
    columns,
    pageCount: Math.ceil(filteredData.length / 10),
    initialState: {
      sorting: [{ id: "name", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  // Custom toolbar with additional inputs
  const CustomToolbar = () => (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <Input
            placeholder="Medicine name..."
            value={name}
            onChange={(e) => useQueryState("name").set(e.target.value)}
            className="pl-10 w-48"
          />
        </div>

        <div className="relative">
          <Factory className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <Input
            placeholder="Manufacturer..."
            value={manufacturer}
            onChange={(e) => useQueryState("manufacturer").set(e.target.value)}
            className="pl-10 w-48"
          />
        </div>

        <div className="relative">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <Input
            placeholder="Barcode..."
            value={barcode}
            onChange={(e) => useQueryState("barcode").set(e.target.value)}
            className="pl-10 w-48"
          />
        </div>
      </div>

      <DataTableToolbar
        table={table}
        filters={["price", "description", "createdAt"]}
      />
    </div>
  );

  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <CustomToolbar />
      </DataTable>
    </div>
  );
}
