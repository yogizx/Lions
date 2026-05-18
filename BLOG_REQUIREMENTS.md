# Lions Blog System — Full Feature Requirements

> **Tech Stack:** React + Vite + TailwindCSS + Supabase (no localStorage)  
> **Scope:** BlogPages.jsx · AdminDashboard.jsx · BloggerDashboard.jsx · blogsData.js  

---

## 1. Blog Listing Page (`/blogs`) — Banner Image

**File:** `src/pages/blog/BlogPages.jsx` → `Blogs()` component

### Current State
The hero section is a plain dark `bg-[#061b3a]` div with text only.

### Required Change
- Replace the plain dark hero with a **full-width banner image**.
- The image source should be pulled from a **Supabase setting** (table: `settings`, key: `blog_banner_image`) so the admin can update it without code changes.
- Overlay a dark gradient (`from-[#061b3a]/80`) on top of the image so white text stays readable.
- Keep existing heading, subtitle, and search bar — just put them on top of the image.
- Fallback: if no banner image is set, show the current plain dark background.
- Banner height: `h-[50vh] md:h-[60vh]`, `object-cover`.
- Mobile friendly — image must not overflow or distort on small screens.

**Supabase query (blogsData.js):**
```js
export async function getBlogBannerImage() {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'blog_banner_image')
    .single();
  return data?.value || null;
}
```

---

## 2. Blog Detail Page — Comments Section with CAPTCHA

**File:** `src/pages/blog/BlogPages.jsx` → `BlogDetail()` component

### Current State
Comment form already exists below the content. CAPTCHA (math addition) is already implemented. `saveComment()` sends to Supabase with `status: 'pending'`.

### What Needs Fixing / Confirming
- ✅ Comment form is **below the blog content** — keep this.
- ✅ CAPTCHA math challenge is implemented — keep this.
- ✅ `saveComment()` writes to Supabase `comments` table with `status: 'pending'`.
- ⚠️ **Verify** the `comments` table exists in Supabase with columns: `id, blog_id, name, text, status ('pending'|'approved'|'rejected'), created_at`.
- ⚠️ The comment submission must **not** use localStorage — confirm Supabase insert is working.

---

## 3. Blog Detail Page — Approved Comments in Right Sidebar

**File:** `src/pages/blog/BlogPages.jsx` → `BlogDetail()` → Right Sidebar

### Current State
The sidebar already has a "Verified Comments" section that loads `getApprovedCommentsForBlog(blog.id)`.

### What Needs Confirming / Improving
- ✅ Approved comments show in the **right sidebar** — correct placement.
- ⚠️ `getApprovedCommentsForBlog()` must query Supabase `comments` table filtering `blog_id = blog.id AND status = 'approved'`.
- Add **real-time or polling refresh** so when an admin approves a comment it shows without page reload (optional: poll every 30s or use Supabase Realtime).
- Show commenter name, comment text, and formatted date.
- Show "No comments yet" empty state if zero approved comments.

**Supabase query (blogsData.js):**
```js
export async function getApprovedCommentsForBlog(blogId) {
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_id', blogId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  return data || [];
}
```

---

## 4. Admin Dashboard — Publish Button Loading Animation

**File:** `src/pages/admin/AdminDashboard.jsx`

### Current State
`isSaving` state exists. The publish/save button likely shows "Saving..." text.

### Required Change
- When the **Publish** button is clicked, show a **spinner animation** inside the button while `isSaving === true`.
- Disable the button during save to prevent double-submit.
- After save completes (success or error), restore the button to normal state.

**Button Implementation:**
```jsx
<button
  onClick={handlePublish}
  disabled={isSaving}
  className="flex items-center gap-2 px-6 py-2 bg-[#ff7a00] text-white rounded-xl font-bold disabled:opacity-60"
>
  {isSaving ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Publishing...
    </>
  ) : (
    'Publish'
  )}
</button>
```

---

## 5. Admin Dashboard — Content Canvas: Image Insertion In-Place

**File:** `src/pages/admin/AdminDashboard.jsx` → `editorRef` content-editable canvas

### Current Issue
When inserting an image into the blog content canvas, the image appears **at the top** instead of at the cursor/caret position.

### Required Fix
- Use `document.execCommand('insertHTML', false, imgHtml)` at the **current cursor position** — do NOT set `innerHTML` or `insertAdjacentHTML` on the whole editor.
- Before inserting, ensure focus is restored to `editorRef.current` so the cursor position is valid.
- The image insert button should:
  1. Save the current selection/cursor using `window.getSelection()` and `getRangeAt(0)`.
  2. Open image URL input (prompt or modal).
  3. Restore the saved selection.
  4. Insert `<img src="..." style="max-width:100%;border-radius:8px;margin:16px 0;" />` at that position.

