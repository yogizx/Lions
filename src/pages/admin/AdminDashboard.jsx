import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminLoggedIn, adminLogout } from "./AdminLogin";
import {
  getAllBlogs,
  saveBlog,
  deleteBlog,
  generateId,
  getCommentsForBlog,
  deleteComment,
} from "../../data/blogsData";

// ── Categories ────────────────────────────────────────────────
const CATEGORIES = [
  "Construction",
  "Scaffolding",
  "Insulation",
  "Safety",
  "Industry News",
  "Project Updates",
  "Tips & Guides",
  "Company News",
];

// ── Rich-text toolbar actions ─────────────────────────────────
function execCmd(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

// ── Toolbar Button ────────────────────────────────────────────
function TBtn({ title, onClick, children, active }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${active ? "bg-gray-300 font-bold" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "editor"
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [blogComments, setBlogComments] = useState([]);
  const editorRef = useRef(null);

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAdminLoggedIn()) navigate("/blog/admin");
  }, [navigate]);

  // ── Load blogs ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchBlogs() {
      const data = await getAllBlogs();
      setBlogs(data);
    }
    fetchBlogs();
  }, [view]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── New blog template ───────────────────────────────────────
  function newBlogTemplate() {
    return {
      id: generateId(),
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: CATEGORIES[0],
      tags: "",
      author: "Lions Admin",
      coverImage: "",
      coverImageAlt: "",
      status: "draft",
      featured: false,
      allowComments: true,
      metaTitle: "",
      metaDescription: "",
      readTime: "",
      scheduleDate: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async function openEditor(blog = null) {
    const b = blog ? { ...blog } : newBlogTemplate();
    setEditingBlog(b);
    setView("editor");
    if (blog && blog.id) {
      const c = await getCommentsForBlog(blog.id);
      setBlogComments(c);
    } else {
      setBlogComments([]);
    }
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = b.content || "";
    }, 50);
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setBlogComments(p => p.filter(c => c.id !== commentId));
      showToast("Comment deleted.");
    } catch (err) {
      showToast("Error deleting comment.", "error");
    }
  }

  // ── Auto-generate slug from title ───────────────────────────
  function handleTitleChange(val) {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setEditingBlog((p) => ({ ...p, title: val, slug }));
  }

  // ── Auto read-time ───────────────────────────────────────────
  function calcReadTime(html) {
    const text = html.replace(/<[^>]+>/g, " ");
    const words = text.split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  }

  // ── Save (draft or publish) ──────────────────────────────────
  async function handleSave(status) {
    const content = editorRef.current?.innerHTML || "";
    const blog = {
      ...editingBlog,
      content,
      status,
      readTime: calcReadTime(content),
      updatedAt: new Date().toISOString(),
    };
    if (!blog.title.trim()) { showToast("Title is required.", "error"); return; }
    if (!blog.slug.trim()) { showToast("Slug is required.", "error"); return; }
    if (!content.trim() || content === "<br>") { showToast("Content cannot be empty.", "error"); return; }
    
    try {
      await saveBlog(blog);
      const data = await getAllBlogs();
      setBlogs(data);
      showToast(status === "published" ? "Blog published!" : "Draft saved!");
      setView("list");
    } catch (err) {
      showToast("Error saving blog.", "error");
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  function confirmDelete(id) { setDeleteConfirm(id); }
  async function handleDelete() {
    try {
      await deleteBlog(deleteConfirm);
      const data = await getAllBlogs();
      setBlogs(data);
      setDeleteConfirm(null);
      showToast("Blog deleted.", "error");
    } catch (err) {
      showToast("Error deleting blog.", "error");
    }
  }

  // ── Cover image preview ──────────────────────────────────────
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditingBlog((p) => ({ ...p, coverImage: ev.target.result }));
    reader.readAsDataURL(file);
  }

  // ── Insert image into editor ─────────────────────────────────
  const imgInputRef = useRef(null);
  function insertImageInEditor(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editorRef.current.focus();
      execCmd("insertImage", ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  // ── Filtered list ─────────────────────────────────────────────
  const filteredBlogs = blogs.filter((b) => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    const matchS = filterStatus === "all" || b.status === filterStatus;
    const matchC = filterCat === "all" || b.category === filterCat;
    return matchQ && matchS && matchC;
  });

  // ── Stats ─────────────────────────────────────────────────────
  const totalBlogs = blogs.length;
  const published = blogs.filter((b) => b.status === "published").length;
  const drafts = blogs.filter((b) => b.status === "draft").length;
  const featured = blogs.filter((b) => b.featured).length;

  // ── Logout ────────────────────────────────────────────────────
  function handleLogout() {
    adminLogout();
    navigate("/blog/admin");
  }

  // ═══════════════════════════════════════════════════════════
  //  EDITOR VIEW
  // ═══════════════════════════════════════════════════════════
  if (view === "editor" && editingBlog) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Editor Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-[#061b3a]">
              {editingBlog.createdAt === editingBlog.updatedAt ? "Create New Blog" : "Edit Blog"}
            </h1>
            {editingBlog.status === "draft" && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Draft</span>
            )}
            {editingBlog.status === "published" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Published</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSave("draft")} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <button onClick={() => handleSave("published")} className="px-4 py-2 text-sm font-semibold bg-[#061b3a] text-white rounded-lg hover:bg-[#0d2f5e] transition-colors">
              Publish
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Main Content ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Blog Title *</label>
              <input
                type="text"
                value={editingBlog.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter your blog title..."
                className="w-full text-2xl font-bold text-[#061b3a] placeholder-gray-300 border-none outline-none resize-none"
              />
              {/* Slug */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">/blogs/</span>
                  <input
                    type="text"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, slug: e.target.value }))}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  />
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Excerpt / Summary</label>
              <textarea
                value={editingBlog.excerpt}
                onChange={(e) => setEditingBlog((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="A short description shown on the blog listing page..."
                rows={3}
                maxLength={300}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{editingBlog.excerpt.length}/300</p>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-4 pt-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Content *</label>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                  {/* Text Style */}
                  <TBtn title="Bold" onClick={() => execCmd("bold")}><b>B</b></TBtn>
                  <TBtn title="Italic" onClick={() => execCmd("italic")}><i>I</i></TBtn>
                  <TBtn title="Underline" onClick={() => execCmd("underline")}><u>U</u></TBtn>
                  <TBtn title="Strikethrough" onClick={() => execCmd("strikeThrough")}><s>S</s></TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Headings */}
                  <select
                    title="Format"
                    className="text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none"
                    onChange={(e) => execCmd("formatBlock", e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Format</option>
                    <option value="H1">Heading 1</option>
                    <option value="H2">Heading 2</option>
                    <option value="H3">Heading 3</option>
                    <option value="H4">Heading 4</option>
                    <option value="H5">Heading 5</option>
                    <option value="H6">Heading 6</option>
                    <option value="P">Normal</option>
                  </select>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Lists */}
                  <TBtn title="Bulleted List" onClick={() => execCmd("insertUnorderedList")}>• List</TBtn>
                  <TBtn title="Numbered List" onClick={() => execCmd("insertOrderedList")}>1. List</TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Alignment */}
                  <TBtn title="Align Left" onClick={() => execCmd("justifyLeft")}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 4h12v2H3v-2zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/></svg>
                  </TBtn>
                  <TBtn title="Align Center" onClick={() => execCmd("justifyCenter")}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm3 4h12v2H6v-2zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z"/></svg>
                  </TBtn>
                  <TBtn title="Align Right" onClick={() => execCmd("justifyRight")}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm6 4h12v2H9v-2zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z"/></svg>
                  </TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Quote & HR */}
                  <TBtn title="Blockquote" onClick={() => execCmd("formatBlock", "BLOCKQUOTE")}>" "</TBtn>
                  <TBtn title="Horizontal Rule" onClick={() => execCmd("insertHorizontalRule")}>─</TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Link */}
                  <TBtn title="Insert Link" onClick={() => {
                    const url = prompt("Enter URL:");
                    if (url) execCmd("createLink", url);
                  }}>🔗</TBtn>
                  <TBtn title="Remove Link" onClick={() => execCmd("unlink")}>🔗✕</TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Insert Image in editor */}
                  <label title="Insert Image" className="px-2 py-1 rounded text-sm hover:bg-gray-200 cursor-pointer">
                    🖼
                    <input type="file" accept="image/*" className="hidden" ref={imgInputRef} onChange={insertImageInEditor} />
                  </label>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Font Size Removed based on user request as it's redundant with Formats */}

                  {/* Font Color */}
                  <label title="Text Color" className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-200 cursor-pointer">
                    <span>A</span>
                    <input type="color" className="w-4 h-4 border-none cursor-pointer" onChange={(e) => execCmd("foreColor", e.target.value)} />
                  </label>

                  {/* Highlight */}
                  <label title="Highlight Color" className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-200 cursor-pointer">
                    <span>H</span>
                    <input type="color" defaultValue="#FFFF00" className="w-4 h-4 border-none cursor-pointer" onChange={(e) => execCmd("hiliteColor", e.target.value)} />
                  </label>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Undo / Redo */}
                  <TBtn title="Undo" onClick={() => execCmd("undo")}>↩</TBtn>
                  <TBtn title="Redo" onClick={() => execCmd("redo")}>↪</TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <TBtn title="Clear Formatting" onClick={() => execCmd("removeFormat")}>✕ Fmt</TBtn>
                </div>
              </div>

              {/* Editable area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[320px] px-5 pb-5 text-sm text-gray-800 focus:outline-none prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#061b3a] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#061b3a] [&_h3]:text-lg [&_h3]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-[#061b3a] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  execCmd("insertText", text);
                }}
              />
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="space-y-5">
            {/* Publish Settings */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-[#061b3a] mb-4">Publish Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={editingBlog.status}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Author</label>
                  <input
                    type="text"
                    value={editingBlog.author}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, author: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  />
                </div>
                {editingBlog.status === "scheduled" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Schedule Publish Date</label>
                    <input
                      type="datetime-local"
                      value={editingBlog.scheduleDate || ""}
                      onChange={(e) => setEditingBlog((p) => ({ ...p, scheduleDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Select the exact date and time to publish.</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-500">Featured Post</label>
                  <button
                    type="button"
                    onClick={() => setEditingBlog((p) => ({ ...p, featured: !p.featured }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${editingBlog.featured ? "bg-[#061b3a]" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingBlog.featured ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-500">Allow Comments</label>
                  <button
                    type="button"
                    onClick={() => setEditingBlog((p) => ({ ...p, allowComments: !p.allowComments }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${editingBlog.allowComments ? "bg-[#061b3a]" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingBlog.allowComments ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button onClick={() => handleSave("draft")} className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Save Draft
                </button>
                <button onClick={() => handleSave("published")} className="flex-1 py-2 text-sm bg-[#061b3a] text-white rounded-lg hover:bg-[#0d2f5e] transition-colors font-medium">
                  Publish
                </button>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-[#061b3a] mb-1">Cover Image</h3>
              <p className="text-xs text-gray-400 mb-3">Recommended size: 1200 x 630 pixels (Banner format)</p>
              {editingBlog.coverImage ? (
                <div className="relative">
                  <img src={editingBlog.coverImage} alt="Cover" className="w-full h-36 object-cover rounded-lg" />
                  <button
                    onClick={() => setEditingBlog((p) => ({ ...p, coverImage: "" }))}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#061b3a] transition-colors">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-xs text-gray-500">Upload Cover Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
              <input
                type="text"
                value={editingBlog.coverImage}
                onChange={(e) => setEditingBlog((p) => ({ ...p, coverImage: e.target.value }))}
                placeholder="Or paste image URL..."
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
              />
              <input
                type="text"
                value={editingBlog.coverImageAlt}
                onChange={(e) => setEditingBlog((p) => ({ ...p, coverImageAlt: e.target.value }))}
                placeholder="Alt text for image..."
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
              />
            </div>

            {/* Category & Tags */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-[#061b3a] mb-3">Category & Tags</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingBlog.tags}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. scaffolding, safety, tips"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-[#061b3a] mb-3">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={editingBlog.metaTitle}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="SEO title (auto-fills from title)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  />
                  <p className="text-xs text-gray-400 mt-1">{(editingBlog.metaTitle || editingBlog.title).length}/60</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                  <textarea
                    value={editingBlog.metaDescription}
                    onChange={(e) => setEditingBlog((p) => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="SEO description (auto-fills from excerpt)"
                    rows={3}
                    maxLength={160}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                  />
                  <p className="text-xs text-gray-400 text-right">{(editingBlog.metaDescription || editingBlog.excerpt).length}/160</p>
                </div>
              </div>
            </div>

            {/* Comments Manager */}
            {editingBlog.id && blogComments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-[#061b3a] mb-3">Comments ({blogComments.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {blogComments.map(c => (
                    <div key={c.id} className="text-xs border-b border-gray-100 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#061b3a]">{c.name}</span>
                        <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 hover:underline">Delete</button>
                      </div>
                      <p className="text-gray-600 line-clamp-2" title={c.text}>{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {toast && (
          <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
            {toast.msg}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  LIST VIEW
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#061b3a] flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <h1 className="text-lg font-bold text-[#061b3a]">Blog Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/blogs" target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View Blog →
          </a>
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Blogs", value: totalBlogs, color: "bg-blue-50 text-blue-700", icon: "📄" },
            { label: "Published", value: published, color: "bg-green-50 text-green-700", icon: "✅" },
            { label: "Drafts", value: drafts, color: "bg-yellow-50 text-yellow-700", icon: "📝" },
            { label: "Featured", value: featured, color: "bg-purple-50 text-purple-700", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs font-medium opacity-80">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search blogs..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-4 py-2 bg-[#061b3a] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f5e] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Blog
          </button>
        </div>

        {/* Blog Table */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No blogs found</h3>
            <p className="text-sm text-gray-400 mb-5">Create your first blog post to get started.</p>
            <button onClick={() => openEditor()} className="px-5 py-2 bg-[#061b3a] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f5e] transition-colors">
              Create Blog
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {b.featured && <span title="Featured" className="text-yellow-400 text-xs">⭐</span>}
                        {b.coverImage && (
                          <img src={b.coverImage} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-[#061b3a] line-clamp-1">{b.title || "(Untitled)"}</div>
                          <div className="text-xs text-gray-400">/blogs/{b.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{b.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.status === "published" ? "bg-green-100 text-green-700" :
                        b.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {new Date(b.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "published" && (
                          <a href={`/blogs/${b.slug}`} target="_blank" title="View" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                        )}
                        <button onClick={() => openEditor(b)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => confirmDelete(b.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete Blog?</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
