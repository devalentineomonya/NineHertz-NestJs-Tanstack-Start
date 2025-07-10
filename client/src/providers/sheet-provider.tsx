import { AddAdminDrawer } from "@/screens/admin/admin/add-admin-drawer";
import { AddAppointmentDrawer } from "@/screens/admin/appointments/add-appointment-sheet";
import { AddConsultationDrawer } from "@/screens/admin/consultations/add-consultation-sheet";
import { AddDoctorDrawer } from "@/screens/admin/doctors/add-doctor-sheet";
import { AddPatientDrawer } from "@/screens/admin/patients/add-patient-drawer";
import { VewPatientSheet } from "@/screens/admin/patients/vew-patient-sheet";
import { AddUserDrawer } from "@/screens/users/add-user-sheet";
import { EditUserDrawer } from "@/screens/users/update-user-drawer";
import { ViewUserSheet } from "@/screens/users/view-user-sheet";

export const SheetProvider = () => (
  <>
    <AddAppointmentDrawer />
    <ViewUserSheet />
    <AddUserDrawer />
    <AddPatientDrawer />
    <EditUserDrawer />
    <VewPatientSheet />
    <AddAdminDrawer />
    <AddDoctorDrawer />
    <AddConsultationDrawer/>
  </>
);
