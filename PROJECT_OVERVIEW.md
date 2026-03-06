# SKILLSNAP ADMIN PANEL - PROJECT OVERVIEW

## Project Summary
A comprehensive Next.js-based admin panel for SkillSnap Learning CRM. Features multi-role authentication, lead management, user management, team management, role-based access control, and a full learning content management system (Plans → Subjects → Chapters → Topics → Questions) with inline video/notes upload and preview.

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
- **HTTP Client:** Axios + XHR (for upload progress)

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
│   │   ├── (dashboard)/                        # Protected routes group
│   │   │   ├── layout.tsx                      # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                    # Main dashboard with stats
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx                    # Leads listing
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx                # Lead detail page
│   │   │   ├── users/
│   │   │   │   └── page.tsx                    # Users management
│   │   │   ├── teams/
│   │   │   │   └── page.tsx                    # Teams management
│   │   │   ├── plans/
│   │   │   │   ├── page.tsx                    # Plans list
│   │   │   │   └── [planId]/
│   │   │   │       └── subjects/
│   │   │   │           ├── page.tsx            # Subjects list (with class filter)
│   │   │   │           └── [subjectId]/
│   │   │   │               └── chapters/
│   │   │   │                   ├── page.tsx    # Chapters list
│   │   │   │                   └── [chapterId]/
│   │   │   │                       └── topics/
│   │   │   │                           ├── page.tsx          # Topics list + inline upload
│   │   │   │                           └── [topicId]/
│   │   │   │                               └── questions/
│   │   │   │                                   └── page.tsx  # Questions list
│   │   │   └── notification-templates/
│   │   │       └── page.tsx                    # Notification templates
│   │   ├── login/
│   │   │   └── page.tsx                        # Login page
│   │   ├── globals.css                         # Global styles + CSS variables
│   │   ├── layout.tsx                          # Root layout with providers
│   │   └── page.tsx                            # Root redirect
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentLeadsTable.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── StatsCardSkeleton.tsx
│   │   ├── layout/
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── leads/
│   │   │   ├── AssignLeadModal.tsx
│   │   │   ├── AssignmentHistory.tsx
│   │   │   ├── LeadFilters.tsx
│   │   │   ├── LeadInfoCard.tsx
│   │   │   ├── LeadStatusBadge.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   └── NotesTimeline.tsx
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   ├── teams/
│   │   │   ├── TeamMembersModal.tsx
│   │   │   ├── TeamModal.tsx
│   │   │   └── TeamsTable.tsx
│   │   ├── users/
│   │   │   ├── UserModal.tsx
│   │   │   └── UsersTable.tsx
│   │   ├── plans/
│   │   │   ├── PlansTable.tsx
│   │   │   └── PlanModal.tsx
│   │   ├── subjects/
│   │   │   ├── SubjectsTable.tsx
│   │   │   └── SubjectModal.tsx
│   │   ├── chapters/
│   │   │   ├── ChaptersTable.tsx
│   │   │   └── ChapterModal.tsx
│   │   ├── topics/
│   │   │   ├── TopicsTable.tsx
│   │   │   ├── TopicModal.tsx
│   │   │   └── ContentUploadPanel.tsx          # Inline video + notes upload + preview
│   │   ├── questions/
│   │   │   ├── QuestionsTable.tsx
│   │   │   └── QuestionModal.tsx
│   │   └── ui/                                 # shadcn/ui components
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── pagination.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── table.tsx
│   │       └── textarea.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                              # Axios client & all API functions
│   │   └── utils.ts                            # Utility functions (cn, formatters)
│   │
│   ├── stores/
│   │   └── authStore.ts                        # Zustand auth store
│   │
│   └── types/
│       └── index.ts                            # TypeScript interfaces
│
├── public/
├── .env.local
├── .env.example
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── PROJECT_OVERVIEW.md
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

| Page | SuperAdmin | Admin | Sales Manager | Team Lead | Sales | Instructor |
|------|------------|-------|---------------|-----------|-------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leads | ✅ All | ✅ All | ✅ All | ✅ Team | ✅ Own | ❌ |
| Users | ✅ | ✅ | ✅ Team | ❌ | ❌ | ❌ |
| Teams | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Plans | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Subjects | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Chapters | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Topics | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Questions | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Templates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

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
| Manage Content | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Pages & Features

### 1. Login Page (`/login`)
- Email & password authentication
- Show/hide password toggle
- Error handling with toast notifications
- Redirects to dashboard on success
- JWT token stored in localStorage

### 2. Dashboard (`/dashboard`)
- Stats Cards: Total, New, Converted, Unassigned, Contacted, Lost, Assigned Leads
- Quick Actions: Auto-Assign (role-restricted), Export CSV (role-restricted)
- Recent Leads Table: latest 5 leads with quick status update

