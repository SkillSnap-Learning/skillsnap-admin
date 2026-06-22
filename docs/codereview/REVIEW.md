# SkillSnap Admin — Code Review
**Date:** June 2026 · **Branch:** `develop` · **Reviewer:** Claude Code  
**Files read:** All source files in `src/` including all pages, components, lib, stores, types

---

## Severity Key

| Symbol | Meaning |
|--------|---------|
| 🔴 | Critical — security risk or confirmed bug |
| 🟠 | High — likely bug, data loss, or significant degradation |
| 🟡 | Medium — code smell, duplication, wrong pattern |
| 🔵 | Low — polish, consistency, minor improvement |

---

## 1. Security

### 🔴 S1 — JWT stored in `localStorage` is XSS-readable

**Files:** `src/stores/authStore.ts:42`, `src/lib/api.ts:19`

`localStorage` is accessible to any JavaScript running on the page. A single XSS vector — an injected blog preview, a rogue dependency, a DOM-based script injection — gives an attacker the token instantly. The app renders user-generated HTML content (TipTap blogs, FAQ answers) which amplifies this risk.

**Fix:** Store the token in an `httpOnly` cookie. The browser attaches it automatically; JavaScript cannot read it. This also unlocks Next.js middleware-based auth (see N1).

```ts
// Login response: server sets Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
// Axios: add `withCredentials: true`
// Remove all localStorage.getItem("token") calls
```

---

### 🔴 S2 — `NotesPreview` uses `useState` initializer as an async side-effect

**File:** `src/components/topics/ContentUploadPanel.tsx:420–431`

```ts
useState(() => {
  import("@/lib/api")
    .then(({ contentApi }) => contentApi.getNotesSignedUrl(s3Key))
    .then((res) => { setUrl(res.data.data.url); setLoading(false); })
    ...
});
```

`useState`'s initializer is meant to return an initial value synchronously. Running an async API call inside it is undefined behaviour. Two concrete bugs: (1) if `s3Key` changes the URL never refreshes, and (2) the `.then` callback may fire after the component unmounts, causing a state update on an unmounted component.

**Fix:**
```ts
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  contentApi.getNotesSignedUrl(s3Key)
    .then(res => { if (!cancelled) setUrl(res.data.data.url); })
    .catch(err => { if (!cancelled) setError(err.message); })
    .finally(() => { if (!cancelled) setLoading(false); });
  return () => { cancelled = true; };
}, [s3Key]);
```

---

### 🟠 S3 — Token read from `localStorage` directly in 9 XHR upload helpers

**File:** `src/lib/api.ts` — lines 277, 310, 337, 411, 498, 554, 650, 773 (and `ChapterNotesUploadPanel.tsx`)

Every upload helper copies this pattern:
```ts
const token = localStorage.getItem("token");
if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
```

This bypasses the centralised Axios interceptor and is repeated **9 times**. A single extraction fixes all of them:

```ts
// src/lib/api.ts
function xhrUpload(
  url: string,
  body: FormData,
  onProgress?: (pct: number) => void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    const token = localStorage.getItem("token");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(JSON.parse(xhr.responseText))
        : reject(new Error(JSON.parse(xhr.responseText)?.message ?? "Upload failed"));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(body);
  });
}
```

---

### 🟠 S4 — `window.prompt()` used for link URL insertion in TipTap

**File:** `src/components/shared/TipTapEditor.tsx:165`

```ts
const url = window.prompt("Enter URL");
```

`window.prompt()` is synchronous, blocks the thread, cannot validate the URL format, breaks keyboard accessibility, and doesn't work inside iframes. The link button is in the editor toolbar used across Blogs, Finance Blogs, News, and FAQ answers.

**Fix:** Replace with a small inline popover containing a URL `<input>` with basic `https://` prefix validation.

---

### 🟠 S5 — `categoriesApi` write methods missing `/admin/` prefix

**File:** `src/lib/api.ts:617–624`

```ts
create: (data) => api.post('/categories', data),
update: (id, data) => api.patch(`/categories/${id}`, data),
delete: (id) => api.delete(`/categories/${id}`),
```

