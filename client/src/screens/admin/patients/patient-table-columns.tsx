import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeletePatientStore } from "@/stores/use-delete-patient";
import { useEditPatientStore } from "@/stores/use-edit-patient-store";
import { useViewPatientStore } from "@/stores/use-view-patient-store";
import { useUserSessionStore } from "@/stores/user-session-store";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Phone,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const calculateAge = (dob: string | null | Date): string => {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return `${age} years`;
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export const patientColumns: ColumnDef<PatientResponseDto>[] = [
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
    id: "fullName",
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient" />
    ),
    cell: ({ row }) => {
      const patient = row.original;
      const initials = patient.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <motion.div
          className="flex items-center gap-3"
          custom={row.index}
          variants={rowVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="w-10 h-10 rounded-md ring-2 ring-white shadow-lg">
              <AvatarImage
                src={`https://avatar.vercel.sh/${
                  patient.id
                }.png?name=${encodeURIComponent(patient.fullName)}`}
                alt={patient.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div>
            <div className="font-medium text-gray-800 dark:text-white">
              {patient.fullName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {calculateAge(patient.dateOfBirth)}
            </div>
          </div>
        </motion.div>
      );
    },
    meta: {
      label: "Patient",
      placeholder: "Search patients...",
      variant: "text",
      icon: User,
    },
    enableColumnFilter: true,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ cell }) => (
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Phone className="size-4 text-blue-500" />
        <span className="font-mono">{cell.getValue<string>()}</span>
      </motion.div>
    ),
    meta: {
      label: "Phone",
      placeholder: "Search phones...",
      variant: "text",
      icon: Phone,
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue();
      const Icon = status === "active" ? CheckCircle : XCircle;

      return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Badge
            className={`capitalize gap-2 ${
              status === "active"
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20"
            }`}
          >
            <Icon className="size-4" />
            {status as string}
          </Badge>
        </motion.div>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "active", icon: CheckCircle },
        { label: "Inactive", value: "inactive", icon: XCircle },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "dateOfBirth",
    accessorKey: "dateOfBirth",
    accessorFn: (row) =>
      row.dateOfBirth ? new Date(row.dateOfBirth).getTime() : null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      const dob = row.original.dateOfBirth;
      return (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Calendar className="size-4 text-amber-500" />
          <span className="text-gray-700 dark:text-gray-300">
            {dob ? new Date(dob).toLocaleDateString() : "N/A"}
          </span>
        </motion.div>
      );
    },
    enableColumnFilter: false,
  },
  {
    id: "medicalHistory",
    accessorKey: "medicalHistory",
    accessorFn: (row) => row.appointments?.length || 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medical History" />
    ),
    cell: ({ row }) => {
      const count = row.original.medicalHistory?.allergies?.length ?? 0;
      return (
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.1 }}
        >
          <Stethoscope className="size-4 text-violet-500" />
          <motion.span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            animate={{
              background: [
                "linear-gradient(45deg, #8b5cf6, #ec4899)",
                "linear-gradient(45deg, #ec4899, #8b5cf6)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {count}
          </motion.span>
        </motion.div>
      );
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: function Cell({ cell }) {
      const { onOpen: onViewPatientOpen } = useViewPatientStore();
      const { onOpen: onEditPatientOpen } = useEditPatientStore();
      const { openModal: onDeletePatientModalOpen } = useDeletePatientStore();
      const { getCurrentUser } = useUserSessionStore();
      const currentUser = getCurrentUser();
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                <DropdownMenuItem asChild>
                  <motion.div
                    variants={{
                      hidden: { x: -10, opacity: 0 },
                      visible: { x: 0, opacity: 1 },
                    }}
                    className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() =>
                      onViewPatientOpen(cell.row.original.id, cell.row.original)
                    }
                  >
                    View Details
                  </motion.div>
                </DropdownMenuItem>
                {currentUser?.role === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <motion.div
                        variants={{
                          hidden: { x: -10, opacity: 0 },
                          visible: { x: 0, opacity: 1 },
                        }}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() =>
                          onEditPatientOpen(
                            cell.row.original.id,
                            cell.row.original
                          )
                        }
                      >
                        Edit Patient
                      </motion.div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <motion.div
                        variants={{
                          hidden: { x: -10, opacity: 0 },
                          visible: { x: 0, opacity: 1 },
                        }}
                        className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-500 cursor-pointer"
                        onClick={() =>
                          onDeletePatientModalOpen(cell.row.original.id)
                        }
                      >
                        Delete
                      </motion.div>
                    </DropdownMenuItem>
                  </>
                )}
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      );
    },
    size: 32,
  },
];
