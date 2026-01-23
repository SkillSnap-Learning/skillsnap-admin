# SKILLSNAP ADMIN PANEL - PROJECT OVERVIEW

## Project Summary
A comprehensive Next.js-based admin panel for SkillSnap Learning CRM. Features multi-role authentication, lead management, user management, team management, **admission management with installment payment tracking**, and role-based access control. Designed to work with the SkillSnap Backend API.

---

## Tech Stack & Dependencies

### Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui

### State & Data
- **State Management:** Zustand (with persist middleware)
- **Data Fetching:** TanStack React Query v5
- **HTTP Client:** Axios

### UI Libraries
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **Utilities:** clsx, tailwind-merge, class-variance-authority

---

## Project Structure
```
skillsnap-admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/              # Protected routes group
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Main dashboard with stats
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx          # Leads listing
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Lead detail page
│   │   │   ├── admissions/           ⭐ NEW
│   │   │   │   ├── page.tsx          # Admissions listing
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Admission detail page
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # Users management
│   │   │   └── teams/
│   │   │       └── page.tsx          # Teams management
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── globals.css               # Global styles + CSS variables
│   │   ├── layout.tsx                # Root layout with providers
│   │   └── page.tsx                  # Root redirect
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── QuickActions.tsx      # Auto-assign, export buttons
│   │   │   ├── RecentLeadsTable.tsx  # Recent leads widget
│   │   │   ├── StatsCard.tsx         # Statistics card component
│   │   │   └── StatsCardSkeleton.tsx # Loading skeleton
│   │   ├── layout/
│   │   │   ├── AuthGuard.tsx         # Authentication wrapper
│   │   │   ├── Header.tsx            # Page header with user menu
│   │   │   └── Sidebar.tsx           # Navigation sidebar (includes Admissions) ✅ UPDATED
│   │   ├── leads/
│   │   │   ├── AssignLeadModal.tsx   # Lead assignment modal
│   │   │   ├── AssignmentHistory.tsx # Assignment history display
│   │   │   ├── LeadFilters.tsx       # Search & filter controls
│   │   │   ├── LeadInfoCard.tsx      # Lead contact info card
│   │   │   ├── LeadStatusBadge.tsx   # Status badge with dropdown
│   │   │   ├── LeadsTable.tsx        # Main leads table
│   │   │   └── NotesTimeline.tsx     # Notes timeline with add form
│   │   ├── admissions/               ⭐ NEW
│   │   │   ├── AdmissionFilters.tsx  # Search & filter controls
│   │   │   ├── AdmissionsTable.tsx   # Main admissions table
│   │   │   ├── AddPaymentModal.tsx   # Record payment modal
│   │   │   └── PaymentTimeline.tsx   # Payment history display
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx     # React Query provider
│   │   ├── teams/
│   │   │   ├── TeamMembersModal.tsx  # Manage team members
│   │   │   ├── TeamModal.tsx         # Create/edit team modal
│   │   │   └── TeamsTable.tsx        # Teams listing table
│   │   ├── users/
│   │   │   ├── UserModal.tsx         # Create/edit user modal
│   │   │   └── UsersTable.tsx        # Users listing table
│   │   └── ui/                       # shadcn/ui components
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── confirm-dialog.tsx    # Custom confirmation dialog
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── pagination.tsx        # Custom pagination component
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── table.tsx
│   │       └── textarea.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                    # Axios client & API functions (includes admissionsApi) ✅ UPDATED
│   │   └── utils.ts                  # Utility functions (cn, formatters)
│   │
│   ├── stores/
│   │   └── authStore.ts              # Zustand auth store
│   │
│   └── types/
│       └── index.ts                  # TypeScript interfaces (includes Admission types) ✅ UPDATED
│
├── public/
├── .env.local                        # Environment variables
├── .env.example                      # Environment template
├── components.json                   # shadcn/ui configuration
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── PROJECT_OVERVIEW.md               # This file
```

**Legend:** ⭐ NEW | ✅ UPDATED

---

## User Roles & Access Control

### Role Hierarchy
```
SuperAdmin (System Owner)
    └── Admin (Platform Administrator)
        └── Sales Manager (Team & Lead Manager)
            └── Team Lead (Team Supervisor)
                └── Sales (Front-line Sales)
```

### Page Access by Role

| Page | SuperAdmin | Admin | Sales Manager | Team Lead | Sales |
|------|------------|-------|---------------|-----------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leads | ✅ All | ✅ All | ✅ All | ✅ Team + Unassigned | ✅ Own |
| Lead Detail | ✅ | ✅ | ✅ | ✅ Team | ✅ Own |
| Admissions | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Admission Detail | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ Team | ❌ | ❌ |
| Teams | ✅ | ✅ | ✅ | ❌ | ❌ |