Every other write endpoint uses `/admin/...`. Verify the backend enforces authentication on `/categories`. If it doesn't, categories are publicly writable.

---

### 🟠 S6 — `financeBlogsApi.uploadImage` shares the same endpoint and R2 keyspace as `blogsApi.uploadImage`

**File:** `src/lib/api.ts:772`

Both post to `/admin/content/upload/blog-image`. If the backend derives the R2 key as `blog-images/{blogId}/image-{ts}.ext`, a finance blog ID could collide with a regular blog ID (both use MongoDB ObjectIds from different collections but the same key prefix). Verify the backend handles this, or use a dedicated endpoint `/admin/content/upload/finance-blog-image`.

---

## 2. Confirmed Bugs

### 🔴 B1 — `NotesPreview` `useState` bug (see S2 above)

### 🟠 B2 — Sidebar `product` state stale on direct URL navigation

**File:** `src/components/layout/Sidebar.tsx:159`

```ts
const [product, setProduct] = useState<Product>(isFinancePath ? "finance" : "learning");
```

`useState` only reads its initialiser on mount. If a user navigates to `/calculators` via the address bar, bookmark, or an external link, the sidebar stays on "Learning" because the component was already mounted. The nav items shown will be wrong.

**Fix:** Derive `product` from `pathname` on every render — no state needed:
```ts
const product = FINANCE_PATHS.some(p => pathname.startsWith(p)) ? "finance" : "learning";
```
Keep the product-switcher buttons if users need to override, but sync them to a `useEffect` watching `pathname`.

---

### 🟠 B3 — `newsApi.getById` hits a public endpoint

**File:** `src/lib/api.ts:479`

```ts
// blogsApi — admin path ✓
getById: (id) => api.get(`/admin/blogs/id/${id}`),

// newsApi — PUBLIC path ✗
getById: (id) => api.get(`/news/id/${id}`),
```

The admin edit form for news loads via the public endpoint. This may return a different response shape, miss unpublished items, or bypass admin middleware on the backend.

---

### 🟠 B4 — Bulk assign fires N parallel HTTP requests with no server-side batch endpoint

**File:** `src/app/(dashboard)/leads/page.tsx:70–83`

```ts
const promises = selectedLeads.map((leadId) => leadsApi.assign(leadId, userId));
await Promise.all(promises);
```

Selecting 20 leads and assigning fires 20 simultaneous POST requests. Any single failure rejects `Promise.all`, leaving partial assignment with no recovery path (no rollback, no retry of failed subset, no indication of which succeeded).

**Fix:** Add a `POST /admin/leads/bulk-assign` endpoint on the backend and use it. Until then, process sequentially with `allSettled` and report partial failures.

---

### 🟠 B5 — `Lead` uses both `id` and `_id` throughout the UI

**File:** `src/components/leads/LeadsTable.tsx:108, 110, 115, 123, 154, 180`

```ts
key={lead.id || lead._id || index}
selectedLeads.includes(lead.id || lead._id)
```

The fallback chain `lead.id || lead._id` appears 6+ times. Using array index as a `key` fallback causes React reconciliation issues on re-render. The backend should normalise to one field; the frontend type should reflect that.

---

### 🟠 B6 — `ChapterNotesUploadPanel` fully duplicates its own Notes section as an Assessment section

**File:** `src/components/chapters/ChapterNotesUploadPanel.tsx`

The component has two identical upload UIs (Notes PDF and Assessment PDF) copy-pasted within itself — 12 state variables (`notesFile`, `notesProgress`, `previewOpen`, `previewUrl`, `previewLoading`, `assessmentFile`, `assessmentProgress`, `assessmentPreviewOpen`, `assessmentPreviewUrl`, `assessmentPreviewLoading`, and 2 refs). Any bug fix or styling change must be applied twice.

**Fix:** Extract a reusable `<UploadSlot>` component accepting `label`, `existingUrl`, `existingFileName`, `onUpload`, `onPreview`.

---

### 🟡 B7 — Nested `<Dialog>` inside `<Dialog>` in `QuestionModal`

**File:** `src/components/questions/QuestionModal.tsx:356–382`