### 3. Leads Page (`/leads`)
- Filters: Search, Status, Source, Assigned To, Team
- Table: bulk selection, inline status dropdown, row actions
- Bulk Actions: assign selected leads
- Pagination: 20 items/page

### 4. Lead Detail Page (`/leads/[id]`)
- Lead Info Card: contact details, source, team assignment, message
- Quick Actions: status dropdown, assign/reassign
- Notes Timeline: chronological, add new note, author + timestamp
- Assignment History: reason (manual/auto/reassigned), who assigned & when

### 5. Users Page (`/users`)
- Filters: search, role, status
- Table: avatar (initials), name, email, role badge, team, status, created date
- Actions: create, edit, reset password, delete (SuperAdmin only)
- Modal: name, email, phone, password, role, team, status

### 6. Teams Page (`/teams`)
- Filters: search, status
- Table: name, description, team lead, member count, status, created date
- Actions: create, edit, manage members, delete (SuperAdmin/Admin)
- Members Modal: add from dropdown, remove with X

### 7. Plans Page (`/plans`)
- Table: name, slug (code), type (Guest/Paid), price, status, created date
- Actions: create, edit, delete, drill-down to subjects (→)
- Modal: name, slug, description, plan type (paid/guest), price fields (hidden for guest), status
- Entry point to the full content hierarchy

### 8. Subjects Page (`/plans/[planId]/subjects`)
- Breadcrumb: Plans → {Plan Name}
- Class filter: All | Class 6–10 (dropdown)
- Table: subject name (badge with colour), class, description, status, created date
- Actions: create, edit, delete, drill-down to chapters (→)
- Modal: subject name (enum), class, description, status
- Duplicate prevention: planId + name + class must be unique

### 9. Chapters Page (`/plans/[planId]/subjects/[subjectId]/chapters`)
- Breadcrumb: Plans → {Plan} → {Subject (Class N)}
- Table: chapter number, title, description, status, created date
- Actions: create, edit, delete, drill-down to topics (→)
- Modal: chapter number (disabled on edit), title, description, status
- Chapter number locked after creation

### 10. Topics Page (`/plans/[planId]/subjects/[subjectId]/chapters/[chapterId]/topics`)
- Breadcrumb: Plans → {Plan} → {Subject} → {Chapter}
- Table: topic number, title, video status badge, notes status, min watch %, min test %, status, created date
- Actions: create, edit, delete, upload content (↑), drill-down to questions (→)
- Modal: topic number (disabled on edit), title, description, min watch %, min test %, status
- **Inline Content Upload Panel** (toggles per topic row):
  - Video section: file info, TUS resumable upload progress bar, replace/upload button, preview (Eye icon)
  - Notes section: file info, XHR upload progress bar, replace/upload button, preview (Eye icon)
  - Video preview: Cloudflare Stream iframe embed in Dialog
  - PDF preview: signed R2 URL rendered in iframe via Dialog
  - Both sections show filename + status badge when content exists

### 11. Questions Page (`/plans/.../topics/[topicId]/questions`)
- Breadcrumb: full hierarchy shown
- Badge: question count, warning if < 5 (minimum for test)
- Table: #, question text + explanation, options (A–D with correct highlighted green), answer badge, difficulty badge
- Actions: create, edit, delete
- Modal: question textarea, 4 option inputs with clickable letter buttons (click to select correct answer), difficulty select, explanation textarea

### 12. Notification Templates Page (`/notification-templates`)
- Table: type, title, message preview, active/inactive badge
- Actions: create/edit templates, toggle active status
- Supported Types: achievement, reminder, announcement, instructor_reply, chapter_unlocked, test_passed, child_test_passed, child_chapter_unlocked, weekly_progress, parent_announcement
- Placeholders: {studentName}, {topicName}, {chapterName}, {score}, {streak}

---

## Navigation Flow (Content Hierarchy)

```
Sidebar: Plans
    → /plans                               (list all plans)
        → Click → /plans/[planId]/subjects (list subjects, filter by class)
            → Click → .../chapters         (list chapters)
                → Click → .../topics       (list topics + inline upload)
                    → Click → .../questions (list + manage questions)
```

Each page shows a **breadcrumb** with clickable links to parent levels.

---

## Content Upload (Inline — Topics Page)

