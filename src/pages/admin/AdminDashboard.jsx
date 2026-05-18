import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminLoggedIn, adminLogout } from "./AdminLogin";
import logo from "../../assets/images/logo.png.jpeg";
import {
  getAllBlogs,
  saveBlog,
  deleteBlog,
  generateId,
  getAllComments,
  updateCommentStatus,
  getAllBloggers,
  createBlogger,
  deleteBlogger,
  getCategories,
  addCategory,
  deleteCategory,
  renameCategory,
  deleteComment,
  getCommentsForBlog
} from "../../data/blogsData";
import { compressImage } from "../../utils/imageUtils";



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
  const faqEditorRef = useRef(null);
  const ctaEditorRef = useRef(null);
  const [selectedBlogger, setSelectedBlogger] = useState(null);
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

  const [activeTab, setActiveTab] = useState("blogs");
  const [categoriesList, setCategoriesList] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [bloggersList, setBloggersList] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  
  // Blogger creation state
  const [newBloggerName, setNewBloggerName] = useState("");
  const [newBloggerPass, setNewBloggerPass] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBlogger, setIsCreatingBlogger] = useState(false);

  const userRole = sessionStorage.getItem("lions_admin_role") || "blogger";
  const currentUser = sessionStorage.getItem("lions_admin_user") || "";

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAdminLoggedIn()) navigate("/blog/admin");
  }, [navigate]);

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      const data = await getAllBlogs();
      setBlogs(data);
      const cats = await getCategories();
      setCategoriesList(cats);
      const bc = await getAllComments();
      setAllComments(bc);
      const bb = await getAllBloggers();
      setBloggersList(bb);
    }
    if (view === "list") loadData();
  }, [view, activeTab]);

  const [commentSearch, setCommentSearch] = useState("");
  const [commentStatusFilter, setCommentStatusFilter] = useState("all");
  const [commentBlogFilter, setCommentBlogFilter] = useState("all");
  const [commentSort, setCommentSort] = useState("newest");
  const [filterAuthor, setFilterAuthor] = useState("all");

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
      category: categoriesList[0] || "General",
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      faqContent: "", // Structured rich text for FAQ
      faqList: [], // Added for structured Q&A
      ctaContent: "", // Structured rich text for CTA
    };
  }

  async function openEditor(blog = null) {
    const b = blog ? { ...blog } : newBlogTemplate();
    
    // Parse FAQ content if it's HTML but faqList is missing (backward compatibility)
    if (b.faqContent && (!b.faqList || b.faqList.length === 0)) {
       // Simple heuristic: if it's not JSON-like, we don't parse it as list
       // But for now let's just ensure faqList is initialized
       b.faqList = b.faqList || [];
    }

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
      if (ctaEditorRef.current) ctaEditorRef.current.innerHTML = b.ctaContent || "";
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
    
    // Compile FAQ list to HTML for the frontend
    let compiledFaq = "";
    if (editingBlog.faqList && editingBlog.faqList.length > 0) {
      compiledFaq = editingBlog.faqList.map(f => `
        <div class="faq-item mb-6">
          <h4 class="text-lg font-bold text-[#061b3a] mb-2">${f.q}</h4>
          <p class="text-gray-600">${f.a}</p>
        </div>
      `).join("");
    }

    const blog = {
      ...editingBlog,
      content,
      faqContent: compiledFaq,
      ctaContent: ctaEditorRef.current?.innerHTML || "",
      status,
      author_role: "admin",
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
  const filteredBlogs = blogs
    .filter(b => {
      const author = (b.author || "").toLowerCase();
      const current = (currentUser || "").toLowerCase();
      
      if (userRole === "super") {
        if (filterAuthor === "all") return true;
        const isLegacy = !author || author === "lions admin" || author === "admin";
        const isOwn = author === current;
        if (filterAuthor === "super") return isOwn || isLegacy;
        return author === filterAuthor.toLowerCase();
      }
      return author === current;
    })
    .filter((b) => {
      const q = searchQ.toLowerCase();
      const matchQ = !q || b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
      const matchS = filterStatus === "all" || b.status === filterStatus;
      const matchC = filterCat === "all" || b.category === filterCat;
      return matchQ && matchS && matchC;
    });

  // ── Stats ─────────────────────────────────────────────────────
  const visibleBlogsForStats = blogs.filter(b => {
    const author = (b.author || "").toLowerCase();
    const current = (currentUser || "").toLowerCase();
    if (userRole === "super") {
      return author === current || !author || author === "lions admin" || author === "admin";
    }
    return author === current;
  });
  const totalBlogs = visibleBlogsForStats.length;
  const publishedCount = visibleBlogsForStats.filter((b) => b.status === "published").length;
  const draftsCount = visibleBlogsForStats.filter((b) => b.status === "draft").length;
  const featuredCount = visibleBlogsForStats.filter((b) => b.featured).length;

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

            {/* FAQ Canvas - Structured */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#061b3a] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff7a00]"></span>
                  FAQ Canvas (Q&A)
                </h3>
                <button 
                  onClick={() => {
                    const currentFaqs = editingBlog.faqList || [];
                    setEditingBlog({...editingBlog, faqList: [...currentFaqs, {q: "", a: ""}]});
                  }}
                  className="text-[10px] bg-[#061b3a] text-white px-2 py-1 rounded hover:bg-[#ff7a00] transition-colors font-bold uppercase"
                >
                  + Add Question
                </button>
              </div>
              <div className="p-5 space-y-4">
                {(editingBlog.faqList || []).length === 0 && (
                   <p className="text-xs text-gray-400 italic">No FAQs added yet. Click "+ Add Question" to start.</p>
                )}
                {(editingBlog.faqList || []).map((faq, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                    <button 
                      onClick={() => {
                        const newList = [...editingBlog.faqList];
                        newList.splice(idx, 1);
                        setEditingBlog({...editingBlog, faqList: newList});
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                    <input 
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const newList = [...editingBlog.faqList];
                        newList[idx].q = e.target.value;
                        setEditingBlog({...editingBlog, faqList: newList});
                      }}
                      placeholder="Question?"
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm font-bold mb-2 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                    />
                    <textarea 
                      value={faq.a}
                      onChange={(e) => {
                        const newList = [...editingBlog.faqList];
                        newList[idx].a = e.target.value;
                        setEditingBlog({...editingBlog, faqList: newList});
                      }}
                      placeholder="Answer..."
                      rows={2}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Canvas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#061b3a] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff7a00]"></span>
                  CTA Canvas
                </h3>
                <span className="text-[10px] text-gray-400 font-medium uppercase">Call to Action Content</span>
              </div>
              <div
                ref={ctaEditorRef}
                contentEditable
                suppressContentEditableWarning
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onBlur={saveSelection}
                placeholder="Type CTA content here..."
                className="min-h-[120px] px-5 py-4 text-sm text-gray-800 focus:outline-none prose prose-sm max-w-none"
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
                    {categoriesList.map((c) => <option key={c}>{c}</option>)}
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
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
        {/* Header */}
        <header className="bg-white px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <img src={logo} alt="Lions Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a]">Blog Administration</h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'comments' ? 'Manage comments, review and moderate user feedback.' : 
                 activeTab === 'bloggers' ? 'Manage your bloggers and their access.' : 
                 activeTab === 'categories' ? 'Organize and manage your blog categories.' : 
                 'Manage blogs, comments and publishers'}
              </p>
            </div>
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
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm">
                  AD
                </div>
                <div className="hidden sm:block">
                  <p className="font-bold text-[#0f172a] text-sm leading-tight">Admin</p>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Super Admin</p>
                </div>
                <button onClick={handleLogout} className="ml-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Bar */}
        <div className="px-8 mt-2">
          <div className="flex gap-8 border-b border-gray-100">
            {[
              { id: 'blogs', label: 'Blogs', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
              { id: 'comments', label: 'Comments', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
              { id: 'bloggers', label: 'Bloggers', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
              { id: 'categories', label: 'Categories', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id ? 'border-[#ff7a00] text-[#ff7a00]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* ────────────────────────────────────────────────────────── */}
          {/* BLOGS VIEW */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Blogs", value: totalBlogs, color: "text-blue-600", bg: "bg-blue-50", stroke: "text-blue-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                  { label: "Published", value: publishedCount, color: "text-green-600", bg: "bg-green-50", stroke: "text-green-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                  { label: "Drafts", value: draftsCount, color: "text-[#ff7a00]", bg: "bg-orange-50", stroke: "text-orange-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
                  { label: "Featured", value: featuredCount, color: "text-purple-600", bg: "bg-purple-50", stroke: "text-purple-300", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
                ].map((s, i) => (
                  <div key={s.label} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex items-center gap-6 relative overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
                      {s.icon}
                    </div>
                    <div className="relative z-10">
                      <div className="text-4xl font-extrabold text-[#0f172a] mb-1">{s.value}</div>
                      <div className="text-base font-bold text-gray-400">{s.label}</div>
                      <div className="text-[11px] text-[#ff7a00] font-bold mt-2 uppercase tracking-wider">Lions Analytics</div>
                    </div>
                    {/* Sparkline */}
                    <div className="absolute right-6 bottom-6 w-24 h-12 opacity-40">
                       <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={`w-full h-full ${s.stroke}`}>
                         <path d={`M0,25 L20,15 L40,20 L60,10 L80,15 L100,${5 + (i*2)}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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
                      placeholder="Search blogs..."
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
                    {categoriesList.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {userRole === "super" && (
                    <select
                      value={filterAuthor}
                      onChange={(e) => setFilterAuthor(e.target.value)}
                      className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]"
                    >
                      <option value="all">All Authors</option>
                      <option value="super">Super Admin</option>
                      {bloggersList.map(b => <option key={b.username} value={b.username}>{b.username}</option>)}
                    </select>
                  )}
                  <button className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                    Sort by: Newest
                  </button>
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
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No blogs found.</td></tr>
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
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* COMMENTS VIEW */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "comments" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0f172a]">Comments Management</h2>
                <p className="text-sm text-gray-500 mt-1">Review, approve or remove comments submitted by users.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 md:max-w-md">
                  <input 
                    type="text" 
                    value={commentSearch}
                    onChange={e => setCommentSearch(e.target.value)}
                    placeholder="Search comments..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00]" 
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <select 
                  value={commentStatusFilter}
                  onChange={e => setCommentStatusFilter(e.target.value)}
                  className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
                <select 
                  value={commentBlogFilter}
                  onChange={e => setCommentBlogFilter(e.target.value)}
                  className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none"
                >
                  <option value="all">All Blogs</option>
                  {blogs.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
                <div className="flex-1"></div>
                <button 
                  onClick={() => setCommentSort(commentSort === "newest" ? "oldest" : "newest")}
                  className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <svg className={`w-4 h-4 transition-transform ${commentSort === 'oldest' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                  Sort by: {commentSort === 'newest' ? 'Newest' : 'Oldest'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {[
                  { label: "Total Comments", value: allComments.length, icon: "💬", bg: "bg-blue-50/50", color: "text-blue-500", border: "border-blue-100" },
                  { label: "Pending", value: allComments.filter(c => c.status !== 'approved').length, icon: "⏱", bg: "bg-orange-50/50", color: "text-[#ff7a00]", border: "border-orange-100" },
                  { label: "Approved", value: allComments.filter(c => c.status === 'approved').length, icon: "✅", bg: "bg-green-50/50", color: "text-green-500", border: "border-green-100" },
                  { label: "Spam", value: 0, icon: "⚠", bg: "bg-red-50/50", color: "text-red-500", border: "border-red-100" },
                ].map((s) => (
                  <div key={s.label} className={`bg-white rounded-xl p-4 flex items-center gap-4 border shadow-sm ${s.border}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${s.bg} ${s.color}`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs font-medium text-gray-500">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                {allComments.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">No comments found.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {allComments
                      .filter(c => {
                        const matchQ = !commentSearch || c.name.toLowerCase().includes(commentSearch.toLowerCase()) || c.text.toLowerCase().includes(commentSearch.toLowerCase());
                        const matchS = commentStatusFilter === "all" || (commentStatusFilter === "pending" ? c.status !== 'approved' : c.status === 'approved');
                        const matchB = commentBlogFilter === "all" || c.blog_id === commentBlogFilter;
                        return matchQ && matchS && matchB;
                      })
                      .sort((a, b) => {
                        const d1 = new Date(a.created_at || 0);
                        const d2 = new Date(b.created_at || 0);
                        return commentSort === "newest" ? d2 - d1 : d1 - d2;
                      })
                      .map(c => {
                      const blog = blogs.find(b => b.id === c.blog_id);
                      return (
                      <div key={c.id} className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-6">
                        <div className="flex gap-4 md:w-1/3">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#0f172a] text-[15px]">{c.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{c.name.toLowerCase().replace(' ','')}@example.com</div>
                            <div className="text-xs text-gray-400 mt-2">
                              on <span className="text-[#ff7a00] font-medium">"{blog?.title || 'Unknown Blog'}"</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">"{c.text}"</p>
                          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {new Date(c.created_at || new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, {new Date(c.created_at || new Date()).toLocaleTimeString("en-US", { hour: '2-digit', minute:'2-digit' })}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end md:w-1/4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            c.status === "approved" ? "bg-green-50 border-green-100 text-green-700" :
                            "bg-orange-50 border-orange-100 text-orange-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                            {c.status === 'approved' ? 'Approved' : 'Pending'}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {c.status !== 'approved' ? (
                              <button onClick={async () => {
                                await updateCommentStatus(c.id, 'approved');
                                setAllComments(allComments.map(ac => ac.id === c.id ? {...ac, status: 'approved'} : ac));
                                showToast("Comment verified!");
                              }} className="p-2 border border-green-200 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              </button>
                            ) : (
                              <button disabled className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-300 cursor-not-allowed">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              </button>
                            )}
                            <button onClick={async () => {
                                if(!window.confirm("Delete this comment?")) return;
                                await deleteComment(c.id);
                                setAllComments(allComments.filter(ac => ac.id !== c.id));
                                showToast("Comment deleted", "error");
                              }} className="p-2 border border-red-200 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>Showing 1 to {allComments.length} of {allComments.length} comments</span>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&lt;</button>
                    <button className="px-3 py-1.5 border border-[#ff7a00] text-[#ff7a00] rounded-lg bg-orange-50 font-bold">1</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* BLOGGERS VIEW */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "bloggers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">Manage Bloggers</h2>
                  <p className="text-sm text-gray-500 mt-1">Create and manage users who can publish and manage blog content.</p>
                </div>
                <button className="text-[#ff7a00] text-sm font-bold flex items-center gap-2 hover:underline bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Need Help?
                </button>
              </div>

              {/* Create Form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-end shadow-sm">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Username
                  </label>
                  <input type="text" value={newBloggerName} onChange={e => setNewBloggerName(e.target.value)} placeholder="Enter unique username" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00] transition-all" />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Password
                  </label>
                  <input type="password" value={newBloggerPass} onChange={e => setNewBloggerPass(e.target.value)} placeholder="Enter secure password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00] transition-all" />
                </div>

                <button 
                  disabled={isCreatingBlogger}
                  onClick={async () => {
                    if(!newBloggerName.trim() || !newBloggerPass.trim()) return;
                    setIsCreatingBlogger(true);
                    try {
                      const nb = await createBlogger(newBloggerName, newBloggerPass);
                      setBloggersList([...bloggersList, nb]);
                      setNewBloggerName("");
                      setNewBloggerPass("");
                      showToast("Blogger created!");
                    } catch(err) {
                      console.error(err);
                      showToast("Error creating blogger. Check RLS policies.", "error");
                    } finally {
                      setIsCreatingBlogger(false);
                    }
                  }} 
                  className="w-full md:w-auto px-8 py-3 bg-[#ff7a00] text-white rounded-xl text-sm font-bold hover:bg-[#e66a00] transition-colors shadow-sm shadow-[#ff7a00]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingBlogger ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  )}
                  {isCreatingBlogger ? "Creating..." : "Create Blogger"}
                </button>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-6">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                  <div>
                    <h3 className="font-bold text-[#0f172a]">Bloggers List</h3>
                    <p className="text-xs text-gray-500 mt-1">All registered bloggers and their activity.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                      <input type="text" placeholder="Search bloggers..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none" />
                      <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                  </div>
                </div>

                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Blogger</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-center">Total Blogs</th>
                      <th className="px-6 py-4">Joined On</th>
                      <th className="px-6 py-4">Last Active</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Add self Admin manually for UI representation */}
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#ff7a00] font-bold flex items-center justify-center text-lg">A</div>
                          <div>
                            <div className="font-bold text-[#0f172a]">Admin</div>
                            <div className="text-xs text-gray-500">admin</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-[#ff7a00]">Super Admin</span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-600">0</td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-medium">15 May 2026</td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-medium">15 May 2026</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-green-700 bg-green-50">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button className="p-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {bloggersList.map((b, i) => {
                      const blogCount = blogs.filter(blog => blog.author === b.username).length;
                      const colors = ['bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600'];
                      const cClass = colors[i % colors.length];
                      return (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-lg ${cClass}`}>
                              {b.username.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#0f172a]">{b.username}</div>
                              <div className="text-xs text-gray-500">{b.username}@lions.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600">Author</span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-600">{blogCount}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">{b.created_at ? new Date(b.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : '10 May 2026'}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">Recently</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-green-700 bg-green-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setFilterAuthor(b.username);
                                setActiveTab("blogs");
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              title="View Blogger's Blogs"
                              className="p-2 border border-blue-100 rounded-lg text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={async () => {
                              if(!window.confirm(`Delete blogger ${b.username}?`)) return;
                              await deleteBlogger(b.id);
                              setBloggersList(bloggersList.filter(bl => bl.id !== b.id));
                              showToast("Blogger deleted", "error");
                            }} className="p-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>Showing 1 to {bloggersList.length + 1} of {bloggersList.length + 1} bloggers</span>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&lt;</button>
                    <button className="px-3 py-1.5 border border-[#ff7a00] text-[#ff7a00] rounded-lg bg-orange-50 font-bold">1</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* CATEGORIES VIEW */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0f172a]">Manage Categories</h2>
                <p className="text-sm text-gray-500 mt-1">Create, update and organize blog categories to keep your content structured.</p>
              </div>

              {/* Create Form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <input 
                      type="text" 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 focus:border-[#ff7a00] transition-all"
                    />
                  </div>
                  <button onClick={async () => {
                    if(!newCategory.trim()) return;
                    try {
                      await addCategory(newCategory);
                      setCategoriesList([...categoriesList, newCategory]);
                      setNewCategory("");
                      showToast("Category added!");
                    } catch(e) {
                      showToast("Error adding category", "error");
                    }
                  }} className="w-full md:w-auto px-8 py-3.5 bg-[#ff7a00] text-white rounded-xl text-sm font-bold hover:bg-[#e66a00] transition-colors shadow-sm shadow-[#ff7a00]/20 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Category
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-2">Category name should be unique</p>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-6">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                  <div>
                    <h3 className="font-bold text-[#0f172a] flex items-center gap-2">
                      All Categories 
                      <span className="bg-orange-100 text-[#ff7a00] px-2 py-0.5 rounded-full text-xs font-bold">{categoriesList.length}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">A list of all blog categories in your system.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                      <input type="text" placeholder="Search categories..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none" />
                      <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none">
                      <option>Sort: A to Z</option>
                    </select>
                  </div>
                </div>

                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 w-1/2">Category</th>
                      <th className="px-6 py-4 text-center">Total Blogs</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoriesList.map((c, i) => {
                      const catBlogs = blogs.filter(b => b.category === c).length;
                      const iconColors = [
                        'bg-orange-100 text-orange-600', 
                        'bg-blue-100 text-blue-600', 
                        'bg-green-100 text-green-600', 
                        'bg-purple-100 text-purple-600', 
                        'bg-yellow-100 text-yellow-600'
                      ];
                      const iconClass = iconColors[i % iconColors.length];
                      
                      return (
                      <tr key={c} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <div>
                              <div className="font-bold text-[#0f172a] text-base">{c}</div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">Articles related to {c.toLowerCase()} industry</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-2">
                             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             <div className="flex flex-col">
                               <span className="font-bold text-gray-700">{catBlogs}</span>
                               <span className="text-[10px] text-gray-400 leading-none">Blogs</span>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-green-700 bg-green-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                const newName = prompt("Enter new name for category:", c);
                                if (newName && newName !== c) {
                                  renameCategory(c, newName).then(() => {
                                    setCategoriesList(categoriesList.map(cat => cat === c ? newName : cat));
                                    showToast("Category renamed!");
                                  });
                                }
                              }}
                              className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={async () => {
                              if(!window.confirm(`Delete category ${c}?`)) return;
                              await deleteCategory(c);
                              setCategoriesList(categoriesList.filter(cat => cat !== c));
                              showToast("Category deleted", "error");
                            }} className="p-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>Showing 1 to {categoriesList.length} of {categoriesList.length} categories</span>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&lt;</button>
                    <button className="px-3 py-1.5 border border-[#ff7a00] text-[#ff7a00] rounded-lg bg-orange-50 font-bold">1</button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {/* Blogger's Blogs Modal */}
      {selectedBlogger && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[999] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedBlogger(null)}
              className="absolute top-8 right-8 p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="mb-10 flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center text-3xl font-bold">
                 {selectedBlogger[0].toUpperCase()}
               </div>
               <div>
                <h3 className="text-3xl font-extrabold text-[#0f172a]">Blogs by {selectedBlogger}</h3>
                <div className="flex items-center gap-3 mt-2">
                   <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">Verified Author</span>
                   <span className="text-sm text-gray-400 font-medium">Total {blogs.filter(b => b.author === selectedBlogger).length} publications</span>
                </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {blogs.filter(b => b.author === selectedBlogger).map(b => (
                <div key={b.id} className="group p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-[#ff7a00]/30 hover:bg-white transition-all flex items-center justify-between shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-16 rounded-2xl overflow-hidden shadow-inner bg-gray-200">
                      {b.coverImage ? (
                        <img src={b.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Cover</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f172a] text-lg mb-1 group-hover:text-[#ff7a00] transition-colors line-clamp-1">{b.title}</h4>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span>{new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[#ff7a00]">{b.category}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedBlogger(null);
                      openEditor(b);
                    }}
                    className="px-6 py-3 bg-[#0f172a] text-white rounded-2xl text-xs font-bold hover:bg-[#ff7a00] transition-all shadow-lg shadow-[#0f172a]/20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                  >
                    Edit Blog
                  </button>
                </div>
              ))}
              {blogs.filter(b => b.author === selectedBlogger).length === 0 && (
                <div className="py-20 text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                   </div>
                   <p className="text-gray-400 italic font-medium">This blogger hasn't published any blogs yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
