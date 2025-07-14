// ================== Core Types ==================
interface Availability {
  days: string[];
  hours: string[];
}

interface BaseUserDto {
  email: string;
  password?: string;
  googleId?: string;
  role: UserRole;
}

interface BaseProfileDto {
  fullName: string;
  licenseNumber: string;
}

type ProfileData = {
  id: string;
  fullName: string;
  adminType?: string;
  specialty?: string;
} | null;
// ================== User Types ==================
interface CreateUserDto extends BaseUserDto {}
interface UserResponseDto extends Omit<BaseUserDto, "password" | "googleId"> {
  id: string;
  isEmailVerified: boolean;
  createdAt: Date;
  profile: ProfileData;
}
interface UpdateUserDto extends Partial<CreateUserDto> {
  isEmailVerified?: boolean;
}

// ================== Patient Types ==================
interface CreatePatientDto {
  fullName: string;
  phone: string;
  dateOfBirth?: Date;
  medicalHistory?: Record<string, any>;
}
interface PatientResponseDto extends CreatePatientDto {
  id: string;
  status: "active" | "inactive";
  dateOfBirth: Date;
  medicalHistory: Record<string, any>;
  user: UserResponseDto;
  appointment: AppointmentResponseDto;
}
interface UpdatePatientDto extends Partial<CreatePatientDto> {}

// ================== Doctor Types ==================
interface CreateDoctorDto {
  fullName: string;
  specialty: string;
  availability: Availability;
  consultationFee: number;
  licenseNumber: string;
  userId: string;
}
interface DoctorResponseDto extends CreateDoctorDto {
  id: string;
  status: "active" | "inactive";
  createdAt: string;
  user: UserResponseDto;
}
interface UpdateDoctorDto extends Partial<CreateDoctorDto> {}

// ================== Admin Types ==================
interface CreateAdminDto {
  fullName: string;
  adminType: AdminType;
  userUuid: string;
  specialty: string;
  availability: Availability;
  consultationFee: number;
  licenseNumber: string;
}
interface AdminResponseDto extends CreateAdminDto {
  id: string;
  user: UserResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
interface UpdateAdminDto extends Partial<CreateAdminDto> {}
interface AdminPaginatedDto {
  data: AdminResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Pharmacist Types ==================
interface CreatePharmacistDto extends BaseProfileDto {
  userId: string;
  pharmacyId: string;
}
interface PharmacistResponseDto extends CreatePharmacistDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
  user: UserResponseDto;
  pharmacy: PharmacyResponseDto;
}
interface UpdatePharmacistDto extends Partial<CreatePharmacistDto> {}

// ================== Appointment Types ==================
interface CreateAppointmentDto {
  datetime: Date;
  status: string;
  patientId: string;
  doctorId: string;
}
interface AppointmentResponseDto extends CreateAppointmentDto {
  id: string;
  status: AppointmentStatus;
  patient: PatientResponseDto;
  doctor: DoctorResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}
type AppointmentPaginatedDto = AppointmentResponseDto;

// ================== Consultation Types ==================
interface CreateConsultationDto {
  startTime: Date;
  endTime?: Date;
  videoSessionId?: string;
  duration?: number;
  notes?: string;
  patientId: string;
  doctorId: string;
}
interface ConsultationResponseDto
  extends Required<Omit<CreateConsultationDto, "patientId" | "doctorId">> {
  id: string;
  patient: PatientResponseDto;
  doctor: DoctorResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
interface UpdateConsultationDto extends Partial<CreateConsultationDto> {}
interface ConsultationPaginatedDto {
  data: ConsultationResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Medicine Types ==================
interface CreateMedicineDto {
  name: string;
  genericName: string;
  description: string;
  price: number;
  manufacturer: string;
  barcode?: string;
}
interface MedicineResponseDto extends Required<CreateMedicineDto> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
interface UpdateMedicineDto extends Partial<CreateMedicineDto> {}
interface MedicinePaginatedDto {
  data: MedicineResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Inventory Types ==================
interface CreateInventoryItemDto {
  medicineId: string;
  pharmacyId: string;
  quantity: number;
  reorderThreshold: number;
}
interface InventoryItemResponseDto extends CreateInventoryItemDto {
  id: string;
  lastRestocked: Date;
  medicine: MedicineResponseDto;
  pharmacy: PharmacyResponseDto;
}
interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {}
interface InventoryItemPaginatedDto {
  data: InventoryItemResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Pharmacy Types ==================
interface CreatePharmacyDto {
  name: string;
  address: string;
  contactPhone: string;
  licenseNumber: string;
}
interface PharmacyResponseDto extends CreatePharmacyDto {
  id: string;
  inventoryIds: string[];
  orderIds: string[];
  pharmacistIds: string[];
}
interface UpdatePharmacyDto extends Partial<CreatePharmacyDto> {}

// ================== Order Types ==================
interface CreateOrderItemDto {
  medicineId: string;
  quantity: number;
  pricePerUnit: number;
}
interface CreateOrderDto {
  patientId: string;
  pharmacyId: string;
  items: CreateOrderItemDto[];
  status?: OrderStatus;
  totalAmount: number;
}
interface OrderItemResponseDto extends CreateOrderItemDto {
  id: string;
  medicine: MedicineResponseDto;
}
interface OrderResponseDto
  extends Omit<CreateOrderDto, "items" | "patientId" | "pharmacyId"> {
  id: string;
  orderDate: string;
  stripePaymentId: string;
  paystackReference: string;
  paymentStatus: string;
  patient: PatientResponseDto;
  pharmacy: PharmacyResponseDto;
  items: OrderItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}
interface UpdateOrderDto extends Partial<CreateOrderDto> {}
interface OrderPaginatedDto {
  data: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Auth Types ==================
interface SignUpDto {
  email: string;
}
interface LoginDto {
  email: string;
  password: string;
}
interface RefreshTokenDto {
  refreshToken: string;
}
interface ResetPasswordInitiateDto {
  email: string;
}
interface ResetPasswordConfirmDto {
  token: string;
  newPassword: string;
}
interface UpdateEmailDto {
  newEmail: string;
}
interface VerifyEmailDto {
  email: string;
  otp: string;
}

// ================== Prescription Types ==================
interface BasePrescriptionDto {
  medicationDetails: string;
  issueDate: string;
  expiryDate: string;
  patientId: string;
  doctorId: string;
  pharmacyId?: string;
}

interface CreatePrescriptionDto extends BasePrescriptionDto {}

interface PrescriptionResponseDto
  extends Omit<BasePrescriptionDto, "patientId" | "doctorId"> {
  id: string;
  isFulfilled: boolean;
  patient: PatientResponseDto;
  prescribedBy: DoctorResponseDto;
}

interface UpdatePrescriptionDto extends Partial<CreatePrescriptionDto> {}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  parts: {
    type: "text";
    text: string;
  }[];
}

interface CreateChatDto {
  id: string;
  messages: ChatMessage[];
}
