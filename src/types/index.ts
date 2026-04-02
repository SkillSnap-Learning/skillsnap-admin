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
  board?: 'CBSE' | 'ICSE' | 'State Board' | null;
  stateBoardName?: string | null;
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
  board?: 'CBSE' | 'ICSE' | 'State Board' | '';
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

// Learning Platform Types
export interface Course {
  _id: string;
  title: string;
  class: string;
  subject: string;
  description?: string;
  totalChapters: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ClassType = '6' | '7' | '8' | '9' | '10';
export type SubjectType = 'english' | 'maths' | 'science' | 'social_science';
export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface NotificationTemplate {
  _id: string;
  type: 'achievement' | 'reminder' | 'announcement' | 'instructor_reply' | 'chapter_unlocked' | 'test_passed' | 'child_test_passed' | 'child_chapter_unlocked' | 'weekly_progress' | 'parent_announcement';
  title: string;
  message: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Plan types
export interface Plan {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isGuestPlan: boolean;
  price: {
    amount: number;
    originalAmount: number;
    currency: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Subject types
export type SubjectName =
  | 'maths'
  | 'science'
  | 'english'
  | 'social_science'
  | 'coding'
  | 'life_skills'
  | 'general';

export interface Subject {
  _id: string;
  planId: string | Plan;
  name: SubjectName;
  class: ClassType;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Topic types
export interface Topic {
  _id: string;
  chapterId: string | Chapter;
  topicNumber: number;
  title: string;
  description?: string;
  videoUrl?: string;
  videoStatus: 'none' | 'uploading' | 'ready';
  videoFileName?: string;
  videoDuration?: number;
  notesUrl?: string;
  notesFileName?: string;
  minimumWatchPercentage: number;
  minimumTestPercentage: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Update Chapter type (remove video/notes fields, add subjectId)
export interface Chapter {
  _id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  notesUrl?: string;
  notesFileName?: string;
  assessmentUrl?: string;
  assessmentFileName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  chapterId: string | Chapter;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: DifficultyType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Blog types
export type BlogCategory = 'featured' | 'new' | 'hot';
export type BlockType = 'paragraph' | 'heading' | 'bullets' | 'numbered' | 'image' | 'quote';
export type ImageAlignment = 'center' | 'full';

export interface ContentBlock {
  type: BlockType;
  text?: string;
  items?: string[];
  src?: string;
  alt?: string;
  alignment?: ImageAlignment;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  coverImage?: string | null;
  tags: string[];
  readTime?: string | null;
  blocks: ContentBlock[];
  relatedPosts: Blog[] | string[];
  isPublished: boolean;
  publishedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: PaginationInfo;
}

// News types
export interface News {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  coverImage?: string | null;
  tags: string[];
  readTime?: string | null;
  blocks: ContentBlock[];
  relatedNews: News[] | string[];
  isPublished: boolean;
  publishedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsResponse {
  news: News[];
  pagination: PaginationInfo;
}