### Feature Permissions

| Feature | SuperAdmin | Admin | Sales Manager | Team Lead | Sales |
|---------|------------|-------|---------------|-----------|-------|
| Create User | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Team | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Team | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Auto-Assign | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update Status | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Notes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Record Payment | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Admissions | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Pages & Features

### 1. Login Page (`/login`)
- Email & password authentication
- Show/hide password toggle
- Error handling with toast notifications
- Redirects to dashboard on success
- JWT token stored in localStorage

### 2. Dashboard (`/dashboard`)
- **Stats Cards:**
  - Total Leads
  - New Leads
  - Converted Leads
  - Unassigned Leads
  - Contacted Leads
  - Lost Leads
  - Assigned Leads
- **Quick Actions:**
  - Auto-Assign Leads (role-restricted)
  - Export CSV (role-restricted)
- **Recent Leads Table:**
  - Shows latest 5 leads
  - Quick status update
  - Link to full leads list

### 3. Leads Page (`/leads`)
- **Filters:**
  - Search (name, email, phone)
  - Status (new, contacted, converted, lost)
  - Source (website, referral, social, etc.)
  - Assigned To (user dropdown)
  - Team (team dropdown)
- **Table Features:**
  - Bulk selection with checkboxes
  - Inline status dropdown
  - Row actions (view, assign)
  - Responsive columns
- **Bulk Actions:**
  - Assign selected leads
- **Pagination:**
  - 20 items per page
  - Page navigation

### 4. Lead Detail Page (`/leads/[id]`)
- **Lead Info Card:**
  - Contact details (phone, email)
  - Source & created date
  - Team assignment
  - Message content
- **Quick Actions:**
  - Status dropdown
  - Assign/Reassign dropdown
- **Notes Timeline:**
  - Chronological notes display
  - Add new note form
  - Author & timestamp
- **Assignment History:**
  - All assignment records
  - Assignment reason (manual/auto/reassigned)
  - Who assigned & when

### 5. Admissions Page (`/admissions`) ⭐ NEW
- **Stats Cards (canViewReports only):**
  - Total Admissions
  - Fully Paid (with total revenue)
  - Partial Payment (with pending amount)
  - Unpaid
- **Filters:**
  - Search (student name, admission ID)
  - Status (pending, payment_initiated, paid, enrolled, expired, payment_failed, cancelled)
  - Payment Status (unpaid, partial, paid)
- **Table Display:**
  - Admission ID
  - Student name & date of birth
  - Parent name & phone
  - Class
  - Payment progress bar with percentage
  - Amount (paid/total with pending)
  - Status badge
  - Created date
- **Row Actions:**
  - View admission details
- **Export:**
  - Export button (coming soon)
- **Pagination:**
  - 20 items per page
  - Page navigation

### 6. Admission Detail Page (`/admissions/[id]`) ⭐ NEW
- **Header:**
  - Admission ID as title
  - Student name and class as description
  - Back to Admissions button
  - Status badge
  - Download Invoice button (when available)
  
- **Student Information Card:**
  - Name, date of birth, gender
  - Class, board
  - School name (if provided)
  - Icon: GraduationCap

- **Parent Information Card:**
  - Name, relationship
  - Phone, email
  - WhatsApp phone (if different)
  - Address (if provided)
  - Icon: User

- **Technology Access Card:**
  - Device type (Laptop, Tablet, Mobile, Desktop)
  - Internet availability (Stable, Moderate, Limited)
  - Icon: Wifi

- **Payment Summary Card:**
  - Progress bar (visual representation)
  - Payment progress percentage
  - Three amount boxes:
    - Total Amount (₹23,999)
    - Paid (green, with amount)
    - Pending (orange, with amount)
  - Add Payment button (canManageUsers permission only)
  - Disabled when fully paid
  - Student account status indicator (when enrolled)

- **Payment Timeline Card:**
  - Chronological list of all installments (newest first)
  - Each installment shows:
    - Amount (green, prominent)
    - Payment date and time
    - Payment method badge
    - Transaction ID (if provided)
    - Recorded by (user name)
    - Recorded date
    - Notes (if provided)
  - Visual timeline indicator with icons
  - Empty state when no payments recorded

