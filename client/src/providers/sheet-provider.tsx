import { AddAdminDrawer } from "@/screens/admin/admin/add-admin-drawer";
import { AddAppointmentDrawer } from "@/screens/admin/appointments/add-appointment-sheet";
import { RescheduleDrawer } from "@/screens/admin/appointments/reschedule-appointment-drawer";
import { ViewAppointmentDrawer } from "@/screens/admin/appointments/view-appointment-sheet";
import { AddConsultationDrawer } from "@/screens/admin/consultations/add-consultation-sheet";
import { AddDoctorDrawer } from "@/screens/admin/doctors/add-doctor-sheet";
import { DoctorAvailabilityDrawer } from "@/screens/admin/doctors/doctor-availability";
import { UpdateDoctorDrawer } from "@/screens/admin/doctors/update-doctor-sheet";
import { UpdateDoctorAvailabilityDrawer } from "@/screens/admin/doctors/update-time-slots";
import { AddMedicineDrawer } from "@/screens/admin/medicine/add-medicine-sheet";
import { AddOrderDrawer } from "@/screens/admin/order/add-order-drawer";
import { AddPatientDrawer } from "@/screens/admin/patients/add-patient-drawer";
import { UpdatePatientDrawer } from "@/screens/admin/patients/edit-patient-drawer";
import { VewPatientSheet } from "@/screens/admin/patients/vew-patient-sheet";
import { AddPharmacistDrawer } from "@/screens/admin/pharmacist/add-pharmacist-sheet";
import { UpdatePharmacistDrawer } from "@/screens/admin/pharmacist/update-pharmacist-drawer";
import { ViewPharmacistDrawer } from "@/screens/admin/pharmacist/view-pharmacist-sheet";
import { AddPharmacyDrawer } from "@/screens/admin/pharmacy/add-pharmacy-sheet";
import { AddPrescriptionDrawer } from "@/screens/admin/prescriptions/add-prescriptions-drawer";
import { AddUserDrawer } from "@/screens/users/add-user-sheet";
import { EditUserDrawer } from "@/screens/users/update-user-drawer";
import { ViewUserSheet } from "@/screens/users/view-user-sheet";

export const SheetProvider = () => (
  <>
    <AddUserDrawer />
    <ViewUserSheet />
    <EditUserDrawer />

    <AddPatientDrawer />
    <UpdatePatientDrawer />
    <VewPatientSheet />

    <AddDoctorDrawer />
    <DoctorAvailabilityDrawer />
    <UpdateDoctorAvailabilityDrawer />
    <UpdateDoctorDrawer />

    <AddPharmacistDrawer />
    <UpdatePharmacistDrawer />
    <ViewPharmacistDrawer />

    <AddAppointmentDrawer />
    <ViewAppointmentDrawer />
    <RescheduleDrawer />

    <AddAdminDrawer />
    <AddConsultationDrawer />
    <AddPrescriptionDrawer />
    <AddPharmacyDrawer />
    <AddMedicineDrawer />
    <AddOrderDrawer />
  </>
);