The duplicate-question warning dialog is rendered as a child of the main question dialog. Nested dialogs conflict on focus trapping (both attempt to capture focus), produce two scroll locks simultaneously, and break screen reader navigation. The `onOpenChange` of the outer dialog may also close both when the overlay is clicked.

**Fix:** Lift the warning dialog to a sibling of the main dialog, or use a single dialog that swaps content between question form and warning states.

---

## 3. Architecture & Code Duplication

### 🟡 A1 — Five identical XHR upload functions in `api.ts`

**File:** `src/lib/api.ts`

`blogsApi.uploadImage`, `newsApi.uploadImage`, `coursesApi.uploadImage`, `resourcePagesApi.uploadImage`, `financeBlogsApi.uploadImage` are 30-line copy-pastes of each other. See S3 for the `xhrUpload` helper that eliminates all five.

---

### 🟡 A2 — `ContentUploadPanel` and `ChapterNotesUploadPanel` share the same upload UX with no shared primitives

**Files:** `src/components/topics/ContentUploadPanel.tsx`, `src/components/chapters/ChapterNotesUploadPanel.tsx`

Both panels implement: file picker, file info display, progress bar, cancel/upload buttons, preview dialog. The rendering is identical; only the API call differs. Extract a `<UploadSlot>` component:

```tsx
interface UploadSlotProps {
  label: string;
  accept: string;
  existingName?: string;
  existingUrl?: boolean;
  onUpload: (file: File) => void;
  onPreview?: () => void;
  isPending: boolean;
  progress: number;
}
```

---

### 🟡 A3 — `SidebarContent` defined as a component inside `Sidebar` — remounts on every state change

**File:** `src/components/layout/Sidebar.tsx:179`

```ts
const SidebarContent = () => (...) // ← new component type on every render
```

React sees a different component reference on every render of `Sidebar` and **unmounts then remounts** the entire sidebar content. This resets scroll position, focus, and any internal state on every toggle of `collapsed`, `mobileOpen`, or `product`.

**Fix:** Hoist `SidebarContent` out of `Sidebar` and pass the required values as props.

---

### 🟡 A4 — `QuestionModal` is the only form using `react-hook-form`; all others use 10–14 `useState` calls

**File:** `src/components/questions/QuestionModal.tsx:46–53` vs `src/components/blogs/BlogForm.tsx`

`react-hook-form` is correctly used in `QuestionModal`. `BlogForm` has 14 separate `useState` declarations, a manual dirty ref, manual validation in the submit handler, and a manual debounce. The library is already installed — use it everywhere. It would collapse `BlogForm` by ~100 lines.

---

### 🟡 A5 — `AuthGuard` calls `/auth/me` on every page navigation — no caching

**File:** `src/components/layout/AuthGuard.tsx:40–43`

Every route change triggers an unawaited HTTP round-trip before the page renders. There is no stale time, no React Query caching — just a raw `async/await` in a `useEffect`.

**Fix:** Wrap in React Query with a 5-minute stale time:
```ts
const { isLoading, isError } = useQuery({
  queryKey: ["auth-me"],
  queryFn: () => authApi.getMe().then(r => r.data.data),
  staleTime: 5 * 60 * 1000,
  retry: false,
});
```

---

### 🟡 A6 — `useAuthStore.getState()` called inside render — bypasses React subscriptions

**File:** `src/components/layout/Sidebar.tsx:166–167`

```ts
if (item.permission === "canManageBlog") return useAuthStore.getState().canManageBlog();
```

`getState()` is a snapshot read. React does not subscribe to it. If `user.role` changes (e.g. permissions update without re-login), the sidebar nav will not update until something else triggers a re-render.

**Fix:** Read permission helpers at the top of the component via the hook: `const canManageBlog = useAuthStore(s => s.canManageBlog)`, then pass into `filterNav`.

---

### 🟡 A7 — Dead code in dashboard layout

**File:** `src/app/(dashboard)/layout.tsx:14–22`

```ts
const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // never written
useEffect(() => {
  const checkWidth = () => { /* empty */ };
  checkWidth();
}, []);
```

Both lines and the effect are dead. Delete them.