**Correct image insert pattern:**
```js
let savedRange = null;

function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedRange = sel.getRangeAt(0).cloneRange();
}

function restoreSelection() {
  if (!savedRange) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
}

function insertImageAtCursor(url, alt = '') {
  editorRef.current.focus();
  restoreSelection();
  const imgHtml = `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:16px 0;display:block;" />`;
  document.execCommand('insertHTML', false, imgHtml);
}
```

- Trigger `saveSelection()` on every `mouseup` and `keyup` event on the editor.
- The image upload/URL input must restore selection before calling `insertImageAtCursor`.

---

## 6. Admin Dashboard — Line Spacing Option in Content Editor

**File:** `src/pages/admin/AdminDashboard.jsx` → Editor Toolbar

### Required Addition
Add a **Line Spacing** dropdown to the content editor toolbar with options:

| Label | CSS Value |
|-------|-----------|
| 1.0 (Single) | `1` |
| 1.15 | `1.15` |
| 1.5 | `1.5` |
| 2.0 (Double) | `2` |
| 2.5 | `2.5` |
| 3.0 | `3` |

**Implementation:**
- Add a `<select>` in the toolbar with the above options.
- On change, wrap selected text or apply to a `<div>` block using `execCommand('insertHTML')` with a `style="line-height: X"` span, OR apply `document.execCommand('styleWithCSS', false, true)` and use a custom approach.
- Simpler approach: On selection, wrap in `<span style="line-height: VALUE;">...</span>` using:
```js
function applyLineSpacing(value) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.style.lineHeight = value;
  span.style.display = 'block';
  try {
    range.surroundContents(span);
  } catch {
    // Partial selection fallback
    document.execCommand('insertHTML', false,
      `<span style="line-height:${value};display:block;">${sel.toString()}</span>`);
  }
}
```

- Also apply the same line spacing option in **BloggerDashboard.jsx** toolbar.

---

## 7. Admin Creates Blogger Accounts

**File:** `src/pages/admin/AdminDashboard.jsx` → Bloggers Tab

### Current State
`createBlogger()` function and bloggers tab already exist. Admin can add name + password.

### What to Verify / Fix
- ✅ `createBlogger()` writes to Supabase `bloggers` table — confirm table has: `id, name, password_hash (or plain for now), created_at, is_active`.
- ✅ `getAllBloggers()` reads from Supabase.
- ✅ `deleteBlogger()` deletes from Supabase.
- ⚠️ Add `isCreatingBlogger` loading state with spinner on the "Create Blogger" button (same pattern as §4 above).
- ⚠️ After creation, clear the form fields and refresh the bloggers list.
- ⚠️ Show error toast if name already exists.

---

## 8. Blogger Creates Blog — Visible to Admin + Blogger Rules

### Rule A — Blogger's blogs visible to Admin
**Files:** `src/pages/admin/AdminDashboard.jsx`, `src/data/blogsData.js`

- `getAllBlogs()` (used by Admin) must fetch **all blogs** from Supabase regardless of `author`.
- Admin sees ALL blogs including blogs created by bloggers.
- Supabase query:
```js
export async function getAllBlogs() {
  const { data } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}
```

### Rule B — Admin's blogs visible ONLY to Admin
- Blogs with `author_role = 'admin'` (or where `author` matches admin username) must **NOT** appear in the blogger's dashboard blog list.
- In `BloggerDashboard.jsx`, filter:
```js
setBlogs(data.filter(b =>
  (b.author || '').toLowerCase() === (bloggerName || '').toLowerCase()
));
```
- This already exists — verify it's working correctly against Supabase data.
- In the **public blog listing** (`/blogs`), show only `status = 'published'` blogs regardless of author role.

### Rule C — Blog ownership field
- Every blog saved must include `author_role`: `'admin'` or `'blogger'`.
- Add this field to the `saveBlog()` function and Supabase `blogs` table.

---

## 9. Supabase Database Schema (Full Reference)

All data must use Supabase — **no localStorage, no sessionStorage for data** (sessionStorage only for auth session token is acceptable).

### Table: `blogs`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
title        text NOT NULL
slug         text UNIQUE NOT NULL
excerpt      text
content      text
faq_content  text
cta_content  text
cover_image  text
cover_image_alt text
category     text
tags         text
author       text
author_role  text DEFAULT 'admin'   -- 'admin' | 'blogger'
status       text DEFAULT 'draft'   -- 'draft' | 'published'
featured     boolean DEFAULT false
allow_comments boolean DEFAULT true
read_time    text
schedule_date timestamptz
created_at   timestamptz DEFAULT now()
updated_at   timestamptz DEFAULT now()
```

