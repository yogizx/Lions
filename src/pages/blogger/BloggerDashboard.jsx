import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isBloggerLoggedIn, bloggerLogout } from "./BloggerLogin";
import logo from "../../assets/images/logo.png.jpeg";
import {
  getAllBlogs,
  saveBlog,
  deleteBlog,
  generateId,
  getCommentsForBlog,
  deleteComment,
} from "../../data/blogsData";

import { getCategories } from "../../data/blogsData";
import { compressImage } from "../../utils/imageUtils";


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

function insertHtmlAtCursor(html) {
  document.execCommand("insertHTML", false, html);
}

// ── Main Dashboard ────────────────────────────────────────────
function BloggerDashboard() {
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
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);
  const [savedRange, setSavedRange] = useState(null);

  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
    }
  }

  function restoreSelection() {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  const [categories, setCategories] = useState([]);

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!isBloggerLoggedIn()) navigate("/lions/bloger");
  }, [navigate]);

  // ── Load blogs ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const data = await getAllBlogs();
      const bloggerName = sessionStorage.getItem("blogger_name");
      setBlogs(data.filter(b => (b.author || "").toLowerCase() === (bloggerName || "").toLowerCase()));
      const cats = await getCategories();
      setCategories(cats);
    }
    load();
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
      category: categories[0] || "General",
      tags: "",
      author: sessionStorage.getItem("blogger_name") || "Blogger",
      coverImage: "",
      coverImageAlt: "",
      status: "draft",
      featured: false,
      allowComments: true,
      metaTitle: "",
      metaDescription: "",
      readTime: "",
      scheduleDate: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      author_role: "blogger",
      readTime: calcReadTime(content),
      updated_at: new Date().toISOString(),
    };
    // Remove temporary/structured fields not in Supabase schema
    delete blog.faqList;
    delete blog.createdAt;
    delete blog.updatedAt;
    if (!blog.title.trim()) { showToast("Title is required.", "error"); return; }
    if (!blog.slug.trim()) { showToast("Slug is required.", "error"); return; }
    if (!content.trim() || content === "<br>") { showToast("Content cannot be empty.", "error"); return; }
    
    setIsSaving(true);
    try {
      await saveBlog(blog);
      const data = await getAllBlogs();
      setBlogs(data);
      showToast(status === "published" ? "Blog published!" : "Draft saved!");
      setView("list");
    } catch (err) {
      console.error(err);
      showToast("Error saving blog. Check Supabase connection/RLS.", "error");
    } finally {
      setIsSaving(false);
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
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setEditingBlog((p) => ({ ...p, coverImage: compressed }));
    } catch (err) {
      console.error("Image compression failed:", err);
      showToast("Error processing image.", "error");
    }
  }

  // ── Insert image into editor ─────────────────────────────────
  const imgInputRef = useRef(null);
  async function insertImageInEditor(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      editorRef.current.focus();
      restoreSelection();
      const imgHtml = `<img src="${compressed}" style="max-width:100%;border-radius:16px;margin:24px 0;display:block;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1);" />`;
      document.execCommand("insertHTML", false, imgHtml);
    } catch (err) {
      console.error("Image compression failed:", err);
      showToast("Error processing image.", "error");
    }
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
    bloggerLogout();
    navigate("/lions/bloger");
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
              {editingBlog.created_at === editingBlog.updated_at ? "Create New Blog" : "Edit Blog"}
            </h1>
            {editingBlog.status === "draft" && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Draft</span>
            )}
            {editingBlog.status === "published" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Published</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSave("draft")} 
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button 
              onClick={() => handleSave("published")} 
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold bg-[#ff7a00] text-white rounded-lg hover:bg-[#e66a00] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isSaving ? "Publishing..." : "Publish"}
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

                  {/* Line Spacing */}
                  <select
                    title="Line Spacing"
                    className="text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;
                      editorRef.current.focus();
                      restoreSelection();
                      const sel = window.getSelection();
                      if (!sel.rangeCount) return;
                      const range = sel.getRangeAt(0);
                      const span = document.createElement("span");
                      span.style.lineHeight = value;
                      span.style.display = "block";
                      try {
                        range.surroundContents(span);
                      } catch {
                        document.execCommand("insertHTML", false, `<span style="line-height:${value};display:block;">${sel.toString()}</span>`);
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">Spacing</option>
                    <option value="1">1.0</option>
                    <option value="1.15">1.15</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2.0</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3.0</option>
                  </select>
                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Undo / Redo */}
                  <TBtn title="Undo" onClick={() => execCmd("undo")}>↩</TBtn>
                  <TBtn title="Redo" onClick={() => execCmd("redo")}>↪</TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <TBtn title="Clear Formatting" onClick={() => execCmd("removeFormat")}>✕ Fmt</TBtn>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  
                  {/* Custom Blocks */}
                  <TBtn title="Insert FAQ Block" onClick={() => insertHtmlAtCursor('<div class="my-6 border border-gray-200 rounded-lg p-4 bg-gray-50"><h3 class="text-xl font-bold mb-3 text-[#061b3a]">FAQ Question?</h3><p class="text-gray-700">FAQ Answer...</p></div><p><br></p>')}>
                    <span className="text-[#ff7a00] font-bold">FAQ</span>
                  </TBtn>
                  <TBtn title="Insert CTA Block" onClick={() => insertHtmlAtCursor('<div class="my-6 bg-[#061b3a] text-white rounded-lg p-6 text-center"><h3 class="text-2xl font-bold mb-2 text-white">Ready to get started?</h3><p class="mb-4 opacity-90 text-white">Contact us today to learn more.</p><a href="/contact" class="inline-block bg-[#ff7a00] text-white font-bold py-2 px-6 rounded-lg no-underline">Contact Us</a></div><p><br></p>')}>
                    <span className="text-[#ff7a00] font-bold">CTA</span>
                  </TBtn>
                </div>
              </div>

              {/* Editable area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onBlur={saveSelection}
                className="min-h-[500px] px-8 py-8 text-sm text-gray-800 focus:outline-none prose prose-sm max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: editingBlog.content }}
                onInput={(e) => setEditingBlog((p) => ({ ...p, content: e.target.innerHTML }))}
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
                <button onClick={() => handleSave("published")} className="flex-1 py-2 text-sm bg-[#ff7a00] text-white rounded-lg hover:bg-[#e66a00] transition-colors font-medium">
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
                    {categories.map((c) => <option key={c}>{c}</option>)}
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
  const SidebarItem = ({ icon, label, active }) => (
    <button 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${active ? 'bg-[#ff7a00] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-white' : 'text-gray-400'}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex-col hidden lg:flex h-full flex-shrink-0 border-r border-[#1e293b]">
        <div className="p-6 pb-2">
          <img src={logo} alt="Lions Logo" className="h-12 w-auto object-contain bg-white/10 rounded-lg p-2" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 mt-6">
          <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-3 px-2">WORKSPACE</div>
          <SidebarItem active={true} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>} label="My Blogs" />

          <div className="text-[10px] font-bold text-gray-500 tracking-wider mt-6 mb-3 px-2">ACCOUNT</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 text-gray-400 hover:bg-white/5 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-sm font-medium">Profile</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 text-red-400 hover:bg-red-500/10 hover:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Ad Card */}
        <div className="p-4 mt-auto">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="mb-3">
              <svg className="w-12 h-12 text-[#ff7a00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <h4 className="font-bold text-white text-sm">Write Inspiring <br/><span className="text-[#ff7a00]">Stories</span></h4>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Share your knowledge with the world.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
        {/* Header */}
        <header className="bg-white px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Blogger Workspace</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage your articles.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search..." className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]" />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <a href="/blogs" target="_blank" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
              View Blog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
            <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {sessionStorage.getItem("blogger_name") ? sessionStorage.getItem("blogger_name").substring(0, 2).toUpperCase() : "ME"}
                </div>
                <div className="hidden sm:block">
                  <p className="font-bold text-[#0f172a] text-sm leading-tight">{sessionStorage.getItem("blogger_name") || "Blogger"}</p>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Author</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "My Blogs", value: totalBlogs, color: "text-blue-600", bg: "bg-blue-50", stroke: "text-blue-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                { label: "Published", value: published, color: "text-green-600", bg: "bg-green-50", stroke: "text-green-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                { label: "Drafts", value: drafts, color: "text-[#ff7a00]", bg: "bg-orange-50", stroke: "text-orange-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
                { label: "Featured", value: featured, color: "text-purple-600", bg: "bg-purple-50", stroke: "text-purple-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
              ].map((s, i) => (
                <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
                    {s.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="text-3xl font-extrabold text-[#0f172a]">{s.value}</div>
                    <div className="text-sm font-medium text-gray-500">{s.label}</div>
                    <div className="text-[10px] text-gray-400 mt-1">All time</div>
                  </div>
                  {/* Sparkline */}
                  <div className="absolute right-4 bottom-4 w-20 h-10 opacity-70">
                     <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={`w-full h-full ${s.stroke}`}>
                       <path d={`M0,25 L20,15 L40,20 L60,10 L80,15 L100,${5 + (i*2)}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search your blogs..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button
                onClick={() => openEditor()}
                className="w-full md:w-auto px-6 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-bold hover:bg-[#e66a00] transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#ff7a00]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                New Blog
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase font-bold bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBlogs.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No blogs found. Start writing!</td></tr>
                  ) : filteredBlogs.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {b.coverImage ? (
                              <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-6 h-6 text-gray-400 m-auto mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#0f172a] text-[15px] leading-tight line-clamp-1">{b.title || "(Untitled)"}</div>
                            <div className="text-xs text-gray-400 mt-1.5">/blogs/{b.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600">
                          {b.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          b.status === "published" ? "bg-green-50 border-green-100 text-green-700" :
                          "bg-orange-50 border-orange-100 text-orange-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'published' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm font-medium text-gray-700">{new Date(b.updated_at || b.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(b.updated_at || b.updatedAt).toLocaleTimeString("en-US", { hour: '2-digit', minute:'2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {b.status === "published" && (
                            <a href={`/blogs/${b.slug}`} target="_blank" className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </a>
                          )}
                          <button onClick={() => openEditor(b)} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => confirmDelete(b.id)} className="p-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>Showing 1 to {filteredBlogs.length} of {totalBlogs} results</span>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&lt;</button>
                  <button className="px-3 py-1.5 border border-[#ff7a00] text-[#ff7a00] rounded-lg bg-orange-50 font-bold">1</button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&gt;</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">Delete Blog?</h3>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone. All data will be permanently removed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white text-sm font-bold z-50 flex items-center gap-3 animate-bounce ${toast.type === "error" ? "bg-red-500" : "bg-[#0f172a]"}`}>
          {toast.type === "error" ? (
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
             <svg className="w-5 h-5 text-[#ff7a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default BloggerDashboard;
