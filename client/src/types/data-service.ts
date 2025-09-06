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
  transactions: TransactionResponseDto[];
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
  checkoutUrl?: string;
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

interface AdminRecentActivities extends Notification {
  channels: string[];
  type?: string;
}
interface AdminDashboardResponse {
  stats: DashboardStats[];
  departments: {
    departments: DepartmentInfo[];
  };
  appointments: AppointmentResponseDto[];
  recentActivities: AdminRecentActivities[];
  topDoctors: Array<{
    doctor_id: string;
    doctor_fullName: string;
    doctor_specialty: string;
    rating: string | null;
    patients: string;
  }>;

  patientSatisfaction: Array<{
    month: string;
    score: string;
  }>;
  upcomingAppointments: AppointmentResponseDto[];
  footerStats: Array<{
    label: string;
    value: number;
    change: string;
  }>;
}

// ================== Patient Dashboard Types ==================
interface PatientDashboardStats {
  upcomingAppointments: number;
  pendingPrescriptions: number;
  unreadNotifications: number;
  virtualAppointments: number;
}

// Using existing AppointmentResponseDto but making doctor optional
type DashboardAppointment = Omit<AppointmentResponseDto, "doctor"> & {
  doctor: Pick<
    DoctorResponseDto,
    | "id"
    | "fullName"
    | "specialty"
    | "availability"
    | "appointmentFee"
    | "licenseNumber"
    | "status"
    | "createdAt"
  >;
};

// Simplified prescription type for dashboard
interface DashboardPrescription {
  id: string;
  items: {
    note: string;
    dosage: string;
    frequency: string;
    medicineId: string;
  }[];
  issueDate: string;
  expiryDate: string;
  isFulfilled: boolean;
  createdAt: string;
  updatedAt: string;
  fulfillmentDate: string | null;
}

// Extending existing Notification type with channels
interface DashboardNotification
  extends Omit<Notification, "data" | "channels"> {
  channels: string[];
}

// Main dashboard response type
interface PatientDashboardResponse {
  stats: PatientDashboardStats;
  appointments: DashboardAppointment[];
  prescriptions: DashboardPrescription[];
  medicines: MedicineResponseDto[];
  notifications: DashboardNotification[];
}

// ================== Doctor Dashboard Types ==================
interface DoctorDashboardDoctor {
  id: string;
  name: string;
  specialization: string;
}

interface DoctorDashboardStats {
  todaysAppointments: number;
  waitingPatients: number;
  unreadMessages: number;
  pendingPrescriptions: number;
}

interface DoctorDashboardAppointment {
  id: string;
  time: string;
  patient: string;
  status: "Cancelled" | "Waiting" | "Completed";
  duration: string;
  avatar: string;
  patientId: string;
  mode: "virtual" | "physical";
}

interface DashboardPatient {
  id: string;
  name: string;
  lastVisit: string; // Date string
  condition: string;
  status: Record<string, never>; // Empty object
}

interface DashboardResource {
  id: number;
  title: string;
  category: string;
  icon: string;
  url: string;
}

interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface DoctorDashboardResponse {
  doctor: DoctorDashboardDoctor;
  stats: DoctorDashboardStats;
  appointments: DoctorDashboardAppointment[];
  patients: DashboardPatient[];
  resources: DashboardResource[];
  notifications: DashboardNotification[];
}

// ================== Pharmacist Dashboard Types ==================
interface PharmacistInfo {
  id: string;
  name: string;
  licenseNumber: string;
}

interface PharmacistDashboardStats {
  prescriptionsToFill: number;
  pendingOrders: number;
  inventoryAlerts: number;
  readyForPickup: number;
}

interface DashboardPrescription {
  id: string;
  patient: string;
  medication: string;
  isFulFilled: boolean; // Note: Typo in JSON ("isFulFilled")
  date: string; // ISO date string
  avatar: string;
  prescribedBy: string;
  itemCount: number;
}

interface DashboardOrder {
  id: string;
  patient: string;
  items: number; // Count of items in order
  total: number; // Total amount
  status: string; // Could be "Pending", "Processing", "Completed", etc.
  orderDate: string; // ISO date string
  patientId: string;
}

// Reusing the InventoryDashboardItem from earlier
interface InventoryDashboardItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  status: string;
  lastRestocked: string;
  medicineId: string;
}

// Reusing the DashboardNotification from doctor dashboard
interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface PharmacistDashboardResponse {
  pharmacist: PharmacistInfo;
  stats: PharmacistDashboardStats;
  prescriptions: DashboardPrescription[];
  inventory: InventoryDashboardItem[];
  orders: DashboardOrder[];
  notifications: DashboardNotification[];
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