- **Add Payment Modal (canManageUsers only):**
  - Payment summary (total, paid, remaining)
  - Amount input with validation
    - Required
    - Must be > 0
    - Cannot exceed pending balance
  - Payment method dropdown
    - Cash, Bank Transfer, UPI, Razorpay, Other
    - Required
  - Transaction ID input (optional)
  - Payment date picker
    - Required
    - Cannot be future date
    - Defaults to today
  - Notes textarea (optional, max 500 chars)
  - Real-time validation
  - Auto-refresh on success
  - Success message with enrollment status

- **Auto-enrollment Notification:**
  - Displayed when payment is fully completed
  - Shows student account created message
  - Indicates credentials sent to parent's email

### 7. Users Page (`/users`)
- **Filters:**
  - Search by name/email
  - Role filter
  - Status filter
- **Table Display:**
  - User avatar (initials)
  - Name & email
  - Role badge
  - Team assignment
  - Status badge
  - Created date
- **Actions:**
  - Create new user
  - Edit user
  - Reset password
  - Delete user (SuperAdmin only)
- **User Modal:**
  - Name, email, phone
  - Password (required for new, optional for edit)
  - Role selection
  - Team assignment
  - Status selection

### 8. Teams Page (`/teams`)
- **Filters:**
  - Search by name
  - Status filter
- **Table Display:**
  - Team icon & name
  - Description
  - Team lead
  - Members count
  - Status badge
  - Created date
- **Actions:**
  - Create new team
  - Edit team
  - Manage members
  - Delete team (SuperAdmin/Admin only)
- **Team Modal:**
  - Name & description
  - Team lead selection
  - Status selection
- **Members Modal:**
  - Add members from dropdown
  - Remove members with X button
  - Shows member count

---

## API Integration

### Base Configuration
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
```

### API Endpoints Used

| Module | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| **Auth** | `/auth/login` | POST | User login |
| | `/auth/me` | GET | Get current user |
| | `/auth/change-password` | POST | Change password |
| **Leads** | `/admin/leads` | GET | List leads |
| | `/admin/leads/:id` | GET | Get lead details |
| | `/admin/leads/:id/status` | PATCH | Update status |
| | `/admin/leads/:id/assign` | PATCH | Assign lead |
| | `/admin/leads/:id/notes` | POST | Add note |
| | `/admin/leads/stats` | GET | Get statistics |
| | `/admin/leads/export` | GET | Export CSV |
| | `/admin/leads/auto-assign` | POST | Auto-assign |
| **Admissions** | `/admin/admissions` | GET | List admissions |
| | `/admin/admissions/stats` | GET | Get statistics |
| | `/admin/admissions/:id` | GET | Get admission details |
| | `/admin/admissions/:id/payment` | POST | Record payment |
| **Users** | `/admin/users` | GET | List users |
| | `/admin/users` | POST | Create user |
| | `/admin/users/:id` | PATCH | Update user |
| | `/admin/users/:id` | DELETE | Delete user |
| | `/admin/users/sales` | GET | Get sales users |
| | `/admin/users/:id/reset-password` | POST | Reset password |
| **Teams** | `/admin/teams` | GET | List teams |
| | `/admin/teams` | POST | Create team |
| | `/admin/teams/:id` | GET | Get team with members |
| | `/admin/teams/:id` | PATCH | Update team |
| | `/admin/teams/:id` | DELETE | Delete team |
| | `/admin/teams/active` | GET | Get active teams |
| | `/admin/teams/:id/members` | POST | Add member |
| | `/admin/teams/:id/members/:userId` | DELETE | Remove member |

---

## State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user, token) => void;
  logout: () => void;
  
  // Permission Helpers
  hasPermission: (permission) => boolean;
  hasRole: (...roles) => boolean;
  canManageUsers: () => boolean;
  canManageTeams: () => boolean;
  canAssignLeads: () => boolean;
  canExportLeads: () => boolean;
  canViewReports: () => boolean;
  canDeleteLeads: () => boolean;
}
```

### Persistence
- Auth state persisted to localStorage via Zustand persist middleware
- Token stored separately for API interceptor access
- Hydration handled in AuthGuard component

---

## TypeScript Types

### Core Types
```typescript
export type UserRole =
  | "superadmin"
  | "admin"
  | "sales-manager"
  | "team-lead"
  | "sales"
  | "support"
  | "instructor"
  | "student";

export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  team?: Team | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: User | null;
  team?: Team | null;
  notes?: LeadNote[];
  assignmentHistory?: AssignmentHistoryItem[];
  createdAt: string;
  updatedAt: string;
}
```

