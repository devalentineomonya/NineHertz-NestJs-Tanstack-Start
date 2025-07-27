enum PaymentMethod {
  PAYSTACK = "paystack",
  STRIPE = "stripe",
}
// ================== Base Types ==================
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

interface PaginatedResponse<T> {
  readonly data: T[];
  total: number;
  page: number;
  limit: number;
}

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
  createdAt: Date;
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

type AdminPaginatedDto = PaginatedResponse<AdminResponseDto>;

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
  status: AppointmentStatus;
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
  transactions: TransactionResponseDto[];
  patient: PatientResponseDto;
  doctor: DoctorResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}

type AppointmentPaginatedDto = PaginatedResponse<AppointmentResponseDto>;

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

interface UpdateMedicineDto extends Partial<CreateMedicineDto> {}

type MedicinePaginatedDto = PaginatedResponse<MedicineResponseDto>;

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

type InventoryItemPaginatedDto = PaginatedResponse<InventoryItemResponseDto>;

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

type OrderPaginatedDto = PaginatedResponse<OrderResponseDto>;

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

// ================== Transaction Types ==================
interface TransactionResponseDto {
  id: string;
  reference: string;
  amount: number;
  status: TransactionStatus;
  description?: string;
  gateway: Gateway;
  gatewayReference: string;
  gatewayFees?: number;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  refundReason?: string;
  metadata?: Record<string, any>;
  orderId?: string;
  appointmentId?: string;
  userId?: string;
}

interface InitiatePaymentDto {
  gateway: Gateway;
  amount: number;
  description?: string;
  customerEmail: string;
  orderId?: string;
  appointmentId?: string;
}

interface RefundTransactionDto {
  transactionId: string;
  reason?: string;
  metadata?: Record<string, any>;
}

type TransactionPaginatedDto = PaginatedResponse<TransactionResponseDto>;

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

// ================== Chat Types ==================
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

// ================== Dashboard Types ==================
interface DashboardStats {
  title: string;
  value: number;
  change: string;
  color: string;
  icon: string;
}

interface DepartmentInfo {
  specialty: string;
  count: string;
}

interface AdminDashboardResponse {
  stats: DashboardStats[];
  departments: {
    departments: DepartmentInfo[];
  };
  appointments: AppointmentResponseDto[];
}

// ================== Notification Types ==================
interface Notification {
  id: string;
  message: string;
  eventType: string;
  eventId: string;
  read: boolean;
  readonly data: any | null;
  createdAt: string;
}

interface TestNotification {
  userId: string;
  title: string;
  message: string;
  url: string;
}

interface PushSubscriptionDto {
  userId: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

type NotificationResponse = PaginatedResponse<Notification>;

interface CreateReviewDto {
  comment: string;
  rating: number;
  appointmentId: string;
}

interface ReviewResponseDto {
  id: string;
  comment: string;
  rating: number;
  patient: PatientResponseDto;
  doctor: DoctorResponseDto;
  createdAt: Date;
}