### Video Upload (TUS Resumable)
1. Click Upload icon on topic row → ContentUploadPanel opens
2. Select video file → file name + size shown
3. Click Upload → calls `POST /admin/content/upload/video/start` for TUS URL
4. Uploads via TUS PATCH requests with 5MB chunks
5. Progress bar updates in real time
6. On success: topic table refreshes, videoStatus → uploading (Cloudflare processes async)
7. Webhook (`POST /content/webhook/stream`) updates videoStatus → ready when done

### Notes Upload (PDF)
1. Select PDF file → file name + size shown
2. Click Upload → XHR `POST /admin/content/upload/notes` with `topicId`
3. Progress bar updates via XHR `upload.onprogress`
4. Backend: uploads to R2, updates `topic.notesUrl` + `topic.notesFileName`
5. On success: topic table refreshes

### Preview
- **Video**: Cloudflare Stream iframe (`https://iframe.cloudflarestream.com/{streamId}`)
- **PDF**: `GET /admin/content/notes/signed-url?key=` → signed R2 URL → iframe

---

## API Integration

### Base Configuration
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
```

### API Functions in `src/lib/api.ts`

| Export | Endpoints Used | Purpose |
|--------|---------------|---------|
| `authApi` | `/auth/login`, `/auth/me`, `/auth/change-password` | Authentication |
| `leadsApi` | `/admin/leads/*` | Lead management |
| `usersApi` | `/admin/users/*` | User management |
| `teamsApi` | `/admin/teams/*` | Team management |
| `plansApi` | `/admin/plans/*` | Plan CRUD |
| `subjectsApi` | `/admin/subjects/*`, `/admin/subjects/plan/:planId` | Subject CRUD |
| `chaptersApi` | `/admin/chapters/*`, `/admin/chapters/subject/:subjectId` | Chapter CRUD |
| `topicsApi` | `/admin/topics/*`, `/admin/topics/chapter/:chapterId` | Topic CRUD |
| `questionsApi` | `/admin/questions/*`, `/admin/questions/topic/:topicId` | Question CRUD |
| `contentApi` | `/admin/content/upload/*`, `/admin/content/notes/signed-url` | Upload + preview |
| `notificationTemplatesApi` | `/admin/notification-templates/*` | Template management |

### Key API Methods

```typescript
// TUS video upload
contentApi.createVideoUploadUrl(fileName, fileSize, topicId)

// Notes upload with progress (XHR)
contentApi.uploadNotesWithProgress(file, topicId, onProgress)

// Signed URL for PDF preview
contentApi.getNotesSignedUrl(s3Key)

// Subject filtered by plan + class
subjectsApi.getByPlan(planId, classFilter?)

// Chapters filtered by subject
chaptersApi.getBySubject(subjectId)

// Topics filtered by chapter
topicsApi.getByChapter(chapterId)

// Questions filtered by topic
questionsApi.getByTopic(topicId)
```

---

## TypeScript Types (`src/types/index.ts`)

```typescript
// Learning Platform
interface Plan { _id, name, slug, description, isGuestPlan, price{amount, originalAmount, currency}, isActive, createdBy, createdAt, updatedAt }
interface Subject { _id, planId, name: SubjectName, class: ClassType, description, isActive, createdBy, createdAt, updatedAt }
interface Chapter { _id, subjectId, chapterNumber, title, description, isActive, createdBy, createdAt, updatedAt }
interface Topic { _id, chapterId, topicNumber, title, description, videoUrl, videoStatus, videoFileName, videoDuration, notesUrl, notesFileName, minimumWatchPercentage, minimumTestPercentage, isActive, createdBy, createdAt, updatedAt }
interface Question { _id, topicId, questionText, options[4], correctAnswer, explanation, difficulty, isActive, createdAt, updatedAt }

type SubjectName = 'maths' | 'science' | 'english' | 'social_science' | 'coding' | 'life_skills' | 'general'
type ClassType = '6' | '7' | '8' | '9' | '10'
type DifficultyType = 'easy' | 'medium' | 'hard'
```

---

## State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user, token) => void;
  logout: () => void;
  hasPermission: (permission) => boolean;
  hasRole: (...roles) => boolean;
  canManageUsers: () => boolean;
  canManageTeams: () => boolean;
  canManageContent: () => boolean;
  canAssignLeads: () => boolean;
  canExportLeads: () => boolean;
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
3. Set `NEXT_PUBLIC_API_URL` environment variable
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
Type    Name    Value                   TTL
CNAME   admin   cname.vercel-dns.com   600
```

---

## Design System

### Colors (CSS Variables)
```css
--primary: #0c1e3d;   /* Blue 950 - Main brand */
--accent: #ea580c;    /* Orange 600 - Accent */
--background: #ffffff;
--foreground: #0c1e3d;
--muted: #f1f5f9;     /* Slate 100 */
--border: #e2e8f0;    /* Slate 200 */
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
| Video Ready | `bg-green-100` | `text-green-700` |
| Video Uploading | `bg-yellow-100` | `text-yellow-700` |
| Video None | `bg-slate-100` | `text-slate-600` |
| Guest Plan | `bg-orange-100` | `text-orange-700` |
| Paid Plan | `bg-blue-100` | `text-blue-700` |

