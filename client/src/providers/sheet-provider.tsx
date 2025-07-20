import { AddAdminDrawer } from "@/screens/admin/admin/add-admin-drawer";
import { AddDoctorDrawer } from "@/screens/admin/doctors/add-doctor-sheet";
import { DoctorAvailabilityDrawer } from "@/screens/admin/doctors/doctor-availability";
import { UpdateDoctorDrawer } from "@/screens/admin/doctors/update-doctor-sheet";
import { UpdateDoctorAvailabilityDrawer } from "@/screens/admin/doctors/update-time-slots";
import { AddPatientDrawer } from "@/screens/admin/patients/add-patient-drawer";
import { UpdatePatientDrawer } from "@/screens/admin/patients/edit-patient-drawer";
import { VewPatientSheet } from "@/screens/admin/patients/vew-patient-sheet";
import { AddPharmacistDrawer } from "@/screens/admin/pharmacist/add-pharmacist-sheet";
import { UpdatePharmacistDrawer } from "@/screens/admin/pharmacist/update-pharmacist-drawer";
import { ViewPharmacistDrawer } from "@/screens/admin/pharmacist/view-pharmacist-sheet";
import { AddPrescriptionDrawer } from "@/screens/admin/prescriptions/add-prescriptions-drawer";
import { EditPrescriptionDrawer } from "@/screens/admin/prescriptions/edit-prescription-sheet";
import { ViewPrescriptionDrawer } from "@/screens/admin/prescriptions/view-prescription-drawer";
import { AddAppointmentDrawer } from "@/screens/appointments/add-appointment-sheet";
import { RescheduleDrawer } from "@/screens/appointments/reschedule-appointment-drawer";
import { ViewAppointmentDrawer } from "@/screens/appointments/view-appointment-sheet";
import { AddConsultationDrawer } from "@/screens/consultations/add-consultation-sheet";
import { ViewConsultationDrawer } from "@/screens/consultations/view-consultation-sheet";
import { AddMedicineDrawer } from "@/screens/medicine/add-medicine-sheet";
import { EditMedicineDrawer } from "@/screens/medicine/edit-medicine-drawer";
import { ViewMedicineDrawer } from "@/screens/medicine/view-medicine-drawer";
import { AddOrderDrawer } from "@/screens/order/add-order-drawer";
import { EditOrderDrawer } from "@/screens/order/edit-order-drawer";
import { ViewOrderDrawer } from "@/screens/order/view-order-drawer";
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

    <AddConsultationDrawer />
    <ViewConsultationDrawer />

    <AddPrescriptionDrawer />
    <ViewPrescriptionDrawer />
    <EditPrescriptionDrawer />

    <AddMedicineDrawer />
    <EditMedicineDrawer />
    <ViewMedicineDrawer />

    <AddOrderDrawer />
    <EditOrderDrawer />
    <ViewOrderDrawer />

    <AddAdminDrawer />
  </>
);
