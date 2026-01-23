// User types
export type UserRole =
  | "superadmin"
  | "admin"
  | "sales-manager"
  | "team-lead"
  | "sales"
  | "support"
  | "instructor"
  | "student";

export type UserStatus = "active" | "inactive" | "suspended";

export interface UserPermissions {
  canManageUsers: boolean;
  canManageTeams: boolean;
  canViewAllLeads: boolean;
  canAssignLeads: boolean;
  canDeleteLeads: boolean;
  canExportLeads: boolean;
  canViewReports: boolean;
  canViewAllReports: boolean;
  canEditSettings: boolean;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  team?: Team | string | null;
  reportsTo?: User | string | null;
  permissions: UserPermissions;
  status: UserStatus;
  createdBy?: User | string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Team types
export type TeamStatus = "active" | "inactive";

export interface Team {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  teamLead?: User | string | null;
  status: TeamStatus;
  createdBy?: User | string;
  membersCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Lead types
export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type LeadSource = "website" | "referral" | "social" | "other" | "contact_form" | "callback_request" | "whatsapp";

export interface LeadNote {
  _id: string;
  content: string;
  createdBy: User | string;
  createdAt: string;
}

export interface AssignmentHistoryItem {
  _id: string;
  assignedTo: User | string;
  assignedBy: User | string;
  assignedAt: string;
  reason: "manual" | "auto" | "reassigned";
}

export interface Lead {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: User | null;
  assignedBy?: User | null;
  assignedAt?: string;
  team?: Team | null;
  notes?: LeadNote[];
  assignmentHistory?: AssignmentHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: PaginationInfo;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface TeamsResponse {
  teams: Team[];
  pagination: PaginationInfo;
}

export interface LeadStats {
  total: number;
  unassigned: number;
  assigned: number;
  byStatus: {
    new: number;
    contacted: number;
    converted: number;
    lost: number;
  };
  bySource: Record<string, number>;
  conversionRate: number;
}

// Auth types
export interface AuthUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  team?: {
    _id: string;
    name: string;
  } | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Filter types
export interface LeadFilters {
  [key: string]: string | number | undefined; // Add this line
  status?: LeadStatus | "";
  source?: LeadSource | "";
  assignedTo?: string;
  team?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Admission types
export type AdmissionStatus = 
  | "pending" 
  | "payment_initiated" 
  | "paid" 
  | "enrolled" 
  | "expired" 
  | "payment_failed" 
  | "cancelled";

export type PaymentMethod = 
  | "cash" 
  | "bank_transfer" 
  | "upi" 
  | "razorpay" 
  | "other";

export type StudentGender = 
  | "Male" 
  | "Female" 
  | "Other" 
  | "Prefer not to say";

export type StudentClass = "6" | "7" | "8" | "9" | "10";

export type EducationBoard = "CBSE" | "ICSE" | "State Board" | "Other";

export type DeviceType = "Laptop" | "Tablet" | "Mobile" | "Desktop";

export type InternetAvailability = "Stable" | "Moderate" | "Limited";

export type ParentRelationship = "Father" | "Mother" | "Guardian";

export interface PaymentInstallment {
  _id?: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  recordedBy: User | string;
  recordedAt: string;
  paidAt: string;
  notes?: string;
  receiptUrl?: string;
}

export interface AdmissionPayment {
  totalAmount: number;  // Changed from 'amount' to 'totalAmount'
  originalAmount: number;
  currency: string;
  paidAmount: number;
  pendingAmount: number;
  installments: PaymentInstallment[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface StudentInfo {
  name: string;
  dateOfBirth: string;
  gender: StudentGender;
  class: StudentClass;
  schoolName?: string;
  board: EducationBoard;
}

export interface TechnologyInfo {
  device: DeviceType;
  internetAvailability: InternetAvailability;
}

export interface ParentAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Parent {
  _id: string;
  name: string;
  phone: string;
  email: string;
  relationship: ParentRelationship;
  whatsappPhone?: string;
  address?: ParentAddress;
}

export interface Invoice {
  number: string;
  generatedAt: string;
  url?: string;
}

export interface Admission {
  _id: string;
  admissionId: string;
  parent: Parent;
  student: StudentInfo;
  technology: TechnologyInfo;
  status: AdmissionStatus;
  payment: AdmissionPayment;
  invoice?: Invoice;
  source: string;
  userId?: User | string | null;
  createdAt: string;
  updatedAt: string;
}

// Admission API request/response types
export interface RecordPaymentData {
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  notes?: string;
}

export interface RecordPaymentResponse {
  success: boolean;
  admissionId: string;
  payment: {
    installment: {
      amount: number;
      method: PaymentMethod;
      paidAt: string;
      transactionId?: string;
    };
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    isFullyPaid: boolean;
  };
  status: AdmissionStatus;
  student: {
    userId: string;
    name: string;
    email: string;
  } | null;
  invoice: {
    number: string;
  } | null;
}

export interface AdmissionsResponse {
  admissions: Admission[];
  pagination: PaginationInfo;
}

export interface AdmissionStatsStatusCount {
  _id: AdmissionStatus;
  count: number;
}

export interface AdmissionStatsPaymentCount {
  _id: "unpaid" | "partial" | "paid";
  count: number;
}

export interface AdmissionStats {
  statusCounts: AdmissionStatsStatusCount[];
  paymentStats: Array<{
    _id: null;
    totalRevenue: number;
    totalExpected: number;
    totalPending: number;
    avgPaidAmount: number;
  }>;
  paymentStatusCounts: AdmissionStatsPaymentCount[];
}

export interface AdmissionFilters {
  [key: string]: string | number | undefined;
  status?: AdmissionStatus | "";
  paymentStatus?: "unpaid" | "partial" | "paid" | "";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}