---

### 🟡 A8 — `BlogForm` autosave: redundant 10-second interval running alongside 2-second debounce

**File:** `src/components/blogs/BlogForm.tsx:135–142`

After the debounce fires at 2 s, the 10 s interval adds nothing. Both run indefinitely in parallel.

**Fix:** Remove the `setInterval`. Keep only the `debounce`.

---

### 🟡 A9 — `getPublished()` fetches up to 100 items for a checkbox list

**File:** `src/lib/api.ts:389`, `src/components/blogs/BlogForm.tsx:259`

The "Related Posts" picker fetches 100 published blogs to render as checkboxes. As content grows this becomes expensive and unusable (100 checkboxes with no search).

**Fix:** Combobox with server-side search — query blogs matching the typed string on demand.

---

### 🟡 A10 — `Header` manages `ChangePasswordModal` state and a `useMutation` on every page

**File:** `src/components/layout/Header.tsx:30–41`

`Header` renders on every dashboard page. It initialises a `useMutation` (the change-password call) and modal state unconditionally on every page load. Move the password modal and its mutation into its own component rendered lazily only when opened.

---

## 4. Type Safety

### 🟡 T1 — `Blog.category` union type forces manual `typeof` checks throughout the UI

**File:** `src/types/index.ts:358`

```ts
category: string | { _id: string; name: string; slug: string };
```

Every consumer writes `typeof b.category === "object" ? b.category.name : b.category`. Fix at the API layer: always return the populated object on reads. Update the type to just `{ _id: string; name: string; slug: string }` and normalise on the `blogsApi` response.

---

### 🟡 T2 — `any` casts in multiple places

| File | Location | Pattern |
|------|----------|---------|
| `BlogForm.tsx` | line 168 | `(blog.category as any)._id` |
| `BlogForm.tsx` | line 175 | `(p: any) =>` for relatedPosts |
| `Sidebar.tsx` | line 164 | `hasRole(role as any)` |
| `QuestionModal.tsx` | line 121 | `onError: (error: any)` |
| `api.ts` | multiple | `Record<string, unknown>` for typed payloads |

Narrow `NavItem.roles` to `UserRole[]`, define typed request body interfaces, and remove all `as any` casts.

---

### 🟡 T3 — `LeadFilters` index signature defeats type narrowing

**File:** `src/types/index.ts:168`

```ts
export interface LeadFilters {
  [key: string]: string | number | undefined; // makes all fields accept string | number
  status?: LeadStatus | "";
  ...
}
```

Remove the index signature. Where a generic `Record<string, unknown>` is needed for query params, convert the typed `LeadFilters` at the call site.

---

### 🟡 T4 — `ContentBlock`, `BlockType`, `ImageAlignment` are dead types

**File:** `src/types/index.ts:405–415`

`Blog` and `News` content moved to a TipTap HTML string (`content: string`). `ContentBlock` and related types are no longer used by any active component. Verify and delete.

---

### 🟡 T5 — `Chapter` type missing `createdBy`; `News` type missing `faqs`/SEO fields

**File:** `src/types/index.ts:289–302, 382–398`

`Chapter` is the only entity without `createdBy`. `News` lacks `faqs`, `faqsTitle`, `metaTitle`, `metaDescription` that `Blog` has. Align the types with the actual backend schema.

---

### 🔵 T6 — Hardcoded colour hex `#1A3A8F` in `QuestionModal`

**File:** `src/components/questions/QuestionModal.tsx:231, 243`

```tsx
className="bg-[#1A3A8F] text-white"
```

The design system uses `bg-blue-950` for the primary colour. This hardcoded hex breaks theming and will silently diverge if the brand colour changes.

**Fix:** Replace with `bg-blue-950`.

---

## 5. Next.js Best Practices

### 🟠 N1 — No `middleware.ts` — auth redirect happens client-side, causing a spinner flash

