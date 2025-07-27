enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ADMIN = "admin",
  PHARMACIST = "pharmacist",
}

enum AdminType {
  SUPER_ADMIN = "super",
  SUPPORT_ADMIN = "support",
}

enum AppointmentStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

enum Gateway {
  PAYSTACK = "paystack",
  STRIPE = "stripe",
}

enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  ABANDONED = "abandoned",
}
