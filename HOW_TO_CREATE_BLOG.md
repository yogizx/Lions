# 📝 How to Create a Blog Post – Lions Admin Guide

## Overview

This project has a full **Blog CMS** built directly into the website.  
Blogs are stored in the browser's `localStorage` — no backend or database required.

---

## 🔐 Accessing the Admin Panel

1. Open your browser and go to:
   ```
   http://localhost:5173/blog/admin
   ```
2. Enter the admin credentials:
   - **Username:** `admin`
   - **Password:** `lions@2024`
3. Click **Sign In** → You'll be redirected to the **Admin Dashboard**.

> ⚠️ To change credentials, edit the constants in:
> `src/pages/admin/AdminLogin.jsx`
> ```js
> const ADMIN_USERNAME = "admin";
> const ADMIN_PASSWORD = "lions@2024";
> ```

---

## 📋 Admin Dashboard Features

Once logged in, the dashboard shows:

| Feature | Description |
|---|---|
| **Stats Cards** | Total blogs, Published, Drafts, Featured counts |
| **Search** | Filter blogs by title or category keyword |
| **Status Filter** | Show All / Published / Draft / Archived |
| **Category Filter** | Filter by blog category |
| **New Blog Button** | Opens the full blog editor |
| **Edit** | Re-open any blog in the editor |
| **View** | Open the published blog in a new tab |
| **Delete** | Delete a blog (with confirmation dialog) |

---

## ✍️ Creating a Blog Post – Step by Step

### Step 1 – Click "New Blog"
From the dashboard, click the **+ New Blog** button in the top right.

---

### Step 2 – Fill in the Blog Title
- Enter a **title** in the large input at the top.
- The **URL slug** is auto-generated from the title (e.g. `my-blog-title`).
- You can manually edit the slug if needed.

---

### Step 3 – Write an Excerpt
- Short description shown on the blog listing page.
- Max 300 characters.

---

### Step 4 – Write Content (Rich Text Editor)

The editor supports the following toolbar tools:

#### Text Formatting
| Tool | What it does |
|---|---|
| **B** | Bold text |
| *I* | Italic text |
| U | Underline |
| ~~S~~ | Strikethrough |

#### Headings
| Tool | Output |
|---|---|
| H1 | Large heading |
| H2 | Medium heading |
| H3 | Small heading |
| ¶ | Normal paragraph |

#### Lists
- `• List` → Bulleted (unordered) list
- `1. List` → Numbered (ordered) list

#### Alignment
- Left / Center / Right alignment buttons

#### Special Elements
- `" "` → Blockquote styling
- `─` → Horizontal divider line

#### Links
- 🔗 → Prompts for a URL and wraps selected text in a link
- 🔗✕ → Removes a link

#### Images (inline in content)
- 🖼 → Upload an image file directly into the content body

#### Font Controls
- **Size dropdown** → Change font size (1–7)
- **A + color picker** → Change text colour
- **H + color picker** → Highlight background colour

#### Undo / Redo
- ↩ Undo, ↪ Redo

#### Clear Formatting
- `✕ Fmt` → Removes all formatting from selected text

---

### Step 5 – Sidebar Settings (Right Panel)

#### Publish Settings
| Setting | Options |
|---|---|
| **Status** | Draft / Published / Archived |
| **Author** | Author name shown on the post |
| **Featured Post** | Toggle — marks post as featured (shown first) |
| **Allow Comments** | Toggle — enable/disable comments |

#### Cover Image
- Upload an image file **or** paste an image URL.
- Add **alt text** for accessibility/SEO.

#### Category & Tags
- Select a **category** from the dropdown.
- Add comma-separated **tags** (e.g. `safety, construction, tips`).

#### SEO Settings
- **Meta Title** – Custom page title for search engines (max 60 chars).
- **Meta Description** – Short description for search engines (max 160 chars).

---

### Step 6 – Save or Publish

| Button | Action |
|---|---|
| **Save Draft** | Saves the post privately — not visible on the public blog. |
| **Publish** | Makes the post live and visible on `/blogs`. |

---

## 🌐 Public Blog Pages

| URL | Page |
|---|---|
| `/blogs` | Blog listing page — shows all published posts |
| `/blogs/:slug` | Individual blog post detail page |
| `/blog/admin` | Admin login page |
| `/blog/admin/dashboard` | Admin dashboard (login required) |

---

## 🗂 File Structure

```
src/
├── data/
│   └── blogsData.js          ← Blog store (localStorage CRUD helpers)
├── pages/
│   ├── admin/
│   │   ├── AdminLogin.jsx    ← Login page + auth helpers
│   │   └── AdminDashboard.jsx← Dashboard + full blog editor
│   └── blog/
│       └── BlogPages.jsx     ← Public blog listing + detail pages
└── App.jsx                   ← Routes (updated with all blog routes)
```

---

## 💾 Data Storage

All blog posts are stored in **`localStorage`** under the key `lions_blogs`.

Each blog post object contains:

```json
{
  "id": "blog_1234_abcdef",
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "excerpt": "Short description...",
  "content": "<p>HTML content from the editor</p>",
  "category": "Construction",
  "tags": "safety, tips",
  "author": "Lions Admin",
  "coverImage": "https://... or base64",
  "coverImageAlt": "Image description",
  "status": "published",
  "featured": false,
  "allowComments": true,
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "readTime": "3 min read",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔒 Logging Out

Click **Logout** in the top-right of the dashboard to end your admin session.  
The session is stored in `sessionStorage` and clears automatically when the browser tab is closed.

---

## 🛠 Categories Available

- Construction
- Scaffolding
- Insulation
- Safety
- Industry News
- Project Updates
- Tips & Guides
- Company News

> To add more categories, edit the `CATEGORIES` array in:
> `src/pages/admin/AdminDashboard.jsx`

---

*Lions Construction © 2024 — Internal Documentation*