Every protected page renders (showing a loader) before the redirect fires. Next.js middleware runs at the Edge before any HTML is sent.

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public).*)"],
};
```

Requires moving the token to a cookie (aligns with S1).

---

### 🟠 N2 — Root page ships client JS just to redirect

**File:** `src/app/page.tsx`

`"use client"` + `useEffect` + `router.replace` sends JavaScript to the browser just to redirect. With middleware in place this becomes a zero-JS server redirect:

```ts
// src/app/page.tsx — no "use client"
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/dashboard");
}
```

---

### 🟠 N3 — `next.config.ts` is empty — missing image domains and security headers

**File:** `next.config.ts`

```ts
// Minimal recommended config
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "your-r2-bucket.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "cdn.skillsnaplearning.com" },
    ],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};
```

---

### 🟠 N4 — `tus-js-client` installed but a manual TUS implementation is used instead

**File:** `package.json:53`, `src/components/topics/ContentUploadPanel.tsx:382–412`

The `tus-js-client` library is in `dependencies` but never imported. The hand-rolled `uploadViaTus` function starts chunks from offset 0 every time — it cannot resume a failed upload. The library handles `HEAD` requests for offset recovery, chunk retry with backoff, and network interruption out of the box.

**Fix:**
```ts
import { Upload } from "tus-js-client";

function uploadViaTus(file: File, uploadUrl: string, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    new Upload(file, {
      uploadUrl,
      chunkSize: 5 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000],
      onProgress: (bytes, total) => onProgress(Math.round((bytes / total) * 100)),
      onSuccess: resolve,
      onError: reject,
    }).start();
  });
}
```

---

### 🟡 N5 — All pages are `"use client"` — Server Components not used

Every page in `src/app/(dashboard)/` begins with `"use client"` because it uses React Query hooks directly. The App Router's Server Component model would let you fetch initial data on the server and eliminate loading states on edit/detail pages.

**Pattern for edit pages** (blog edit, finance blog edit, resource page edit):
```ts
// page.tsx — Server Component (no "use client")
export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const [blog, categories] = await Promise.all([
    serverApi.blogs.getById(params.id),   // runs on server, before HTML is sent
    serverApi.categories.getAll(),
  ]);
  return <EditBlogClient blog={blog} categories={categories} />;
}

