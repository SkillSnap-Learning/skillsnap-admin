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