### Admission Types ⭐ NEW
```typescript
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
  totalAmount: number;
  originalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  installments: PaymentInstallment[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface StudentInfo {
  name: string;
  dateOfBirth: string;
  gender: StudentGender;
  class: StudentClass;
  schoolName?: string;
  board: EducationBoard;
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

export interface Admission {
  _id: string;
  admissionId: string;
  parent: Parent;
  student: StudentInfo;
  technology: TechnologyInfo;
  status: AdmissionStatus;
  payment: AdmissionPayment;
  invoice?: Invoice;
  userId?: User | string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPaymentData {
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  notes?: string;
}

export interface AdmissionFilters {
  status?: AdmissionStatus | "";
  paymentStatus?: "unpaid" | "partial" | "paid" | "";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

---

## Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Production
NEXT_PUBLIC_API_URL=https://api.skillsnaplearning.com/api/v1
```

---

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = Your backend API URL
4. Deploy

### Build Commands
```bash
npm run build    # Production build
npm run start    # Start production server
npm run dev      # Development server
npm run lint     # ESLint check
```

### DNS Configuration (GoDaddy)
```
Type    Name    Value                              TTL
----    ----    -----                              ---
CNAME   admin   cname.vercel-dns.com              600
```

Or if using Vercel's automatic subdomain:
```
Type    Name    Value                              TTL
----    ----    -----                              ---
A       admin   76.76.19.19                        600
```

---

## Design System

### Colors (CSS Variables)
```css
--primary: #0c1e3d;        /* Blue 950 - Main brand */
--accent: #ea580c;         /* Orange 600 - Accent */
--background: #ffffff;     /* White */
--foreground: #0c1e3d;     /* Blue 950 */
--muted: #f1f5f9;          /* Slate 100 */
--border: #e2e8f0;         /* Slate 200 */
```

### Status Colors
| Status | Background | Text |
|--------|------------|------|
| New | `bg-blue-100` | `text-blue-700` |
| Contacted | `bg-yellow-100` | `text-yellow-700` |
| Converted | `bg-green-100` | `text-green-700` |
| Lost | `bg-red-100` | `text-red-700` |
| Active | `bg-green-100` | `text-green-700` |
| Inactive | `bg-slate-100` | `text-slate-700` |
| Suspended | `bg-red-100` | `text-red-700` |

### Role Colors
| Role | Background | Text |
|------|------------|------|
| SuperAdmin | `bg-purple-100` | `text-purple-700` |
| Admin | `bg-blue-100` | `text-blue-700` |
| Sales Manager | `bg-indigo-100` | `text-indigo-700` |
| Team Lead | `bg-teal-100` | `text-teal-700` |
| Sales | `bg-green-100` | `text-green-700` |
| Support | `bg-yellow-100` | `text-yellow-700` |

### Admission Status Colors ⭐ NEW
| Status | Background | Text |
|--------|------------|------|
| Pending | `bg-gray-100` | `text-gray-700` |
| Payment Initiated | `bg-blue-100` | `text-blue-700` |
| Paid | `bg-green-100` | `text-green-700` |
| Enrolled | `bg-purple-100` | `text-purple-700` |
| Expired | `bg-red-100` | `text-red-700` |
| Payment Failed | `bg-orange-100` | `text-orange-700` |
| Cancelled | `bg-slate-100` | `text-slate-700` |

### Payment Method Colors ⭐ NEW
| Method | Background | Text |
|--------|------------|------|
| Cash | `bg-green-100` | `text-green-700` |
| Bank Transfer | `bg-blue-100` | `text-blue-700` |
| UPI | `bg-purple-100` | `text-purple-700` |
| Razorpay | `bg-orange-100` | `text-orange-700` |
| Other | `bg-gray-100` | `text-gray-700` |

---

## Key Features

### Lead Management
- Role-based lead visibility
- Bulk selection and assignment
- Inline status updates
- Assignment history tracking
- Notes timeline
- Auto-assignment via round-robin
- CSV export

### User Management
- Multi-role support (8 roles)
- Team assignment
- Password reset
- Role-based permissions
- Status management

### Team Management
- Dynamic team creation
- Team lead assignment
- Member management
- Team-based filtering

### Admission Management ⭐ NEW
- Complete student and parent information display
- Payment installment tracking
- Visual payment progress indicators
- Flexible installment recording (any amount, any time)
- Payment timeline with full audit trail
- Payment method tracking
- Transaction ID recording
- Notes for each payment
- Auto-enrollment on full payment
- Role-based payment recording permissions
- Real-time statistics (total, paid, partial, unpaid)
- Advanced filtering (status, payment status, search)
- Invoice download integration

---

## Future Enhancements