### Subject Badge Colors
| Subject | Background | Text |
|---------|------------|------|
| Maths | `bg-blue-100` | `text-blue-700` |
| Science | `bg-green-100` | `text-green-700` |
| English | `bg-purple-100` | `text-purple-700` |
| Social Science | `bg-orange-100` | `text-orange-700` |
| Coding | `bg-pink-100` | `text-pink-700` |
| Life Skills | `bg-teal-100` | `text-teal-700` |
| General | `bg-slate-100` | `text-slate-700` |

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

### Phase 4 (Future — LMS)
- [ ] Student enrollment dashboard
- [ ] Student progress monitoring per plan
- [ ] Bulk question import (CSV)
- [ ] Topic reordering (drag and drop)
- [ ] Video processing status polling

---

## Known Issues & Notes

### Browser Compatibility
- Tested on Chrome, Firefox, Safari, Edge
- Mobile responsive (iOS Safari, Chrome Android)

### Performance Considerations
- React Query caching (1 minute stale time)
- Pagination on all list views (20 items/page)
- Lazy loading of modals
- `createdAt` null-guarded in all tables (avoids `Invalid time value` error on fresh creates)

### Security Notes
- JWT tokens stored in localStorage
- API interceptor adds Authorization header
- 401 responses trigger automatic logout
- Role-based UI restrictions (server enforced)
- `topicId` stripped from question update payload (cannot change topic after creation)

---

## Development Guidelines

### Code Standards
- TypeScript strict mode
- React Query for all server state
- Zustand for auth/global state only
- shadcn/ui for consistent UI primitives
- All table pages follow: Filters → Table → Modal → ConfirmDialog pattern

### Component Patterns
```typescript
// Page: drill-down with breadcrumb + useParams
const { planId, subjectId } = useParams<{ planId: string; subjectId: string }>();

// Table: accepts data + isLoading + onEdit + onDelete + drill-down IDs
// Modal: accepts open + onClose + entity? + parentId(s)
// ConfirmDialog: open + onConfirm + title + description + isDestructive
```

### Git Workflow
```bash
git checkout -b feature/feature-name
git commit -m "feat: description"
git push origin feature/feature-name
```

---

## Support & Resources

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
- **Version:** 3.0.0
- **Last Updated:** March 2026

---

## Changelog

### v3.0.0 (March 2026) — Content Hierarchy Restructure
- ✅ Replaced Courses/Chapters/Questions/Content Upload pages with new hierarchy
- ✅ Plans page (`/plans`) — CRUD, guest vs paid badge, price display
- ✅ Subjects page (`/plans/[planId]/subjects`) — class filter, subject name badges
- ✅ Chapters page (nested under subject) — simplified (no video/notes fields)
- ✅ Topics page (nested under chapter) — video status, notes status, min thresholds
- ✅ Questions page (nested under topic) — MCQ with clickable correct answer selector
- ✅ ContentUploadPanel — inline per-topic, replaces standalone content-upload page
- ✅ TUS resumable video upload with real-time progress bar
- ✅ XHR notes PDF upload with real-time progress bar
- ✅ Video preview via Cloudflare Stream iframe
- ✅ PDF preview via signed R2 URL iframe
- ✅ Breadcrumb navigation on all nested pages
- ✅ Updated TypeScript types (Plan, Subject, Topic, updated Chapter/Question)
- ✅ Updated api.ts (plansApi, subjectsApi, topicsApi, updated chaptersApi/questionsApi/contentApi)
- ✅ Sidebar updated: Courses/Chapters/Questions/Content Upload → Plans (single entry point)
- ✅ `createdAt` null-guard on all table date cells
- ✅ `topicId` stripped from question update payload
- ✅ Old `/courses`, `/chapters`, `/questions`, `/content-upload` pages removed

### v2.0.0 (February 2026) — Learning Platform Pages
- ✅ Courses, Chapters, Questions, Content Upload pages
- ✅ Notification Templates page
- ✅ canManageContent permission gating in sidebar

### v1.0.0 (January 2026) — CRM Core
- ✅ Login, Dashboard, Leads, Lead Detail
- ✅ Users, Teams management
- ✅ Role-based access control
- ✅ JWT auth with auto-logout on 401

---

## License
Proprietary - SkillSnap Learning Platform