// EditBlogClient.tsx — "use client"  (BlogForm + useMutation unchanged)
```

This requires `src/lib/api-server.ts` — an Axios instance that reads the auth token from cookies (via `next/headers`) instead of `localStorage`. The mutation layer stays React Query.

---

### 🟡 N6 — No `loading.tsx` or `error.tsx` route segment files

Next.js App Router provides automatic Suspense boundaries and Error Boundaries when you add these files:

- `src/app/(dashboard)/loading.tsx` — shown during route transitions
- `src/app/(dashboard)/error.tsx` — catches render errors for the entire dashboard

Currently there is no error boundary anywhere in the app (see UX section). Adding `error.tsx` covers this automatically.

---

### 🟡 N7 — `<img>` used instead of `next/image`

**Files:** `src/components/blogs/BlogForm.tsx:378`, table thumbnail components

Raw `<img>` misses automatic WebP/AVIF conversion, lazy loading, and prevents layout shift (CLS). Use `next/image` with explicit `width` and `height`.

---

### 🟡 N8 — `next-themes` and `react-hook-form` in `dependencies` but only partially used

- `next-themes` — installed but no `ThemeProvider` or theme toggle exists anywhere. Either implement dark mode or remove it.
- `react-hook-form` — used only in `QuestionModal`. Given the complexity of `BlogForm`, `FinanceBlogForm`, etc., adopt it across all forms or remove the dependency.

---

### 🔵 N9 — `suppressHydrationWarning` on `<body>` is too broad

**File:** `src/app/layout.tsx:38`

This suppresses all hydration warnings on the entire body subtree, masking legitimate mismatches from Zustand SSR state divergence. Apply it only to the specific element affected by browser extensions (usually `<html>`).

---

## 6. Server Actions — Honest Assessment

This project calls an **external Express/MongoDB API**. Server Actions would add a proxy hop:

```
Browser → Next.js server → External API → Next.js server → Browser
```

That adds latency without eliminating a network call.

**Three reasons not to use Server Actions for mutations:**

1. **File uploads need XHR `onprogress`** — TUS video, PDF notes, PDF assessment, cover images, editor images all require progress callbacks. Server Actions cannot provide them. These flows must remain XHR/fetch regardless.

2. **React Query `useMutation` already provides everything** — loading state, error handling, cache invalidation, toast hooks, retry. Replacing it with `useActionState`/`useTransition` removes cache integration.

3. **Toast notifications are client-only** — `onSuccess: () => toast.success(...)` must run in the browser. Server Actions don't simplify this.

**What IS worth adopting: Server Components for initial data on edit pages**

Use Server Components (not Actions) to pre-fetch data for detail/edit pages, eliminating the loading spinner:

| Operation | Recommended | Why |
|-----------|------------|-----|
| Initial page data (edit/detail) | Server Component + `fetch` | No loading spinner, less JS |
| Mutations (create/update/delete) | React Query `useMutation` | Toast, cache, optimistic updates |
| File uploads | XHR with `onprogress` | Only option with progress |
| Auth routing | `middleware.ts` | Edge-speed redirect, no flash |
| Form state | `react-hook-form` | Already installed, reduces boilerplate |
| Server Actions | Not needed | Adds latency, no benefit over React Query |

---

## 7. UX & Accessibility

### 🟡 U1 — Logout in `Header` and `Sidebar` both use `window.location.href`

**Files:** `src/components/layout/Header.tsx:48`, `src/components/layout/Sidebar.tsx:175`

`window.location.href` triggers a full page reload, flushing React Query cache and all in-memory state. Use `router.push("/login")` which is consistent with the rest of the app.

---

### 🟡 U2 — Category filter in blogs page uses hardcoded legacy values

**File:** `src/app/(dashboard)/blogs/page.tsx:86–93`

```tsx
<SelectItem value="featured">Featured</SelectItem>
<SelectItem value="new">New</SelectItem>
<SelectItem value="hot">Hot</SelectItem>
```

Categories are now dynamic (managed via the Categories page). New categories created by content writers will never appear as filter options. Populate the filter from the same `categoriesApi.getAll()` response used by the blog form.

---

### 🟡 U3 — No search debounce — API called on every keystroke

Every search input on list pages (`/leads`, `/blogs`, `/users`, `/news`, etc.) updates the React Query key immediately, firing a request per character. Add a 300 ms debounce using `useEffect` + `clearTimeout` or the `use-debounce` package.

---

### 🟡 U4 — No Error Boundary in the app

Any uncaught render error produces a white screen with no user feedback or recovery. Add `src/app/(dashboard)/error.tsx` (see N6) which Next.js wires up automatically as a React Error Boundary.

---

### 🟡 U5 — FAQ list uses array index as React `key`

**File:** `src/components/blogs/BlogForm.tsx:452`

```tsx
{faqs.map((faq, i) => <div key={i} ...>)}
```

Index keys cause React to reuse DOM nodes incorrectly when items are removed mid-list or reordered. Assign a stable `id` (e.g. `crypto.randomUUID()` or a counter) when an FAQ is added.

---

### 🟡 U6 — Upload panels show no file size limits before selection

Users discover limits only when the server rejects the upload. Show accepted formats and max size inline (e.g. "PDF only, max 50 MB").

---

### 🔵 U7 — Profile menu item does nothing

**File:** `src/components/layout/Header.tsx:85–88`

```tsx
<DropdownMenuItem className="cursor-pointer">
  <User className="mr-2 h-4 w-4" />
  Profile