### Phase 2 ✅ COMPLETE
- [x] Admissions management page ⭐
- [x] Admission detail page ⭐
- [x] Payment recording system ⭐
- [x] Payment timeline ⭐
- [ ] Change Password modal
- [ ] Date range filter for leads
- [ ] Export improvements (custom columns)
- [ ] Bulk status update
- [ ] Lead import (CSV)
- [ ] Admissions export (CSV)

### Phase 3 (Next Priority)
- [ ] Real-time notifications (WebSocket)
- [ ] Activity logs / Audit trail
- [ ] Advanced analytics dashboard
- [ ] Payment reminders
- [ ] Refund management
- [ ] Email integration
- [ ] WhatsApp integration
- [ ] Payment receipt upload
- [ ] Admission status manual update

### Phase 4 (Future)
- [ ] Learning Management System
- [ ] Course management
- [ ] Student progress tracking
- [ ] Certificates
- [ ] Assignments
- [ ] Video content management
- [ ] Student portal integration

---

## Known Issues & Notes

### Browser Compatibility
- Tested on Chrome, Firefox, Safari, Edge
- Mobile responsive (iOS Safari, Chrome Android)

### Performance Considerations
- React Query caching (stale time configured per query)
- Pagination on all list views (20 items/page)
- Lazy loading of modals
- Optimized re-renders with proper keys
- Progressive loading of payment timeline

### Admissions System Notes ⭐ NEW
- Payment installments tracked with full audit trail
- Auto-enrollment triggered when full payment received (backend)
- Email notifications sent for partial and full payments (backend)
- Invoice generation handled by backend
- Payment progress bars show real-time status
- Role-based payment recording (canManageUsers permission)
- Null-safe rendering for all payment amounts
- Support for both `totalAmount` and legacy `amount` fields
- Payment validation prevents over-payment
- Transaction IDs are optional but recommended for tracking

### Security Notes
- JWT tokens stored in localStorage
- API interceptor adds Authorization header automatically
- 401 responses trigger automatic logout
- Role-based UI restrictions (server-side enforced)
- Payment recording requires authentication and permissions
- Sensitive student data only visible to authorized roles

---

## Development Guidelines

### Code Standards
- Use TypeScript strict mode
- Follow React Query patterns for data fetching
- Use Zustand for global state only
- Prefer server components where possible
- Use shadcn/ui for consistent UI
- Always use null-safe operators for optional data
- Follow established component patterns

### Component Patterns
```typescript
// Page Component
"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
// ... component logic

// UI Component
interface Props { /* typed props */ }
export function Component({ prop }: Props) { /* render */ }

// Null-safe rendering
{admission.payment?.totalAmount?.toLocaleString('en-IN') || 0}
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/feature-name
git commit -m "feat: add feature description"
git push origin feature/feature-name
```

### Commit Message Convention
```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding tests
chore: Build/config changes
```

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- React Query: https://tanstack.com/query
- Zustand: https://zustand-demo.pmnd.rs

### Related Projects
- SkillSnap Backend API (Node.js/Express/MongoDB)
- SkillSnap Marketing Website (Next.js)

---

## Contributors
- **Frontend Developer:** Saquelain
- **Framework:** Next.js 15 + TypeScript
- **Version:** 1.1.0
- **Last Updated:** January 2025

---

## License
Proprietary - SkillSnap Learning Platform

---

## Changelog

### v1.1.0 (January 2025) ⭐ NEW
- ✅ Admissions management system
- ✅ Admission list page with stats and filters
- ✅ Admission detail page with full information
- ✅ Payment recording functionality with validation
- ✅ Payment timeline with installment history
- ✅ Add payment modal with real-time validation
- ✅ Payment progress visualization (bars and percentages)
- ✅ Admission status badges with color coding
- ✅ Payment method tracking and display
- ✅ Auto-refresh after payment recording
- ✅ Role-based payment permissions (canManageUsers)
- ✅ Sidebar navigation updated with Admissions link
- ✅ Invoice download integration
- ✅ Student account creation indicator
- ✅ Null-safe rendering for all payment data
- ✅ Support for flexible installment amounts
- ✅ Transaction ID and notes tracking
- ✅ Responsive design for all admission pages

### v1.0.0 (January 2025)
- ✅ Initial release
- ✅ Login & authentication
- ✅ Dashboard with statistics
- ✅ Lead management (list, detail, assign, notes)
- ✅ User management (CRUD, roles, teams)
- ✅ Team management (CRUD, members)
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Real-time data updates with React Query
- ✅ Toast notifications for user feedback
- ✅ Permission-based UI rendering