### Table: `comments`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
blog_id    uuid REFERENCES blogs(id) ON DELETE CASCADE
name       text NOT NULL
text       text NOT NULL
status     text DEFAULT 'pending'   -- 'pending' | 'approved' | 'rejected'
created_at timestamptz DEFAULT now()
```

### Table: `bloggers`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
name       text UNIQUE NOT NULL
password   text NOT NULL
is_active  boolean DEFAULT true
created_at timestamptz DEFAULT now()
```

### Table: `categories`
```sql
id    uuid PRIMARY KEY DEFAULT gen_random_uuid()
name  text UNIQUE NOT NULL
```

### Table: `settings`
```sql
key   text PRIMARY KEY
value text
```
> Insert row: `key = 'blog_banner_image'`, `value = 'https://your-image-url.jpg'`

---

## 10. Admin Comments Page — Verify & Approve

**File:** `src/pages/admin/AdminDashboard.jsx` → Comments Tab

### Current State
`getAllComments()` and `updateCommentStatus()` exist.

### Required Verification
- `getAllComments()` must fetch from Supabase `comments` table joining blog title:
```js
export async function getAllComments() {
  const { data } = await supabase
    .from('comments')
    .select('*, blogs(title)')
    .order('created_at', { ascending: false });
  return data || [];
}
```
- Admin can **Approve** → sets `status = 'approved'` → comment appears in blog sidebar.
- Admin can **Reject** → sets `status = 'rejected'` → comment hidden everywhere.
- Admin can **Delete** → removes from Supabase entirely.
- Show pending count badge on the Comments tab.
- Filter by: All / Pending / Approved / Rejected / Blog name.

---

## 11. Mobile Responsiveness — All Pages

### Blog Listing (`/blogs`)
- Banner image scales correctly on mobile (`h-[40vh]`).
- Search bar full-width on mobile.
- Category filter scrolls horizontally (`overflow-x-auto`).
- Cards stack in single column on mobile.

### Blog Detail (`/blogs/:slug`)
- Sidebar collapses **below** content on mobile (`lg:grid-cols-3` → single column on mobile).
- Approved comments sidebar section moves below article on mobile.
- Comment form is full-width, inputs stack vertically.
- CAPTCHA + submit button stack vertically on mobile.

### Admin Dashboard (`/blog/admin/dashboard`)
- Sidebar nav becomes a **hamburger menu** or **bottom tab bar** on mobile.
- Editor toolbar wraps to multiple rows on small screens.
- Blog list table becomes **card list** on mobile.
- Line spacing dropdown fits in toolbar without overflow.

### Blogger Dashboard
- Same mobile rules as Admin Dashboard.
- Editor toolbar wraps correctly.

---

## 12. Files to Modify (Summary)

| File | Changes |
|------|---------|
| `src/data/blogsData.js` | Add `getBlogBannerImage()`, fix `getApprovedCommentsForBlog()`, add `author_role` to `saveBlog()`, fix `getAllBlogs()` |
| `src/pages/blog/BlogPages.jsx` | Add banner image to `Blogs()`, verify comments sidebar in `BlogDetail()` |
| `src/pages/admin/AdminDashboard.jsx` | Publish button spinner, in-place image insert fix, line spacing toolbar, blogger creation spinner |
| `src/pages/blogger/BloggerDashboard.jsx` | In-place image insert fix, line spacing toolbar |
| Supabase Dashboard | Create/verify all tables in §9, add `blog_banner_image` setting row |

---

## 13. Priority Order for Implementation

1. **Supabase schema** — Verify all tables exist (§9)
2. **blogsData.js** — Fix/add all query functions (§3, §8, §10)
3. **Blog banner image** — `Blogs()` hero section (§1)
4. **Image insert fix** — Both admin and blogger editors (§5)
5. **Line spacing** — Both editor toolbars (§6)
6. **Publish loading animation** — Admin & blogger save buttons (§4)
7. **Comments page** — Admin approve/reject workflow (§10)
8. **Blogger creation** — Loading state + validation (§7)
9. **Mobile QA** — Test all three pages on 375px viewport (§11)