</DropdownMenuItem>
```

The "Profile" item has no `onClick`. It is a dead link that misleads users. Remove it until a profile page exists, or wire it to a route.

---

### 🔵 U8 — `PdfExtension` uses deprecated HTML attributes

**File:** `src/components/shared/extensions/PdfExtension.ts:35`

```ts
mergeAttributes(HTMLAttributes, { "data-pdf": "true", width: "100%", height: "600", frameborder: "0" })
```

`frameborder` is deprecated in HTML5. `width`/`height` as attributes on `<iframe>` are deprecated in favour of CSS. This affects how TipTap-generated HTML is stored and later rendered on the public site.

**Fix:**
```ts
mergeAttributes(HTMLAttributes, { "data-pdf": "true", style: "width:100%;height:600px;border:0;" })
```

---

## 8. Master Priority Table

| # | Severity | Category | Issue | File(s) |
|---|----------|----------|-------|---------|
| S1 | 🔴 | Security | JWT in `localStorage` — XSS risk | `authStore.ts`, `api.ts` |
| S2 | 🔴 | Bug | `useState` used as `useEffect` for async fetch | `ContentUploadPanel.tsx:420` |
| S3 | 🟠 | Security | Token read from localStorage 9× in XHR helpers | `api.ts` |
| S4 | 🟠 | Security | `window.prompt()` for link URL | `TipTapEditor.tsx:165` |
| S5 | 🟠 | Security | `categoriesApi` write endpoints missing `/admin/` prefix | `api.ts:617` |
| S6 | 🟠 | Security | Finance blog image endpoint collides with blog images in R2 | `api.ts:772` |
| B1 | 🔴 | Bug | `NotesPreview` — see S2 | |
| B2 | 🟠 | Bug | Sidebar product state stale on URL navigation | `Sidebar.tsx:159` |
| B3 | 🟠 | Bug | `newsApi.getById` hits public endpoint | `api.ts:479` |
| B4 | 🟠 | Bug | Bulk assign fires N parallel requests, no batch endpoint | `leads/page.tsx:70` |
| B5 | 🟠 | Bug | `lead.id \|\| lead._id` fallback used as React key | `LeadsTable.tsx:108` |
| B6 | 🟠 | Bug | `ChapterNotesUploadPanel` duplicates Notes/Assessment UI | `ChapterNotesUploadPanel.tsx` |
| B7 | 🟡 | Bug | Nested `<Dialog>` inside `<Dialog>` — focus trap conflict | `QuestionModal.tsx:356` |
| A1 | 🟡 | Architecture | 5× identical XHR upload functions | `api.ts` |
| A2 | 🟡 | Architecture | `ContentUploadPanel` & `ChapterNotesUploadPanel` no shared primitives | both files |
| A3 | 🟡 | Architecture | `SidebarContent` inside `Sidebar` — remounts on every state change | `Sidebar.tsx:179` |
| A4 | 🟡 | Architecture | `react-hook-form` used only in `QuestionModal`; all others use 10–14 `useState` | `BlogForm.tsx` |
| A5 | 🟡 | Architecture | `AuthGuard` calls `/auth/me` uncached on every navigation | `AuthGuard.tsx:40` |
| A6 | 🟡 | Architecture | `useAuthStore.getState()` in render — no React subscription | `Sidebar.tsx:166` |
| A7 | 🟡 | Architecture | Dead `useEffect` + unused state in dashboard layout | `layout.tsx:14` |
| A8 | 🟡 | Architecture | Redundant 10-second autosave interval alongside 2-second debounce | `BlogForm.tsx:135` |
| A9 | 🟡 | Architecture | `getPublished()` fetches 100 items for checkbox list | `api.ts:389` |
| A10 | 🟡 | Architecture | `Header` manages ChangePassword mutation on every page | `Header.tsx:30` |
| T1 | 🟡 | Types | `Blog.category` union forces `typeof` checks everywhere | `types/index.ts:358` |
| T2 | 🟡 | Types | `any` casts in BlogForm, Sidebar, QuestionModal | multiple |
| T3 | 🟡 | Types | `LeadFilters` index signature defeats type narrowing | `types/index.ts:168` |
| T4 | 🟡 | Types | `ContentBlock`/`BlockType`/`ImageAlignment` are dead types | `types/index.ts:405` |
| T5 | 🟡 | Types | `Chapter` missing `createdBy`; `News` missing FAQs/SEO fields | `types/index.ts` |
| T6 | 🔵 | Types | Hardcoded `#1A3A8F` hex instead of design token `blue-950` | `QuestionModal.tsx:231` |
| N1 | 🟠 | Next.js | No `middleware.ts` — auth redirect is client-side | missing file |
| N2 | 🟠 | Next.js | Root page ships JS just to redirect | `app/page.tsx` |
| N3 | 🟠 | Next.js | `next.config.ts` empty — no image domains, no security headers | `next.config.ts` |
| N4 | 🟠 | Next.js | `tus-js-client` installed but manual (non-resumable) TUS used | `ContentUploadPanel.tsx:382` |
| N5 | 🟡 | Next.js | All pages `"use client"` — no Server Components for initial data | all `page.tsx` |
| N6 | 🟡 | Next.js | No `loading.tsx` or `error.tsx` route segment files | `(dashboard)/` |
| N7 | 🟡 | Next.js | `<img>` instead of `next/image` | `BlogForm.tsx`, tables |
| N8 | 🟡 | Next.js | `next-themes` unused; `react-hook-form` used only in one form | `package.json` |
| N9 | 🔵 | Next.js | `suppressHydrationWarning` on `<body>` is too broad | `app/layout.tsx` |
| U1 | 🟡 | UX | `window.location.href` for logout in Header and Sidebar | both files |
| U2 | 🟡 | UX | Blog category filter hardcoded — new categories never appear | `blogs/page.tsx:86` |
| U3 | 🟡 | UX | No search debounce — API called on every keystroke | all list pages |
| U4 | 🟡 | UX | No Error Boundary anywhere in the app | — |
| U5 | 🟡 | UX | FAQ list uses array index as React `key` | `BlogForm.tsx:452` |
| U6 | 🟡 | UX | Upload panels show no file size limit | `ContentUploadPanel.tsx` |
| U7 | 🔵 | UX | Profile menu item is a dead link | `Header.tsx:85` |
| U8 | 🔵 | UX | `PdfExtension` uses deprecated HTML attributes | `PdfExtension.ts:35` |

