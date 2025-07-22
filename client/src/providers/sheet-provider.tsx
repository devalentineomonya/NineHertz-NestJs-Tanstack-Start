import { AddAdminDrawer } from "@/screens/admin/admin/add-admin-drawer";
import { AddDoctorDrawer } from "@/screens/admin/doctors/add-doctor-sheet";
import { DoctorAvailabilityDrawer } from "@/screens/admin/doctors/doctor-availability";
import { UpdateDoctorDrawer } from "@/screens/admin/doctors/update-doctor-sheet";
import { UpdateDoctorAvailabilityDrawer } from "@/screens/admin/doctors/update-time-slots";
import { AddPatientDrawer } from "@/screens/admin/patients/add-patient-drawer";
import { UpdatePatientDrawer } from "@/screens/admin/patients/edit-patient-drawer";
import { VewPatientSheet } from "@/screens/admin/patients/view-patient-sheet";
import { AddPharmacistDrawer } from "@/screens/admin/pharmacist/add-pharmacist-sheet";
import { UpdatePharmacistDrawer } from "@/screens/admin/pharmacist/update-pharmacist-drawer";
import { ViewPharmacistDrawer } from "@/screens/admin/pharmacist/view-pharmacist-sheet";
import { AddPrescriptionDrawer } from "@/screens/admin/prescriptions/add-prescriptions-drawer";
import { EditPrescriptionDrawer } from "@/screens/admin/prescriptions/edit-prescription-sheet";
import { ViewPrescriptionDrawer } from "@/screens/admin/prescriptions/view-prescription-drawer";
import { AddAppointmentDrawer } from "@/screens/appointments/add-appointment-sheet";
import { EditAppointmentDrawer } from "@/screens/appointments/edit-appointment";
import { RescheduleDrawer } from "@/screens/appointments/reschedule-appointment-drawer";
import { ViewAppointmentDrawer } from "@/screens/appointments/view-appointment-sheet";
import { AdjustQuantity } from "@/screens/inventory/adjust-quantity-drawer";
import { ReorderItemDrawer } from "@/screens/inventory/reorder-items-drawer";
import { ViewInventoryDrawer } from "@/screens/inventory/view-inentory-drawer";
import { AddMedicineDrawer } from "@/screens/medicine/add-medicine-sheet";
import { EditMedicineDrawer } from "@/screens/medicine/edit-medicine-drawer";
import { ViewMedicineDrawer } from "@/screens/medicine/view-medicine-drawer";
import { AddOrderDrawer } from "@/screens/order/add-order-drawer";
import { CheckoutDrawer } from "@/screens/order/checkout-drawer";
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

    <VewPatientSheet />
    <AddPatientDrawer />
    <UpdatePatientDrawer />

    <AddDoctorDrawer />
    <UpdateDoctorDrawer />
    <DoctorAvailabilityDrawer />
    <UpdateDoctorAvailabilityDrawer />

    <AddPharmacistDrawer />
    <ViewPharmacistDrawer />
    <UpdatePharmacistDrawer />

    <RescheduleDrawer />
    <AddAppointmentDrawer />
    <EditAppointmentDrawer />
    <ViewAppointmentDrawer />

    <AddPrescriptionDrawer />
    <ViewPrescriptionDrawer />
    <EditPrescriptionDrawer />

    <AddMedicineDrawer />
    <EditMedicineDrawer />
    <ViewMedicineDrawer />

    <AddOrderDrawer />
    <EditOrderDrawer />
    <ViewOrderDrawer />
    <CheckoutDrawer />

    <AddAdminDrawer />

    <ViewInventoryDrawer />
    <AdjustQuantity />
    <ReorderItemDrawer />
  </>
);
