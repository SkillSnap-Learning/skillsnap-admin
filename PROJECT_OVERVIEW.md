# SKILLSNAP ADMIN PANEL - PROJECT OVERVIEW

## Project Summary
A comprehensive Next.js-based admin panel for SkillSnap Learning CRM. Features multi-role authentication, lead management, user management, team management, and role-based access control. Designed to work with the SkillSnap Backend API.

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
│   │   │   └── Sidebar.tsx           # Navigation sidebar
│   │   ├── leads/
│   │   │   ├── AssignLeadModal.tsx   # Lead assignment modal
│   │   │   ├── AssignmentHistory.tsx # Assignment history display
│   │   │   ├── LeadFilters.tsx       # Search & filter controls
│   │   │   ├── LeadInfoCard.tsx      # Lead contact info card
│   │   │   ├── LeadStatusBadge.tsx   # Status badge with dropdown
│   │   │   ├── LeadsTable.tsx        # Main leads table
│   │   │   └── NotesTimeline.tsx     # Notes timeline with add form
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
│   │   ├── api.ts                    # Axios client & API functions
│   │   └── utils.ts                  # Utility functions (cn, formatters)
│   │
│   ├── stores/
│   │   └── authStore.ts              # Zustand auth store
│   │
│   └── types/
│       └── index.ts                  # TypeScript interfaces
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
| Users | ✅ | ✅ | ✅ Team | ❌ | ❌ |
| Teams | ✅ | ✅ | ✅ | ❌ | ❌ |
| Courses | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ Instructor |
| Chapters | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ Instructor |
| Questions | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ Instructor |
| Content Upload | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ Instructor |
| Templates | ✅ | ✅ | ❌ | ❌ | ❌ |

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

### 5. Users Page (`/users`)
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

### 6. Teams Page (`/teams`)
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

### 7. Courses Page (`/courses`)
- **Filters:**
  - Search by title
  - Class filter (6-10)
  - Subject filter
- **Table Display:**
  - Course title, class, subject
  - Total chapters count
  - Created date
- **Actions:**
  - Create/Edit/Delete courses
  - Navigate to chapters

### 8. Chapters Page (`/chapters`)
- **Filters:**
  - Search by title
  - Course filter
- **Table Display:**
  - Chapter number, title, course
  - Video duration, content status
  - Unlock thresholds (watch/test %)
- **Actions:**
  - Create/Edit/Delete chapters
  - Navigate to questions

### 9. Questions Page (`/questions`)
- **Filters:**
  - Search by text
  - Course/Chapter filters
  - Difficulty filter
- **Table Display:**
  - Question text, chapter
  - Difficulty, correct answer
  - Image indicators
- **Actions:**
  - Create/Edit/Delete questions (MCQ with 4 options)

### 10. Content Upload Page (`/content-upload`)
- Select course → chapter
- Upload video to Cloudflare Stream
- Upload PDF notes to R2
- Auto-updates chapter document

### 11. Notification Templates Page (`/notification-templates`)
- **Table Display:**
  - Type, title, message preview
  - Active/Inactive status
- **Actions:**
  - Create/Edit templates
  - Toggle active status
- **Supported Types:**
  - achievement, reminder, announcement
  - instructor_reply, chapter_unlocked, test_passed
- **Placeholders:** {studentName}, {chapterName}, {courseName}, {score}, {streak}

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
| **Courses** | `/admin/courses` | GET | List courses |
| | `/admin/courses` | POST | Create course |
| | `/admin/courses/:id` | GET/PATCH/DELETE | Manage course |
| **Chapters** | `/admin/chapters` | GET | List chapters |
| | `/admin/chapters/course/:id` | GET | Get by course |
| | `/admin/chapters` | POST | Create chapter |
| | `/admin/chapters/:id` | GET/PATCH/DELETE | Manage chapter |
| **Questions** | `/admin/questions` | GET | List questions |
| | `/admin/questions/chapter/:id` | GET | Get by chapter |
| | `/admin/questions` | POST | Create question |
| | `/admin/questions/:id` | GET/PATCH/DELETE | Manage question |
| **Content** | `/admin/content/upload/video` | POST | Upload to Stream |
| | `/admin/content/upload/notes` | POST | Upload PDF to R2 |
| | `/admin/content/upload/question-image` | POST | Upload image to R2 |
| **Templates** | `/admin/notification-templates` | GET/POST | List/Create |
| | `/admin/notification-templates/:id` | GET/PATCH/DELETE | Manage template |

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

---

## Future Enhancements

### Phase 2 (Planned)
- [ ] Change Password modal
- [ ] Date range filter for leads
- [ ] Export improvements (custom columns)
- [ ] Bulk status update
- [ ] Lead import (CSV)

### Phase 3 (Future)
- [ ] Real-time notifications (WebSocket)
- [ ] Activity logs / Audit trail
- [ ] Advanced analytics dashboard
- [ ] Email integration
- [ ] WhatsApp integration

### Phase 4 (Future)
- [ ] Learning Management System
- [ ] Course management
- [ ] Student enrollment
- [ ] Payment integration

---

## Known Issues & Notes

### Browser Compatibility
- Tested on Chrome, Firefox, Safari, Edge
- Mobile responsive (iOS Safari, Chrome Android)

### Performance Considerations
- React Query caching (1 minute stale time)
- Pagination on all list views (20 items/page)
- Lazy loading of modals
- Optimized re-renders with proper keys

### Security Notes
- JWT tokens stored in localStorage
- API interceptor adds Authorization header
- 401 responses trigger automatic logout
- Role-based UI restrictions (server enforced)

---

## Development Guidelines

### Code Standards
- Use TypeScript strict mode
- Follow React Query patterns for data fetching
- Use Zustand for global state only
- Prefer server components where possible
- Use shadcn/ui for consistent UI

### Component Patterns
```typescript
// Page Component
"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
// ... component logic

// UI Component
interface Props { /* typed props */ }
export function Component({ prop }: Props) { /* render */ }
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/feature-name
git commit -m "feat: add feature description"
git push origin feature/feature-name
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
- **Version:** 2.0.0  
- **Last Updated:** February 2026

---

## License
Proprietary - SkillSnap Learning Platform