---

## 9. Recommended Fix Roadmap

### Sprint 1 — Stop the bleeding (security + confirmed bugs)
1. **S2/B1** — Fix `NotesPreview` `useState → useEffect` (30 min, isolated)
2. **S3/A1** — Extract `xhrUpload` helper, replace all 9 call sites (2 h)
3. **S5** — Verify `categoriesApi` backend auth, add `/admin/` prefix if needed
4. **B3** — Fix `newsApi.getById` to use admin endpoint
5. **B7** — Lift duplicate-warning dialog out of `QuestionModal` nesting
6. **U4/N6** — Add `src/app/(dashboard)/error.tsx` (15 min)

### Sprint 2 — Architecture cleanup
7. **A3** — Hoist `SidebarContent` out of `Sidebar` (1 h)
8. **B2/A6** — Fix sidebar product state derivation from `pathname`
9. **A5** — Cache `/auth/me` in React Query inside `AuthGuard`
10. **A7** — Delete dead layout state
11. **B6/A2** — Extract `<UploadSlot>` component used by both upload panels
12. **A8** — Remove redundant autosave interval in `BlogForm`
13. **U1** — Replace `window.location.href` logout with `router.push`

### Sprint 3 — Next.js & performance
14. **S1/N1** — JWT → `httpOnly` cookie + `middleware.ts` auth (largest change, test thoroughly)
15. **N2** — Root page → server redirect
16. **N3** — Populate `next.config.ts` with image domains and security headers
17. **N4** — Replace manual TUS with `tus-js-client` (uses installed but unused package)
18. **N5** — Convert blog/finance/resource edit pages to Server Components + split client layer
19. **U3** — Add 300 ms search debounce to all list pages
20. **U2** — Make blog category filter dynamic from API

### Backlog
21. **B4** — Backend bulk-assign endpoint + frontend update
22. **A4/N8** — Adopt `react-hook-form` in BlogForm and FinanceBlogForm
23. **A9** — Replace related-posts checkbox with a search combobox
24. **T1** — Normalise `Blog.category` to always return populated object
25. **T4** — Delete dead `ContentBlock`/`BlockType` types
26. **U5** — Stable keys for FAQ list
27. **T6/U8** — Replace `#1A3A8F` with `blue-950`; fix `PdfExtension` deprecated attributes
28. **U7** — Remove dead "Profile" menu item or implement a profile page

---

*Generated by full codebase review — June 2026 · `develop` branch*
