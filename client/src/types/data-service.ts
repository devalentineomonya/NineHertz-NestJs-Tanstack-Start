// ================== Core Types ==================
interface Availability {
  days: string[];
  hours: string[];
}

interface BaseUserDto {
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  role: UserRole;
}

interface BaseProfileDto {
  fullName: string;
  licenseNumber: string;
  phoneNumber?: string;
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
  appointments: AppointmentResponseDto[];
  orders: OrderResponseDto[];
  prescriptions: PrescriptionResponseDto[];
}
interface UpdatePatientDto extends Partial<CreatePatientDto> {}

// ================== Doctor Types ==================
interface CreateDoctorDto {
  fullName: string;
  specialty: string;
  availability: Availability;
  appointmentFee: number;
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
  appointmentFee: number;
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
  readonly data: AdminResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Pharmacist Types ==================
interface CreatePharmacistDto extends BaseProfileDto {
  userId: string;
}
interface PharmacistResponseDto extends CreatePharmacistDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
  user: UserResponseDto;
}
interface UpdatePharmacistDto extends Partial<CreatePharmacistDto> {}

// ================== Appointment Types ==================
interface CreateAppointmentDto {
  datetime: Date;
  status: "scheduled" | "completed" | "cancelled";
  type: "consultation" | "checkup" | "follow-up" | "emergency";
  mode: "virtual" | "physical";
  patientId: string;
  doctorId: string;
  videoSessionId?: string;
  endTime: Date;
  startTime: Date;
  duration: number;
  notes?: string;
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

// ================== Medicine Types ==================
interface CreateMedicineDto {
  name: string;
  genericName: string;
  description: string;
  price: number;
  manufacturer: string;
  barcode?: string;
  type?: "otc" | "prescribed";
}
interface MedicineResponseDto extends Required<CreateMedicineDto> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
interface UpdateMedicineDto extends Partial<CreateMedicineDto> {  }
interface MedicinePaginatedDto {
  readonly data: MedicineResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Inventory Types ==================
interface CreateInventoryItemDto {
  medicineId: string;
  quantity: number;
  reorderThreshold: number;
}
interface InventoryItemResponseDto extends CreateInventoryItemDto {
  id: string;
  lastRestocked: Date;
  medicine: MedicineResponseDto;
}
interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {}
interface InventoryItemPaginatedDto {
  readonly data: InventoryItemResponseDto[];
  total: number;
  page: number;
  limit: number;
}

// ================== Order Types ==================
interface CreateOrderItemDto {
  medicineId: string;
  quantity: number;
  pricePerUnit: number;
}
interface CreateOrderDto {
  patientId: string;
  items: CreateOrderItemDto[];
  status: OrderStatus;
  totalAmount: number;
}
interface OrderItemResponseDto extends CreateOrderItemDto {
  id: string;
  medicine: MedicineResponseDto;
}
interface OrderResponseDto extends Omit<CreateOrderDto, "items" | "patientId"> {
  id: string;
  orderDate: string;
  stripePaymentId: string;
  paystackReference: string;
  paymentStatus: string;
  patient: PatientResponseDto;
  items: OrderItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}
interface UpdateOrderDto extends Partial<CreateOrderDto> {}
interface OrderPaginatedDto {
  readonly data: OrderResponseDto[];
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

interface PrescriptionItemDto {
  medicineId: string;
  dosage: string;
  frequency: string;
  note?: string;
}

interface BasePrescriptionDto {
  items: PrescriptionItemDto[];
  issueDate: string;
  expiryDate: string;
  patientId: string;
  doctorId: string;
  pharmacistId?: string;
  isFulfilled?: boolean;
}

interface CreatePrescriptionDto extends BasePrescriptionDto {}

interface PrescriptionResponseDto
  extends Omit<BasePrescriptionDto, "patientId" | "doctorId"> {
  id: string;
  isFulfilled: boolean;
  fulfillmentDate: string;
  updatedAt: string;
  createdAt: string;
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

interface AdminDashboardResponse {
  stats: {
    title: string;
    value: number;
    change: string;
    color: string;
    icon: string;
  }[];
  departments: {
    departments: {
      specialty: string;
      count: string;
    }[];
  };
  appointments: AppointmentResponseDto[];
}

interface Notification {
  id: string;
  message: string;
  eventType: string;
  eventId: string;
  read: boolean;
  readonly data: any | null;
  createdAt: string;
}

interface NotificationResponse {
  readonly data: Notification[];
  total: number;
  page: number;
  limit: number;
}
