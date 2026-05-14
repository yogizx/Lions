import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPublishedBlogs, getCommentsForBlog, saveComment } from "../../data/blogsData";

// ── Blog Card ─────────────────────────────────────────────────
function BlogCard({ blog }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/blogs/${blog.slug}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {blog.coverImage ? (
        <img src={blog.coverImage} alt={blog.coverImageAlt || blog.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-[#061b3a] to-[#1a4a8a] flex items-center justify-center">
          <span className="text-white text-4xl opacity-30">📄</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{blog.category}</span>
          {blog.featured && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⭐ Featured</span>}
        </div>
        <h3 className="text-base font-bold text-[#061b3a] mb-2 line-clamp-2">{blog.title}</h3>
        {blog.excerpt && <p className="text-sm text-gray-500 line-clamp-3 flex-1">{blog.excerpt}</p>}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#061b3a] flex items-center justify-center">
              <span className="text-white text-xs font-bold">{(blog.author || "A")[0]}</span>
            </div>
            <span className="text-xs text-gray-500">{blog.author || "Admin"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {blog.readTime && <span>{blog.readTime}</span>}
            <span>·</span>
            <span>{new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Blog Listing Page ─────────────────────────────────────────
export function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    async function fetchBlogs() {
      let data = await getPublishedBlogs();
      data = data.filter(b => !b.scheduleDate || new Date(b.scheduleDate) <= new Date());
      setBlogs(data);
    }
    fetchBlogs();
  }, []);

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filtered = blogs.filter((b) => {
    const q = search.toLowerCase();
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q);
    const matchC = activeCat === "All" || b.category === activeCat;
    return matchQ && matchC;
  });

  const featured = filtered.filter((b) => b.featured);
  const regular = filtered.filter((b) => !b.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#061b3a] text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Our Blog</h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          Insights, updates, and expertise from the Lions Construction team.
        </p>
        <div className="mt-8 max-w-md mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
            className="w-full px-5 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCat === c ? "bg-[#061b3a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((b) => <BlogCard key={b.id} blog={b} />)}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        {regular.length > 0 && (
          <div>
            {featured.length > 0 && (
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">All Posts</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((b) => <BlogCard key={b.id} blog={b} />)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
            <p className="text-sm text-gray-400">
              {search ? `No results for "${search}".` : "No blog posts have been published yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Blog Detail Page ──────────────────────────────────────────
export function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      let all = await getPublishedBlogs();
      all = all.filter(b => !b.scheduleDate || new Date(b.scheduleDate) <= new Date());
      const found = all.find((b) => b.slug === slug);
      if (found) {
        setBlog(found);
        if (found.allowComments) {
          const c = await getCommentsForBlog(found.id);
          setComments(c);
        }
      } else {
        setNotFound(true);
      }
    }
    load();
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-7xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-[#061b3a] mb-2">Post Not Found</h1>
        <p className="text-gray-500 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/blogs")} className="px-5 py-2 bg-[#061b3a] text-white rounded-lg font-medium hover:bg-[#0d2f5e] transition-colors">
          Back to Blog
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#061b3a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tags = blog.tags ? blog.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {blog.coverImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={blog.coverImage} alt={blog.coverImageAlt || blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#061b3a]">Home</Link>
          <span>/</span>
          <Link to="/blogs" className="hover:text-[#061b3a]">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{blog.title}</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{blog.category}</span>
          {blog.featured && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Featured</span>}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#061b3a] leading-tight mb-4">{blog.title}</h1>

        {/* Author / Date / Read Time */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#061b3a] flex items-center justify-center">
              <span className="text-white text-sm font-bold">{(blog.author || "A")[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{blog.author || "Admin"}</span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
          {blog.readTime && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {blog.readTime}
            </span>
          )}
        </div>

        {/* Rich Content */}
        <div
          className="prose prose-lg max-w-none text-gray-800
            [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#061b3a] [&_h1]:mt-8 [&_h1]:mb-4
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#061b3a] [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#061b3a] [&_h3]:mt-5 [&_h3]:mb-2
            [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_blockquote]:border-l-4 [&_blockquote]:border-[#061b3a] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-6 [&_blockquote]:bg-blue-50 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg
            [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
            [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-6 [&_img]:max-w-full
            [&_hr]:border-gray-200 [&_hr]:my-8
            [&_strong]:font-semibold [&_strong]:text-[#061b3a]
            [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Tags:</span>
              {tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {blog.allowComments && (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-[#061b3a] mb-6">Comments ({comments.length})</h3>
            
            <div className="space-y-6 mb-8">
              {comments.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-xs">{c.name ? c.name[0].toUpperCase() : 'A'}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#061b3a]">{c.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h4 className="text-lg font-semibold text-[#061b3a] mb-4">Leave a Comment</h4>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={newComment.name}
                  onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061b3a]"
                />
                <textarea 
                  placeholder="Your Comment" 
                  rows={4}
                  value={newComment.text}
                  onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061b3a] resize-none"
                />
                <button 
                  onClick={async () => {
                    if (!newComment.name.trim() || !newComment.text.trim()) return;
                    setSubmitting(true);
                    try {
                      await saveComment({ blog_id: blog.id, name: newComment.name, text: newComment.text });
                      const c = await getCommentsForBlog(blog.id);
                      setComments(c);
                      setNewComment({ name: '', text: '' });
                    } catch (e) {
                      console.error(e);
                    }
                    setSubmitting(false);
                  }}
                  disabled={submitting}
                  className="px-6 py-2 bg-[#061b3a] text-white rounded-lg font-medium hover:bg-[#0d2f5e] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-10">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-medium text-[#061b3a] hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Blogs;
