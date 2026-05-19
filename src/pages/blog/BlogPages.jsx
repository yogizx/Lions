import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPublishedBlogs, getCommentsForBlog, getApprovedCommentsForBlog, saveComment } from "../../data/blogsData";

// ── Blog Card ─────────────────────────────────────────────────
function BlogCard({ blog }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/blogs/${blog.slug}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full"
    >
      {blog.coverImage ? (
        <img src={blog.coverImage} alt={blog.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-[#061b3a] to-[#1a4a8a] flex items-center justify-center text-4xl opacity-30">📄</div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ff7a00] bg-orange-50 px-2 py-1 rounded">
            {blog.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#061b3a] mb-2 line-clamp-2 hover:text-[#ff7a00] transition-colors">{blog.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{blog.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
           <span>{new Date(blog.created_at).toLocaleDateString()}</span>
           <span>{blog.readTime || "5 min read"}</span>
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#0f172a] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7a00] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32"></div>
        <h1 className="text-5xl font-black mb-4 relative z-10 uppercase tracking-tight">Our Blogs</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto relative z-10 font-medium">
          Latest news, trends, and expert opinions from the scaffolding industry.
        </p>
      </div>

      {/* Category Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             {categories.map(c => (
               <button 
                 key={c}
                 onClick={() => setActiveCat(c)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCat === c ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
               >
                 {c}
               </button>
             ))}
           </div>
           <div className="hidden md:block relative w-64">
             <input 
               type="text" 
               placeholder="Search..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff7a00] font-bold"
             />
             <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(blog => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
             <p className="text-gray-400 font-bold uppercase tracking-widest">No articles found matching your criteria</p>
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
  const [allBlogs, setAllBlogs] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [ctaData, setCtaData] = useState({
    heading: "Expert Scaffolding Solutions",
    subtext: "Providing safety and stability for projects of any scale.",
    btnText: "Get Free Quote",
    btnLink: "/contact"
  });

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState({ a: Math.floor(Math.random() * 10) + 1, b: Math.floor(Math.random() * 10) + 1 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [commentMsg, setCommentMsg] = useState('');

  // Inject Roboto font once
  useEffect(() => {
    if (!document.getElementById('roboto-font-link')) {
      const link = document.createElement('link');
      link.id = 'roboto-font-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    async function load() {
      let all = await getPublishedBlogs();
      all = all.filter(b => !b.scheduleDate || new Date(b.scheduleDate) <= new Date());
      setAllBlogs(all);
      const found = all.find((b) => b.slug === slug);
      if (found) {
        setBlog(found);
        // Parse structured CTA JSON saved from Admin dashboard
        if (found.ctaContent) {
          try {
            const parsed = JSON.parse(found.ctaContent);
            if (parsed && parsed.isStructured) {
              setCtaData({
                heading: parsed.heading || "Expert Scaffolding Solutions",
                subtext: parsed.subtext || "Providing safety and stability for projects of any scale.",
                btnText: parsed.btnText || "Get Free Quote",
                btnLink: parsed.btnLink || "/contact"
              });
            }
          } catch (e) {
            // Legacy / non-JSON ctaContent – keep defaults
          }
        }
        if (found.allowComments) {
          const c = await getApprovedCommentsForBlog(found.id);
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
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
        <h1 className="text-6xl font-black text-[#0f172a] mb-4">404</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">Post Not Found</p>
        <Link to="/blogs" className="px-8 py-3 bg-[#ff7a00] text-white rounded-xl font-black uppercase tracking-widest text-xs">Back to Blog</Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tags = blog.tags ? blog.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const categories = Array.from(new Set(allBlogs.map((b) => b.category))).filter(Boolean);
  const allTags = Array.from(new Set(allBlogs.flatMap(b => b.tags ? b.tags.split(",").map(t => t.trim()) : []))).filter(Boolean);
  const recentBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* ── 0. Premium Full-Width Blog Banner ── */}
      <div className="relative w-full h-[280px] md:h-[420px] bg-[#0f172a] overflow-hidden">
        {blog.coverImage ? (
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-full object-cover opacity-90 transition-transform duration-10000 hover:scale-105 ease-out" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#061b3a] to-[#163a6e] opacity-90" />
        )}
        {/* Multilayered rich dark overlays for extreme contrast and premium design */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/20 to-transparent"></div>
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-10">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ff7a00] bg-white px-3 py-1 rounded shadow-md border border-orange-100/50">
                {blog.category || "General"}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight max-w-4xl drop-shadow-md mb-4">
              {blog.title}
            </h1>
            
            {/* Meta Tags in Banner */}
            <div className="flex flex-wrap items-center gap-3.5 text-[10px] md:text-[11px] font-bold text-gray-200 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#ff7a00] text-white flex items-center justify-center text-[9px] font-black border border-white/20">
                  {(blog.author || "A")[0]}
                </div>
                <span className="text-white font-black">{blog.author || "Lions Admin"}</span>
              </div>
              <span className="w-1.5 h-1.5 bg-gray-400/60 rounded-full"></span>
              <span className="text-gray-300">{new Date(blog.created_at || blog.createdAt).toLocaleDateString()}</span>
              <span className="w-1.5 h-1.5 bg-gray-400/60 rounded-full"></span>
              <span className="text-[#ff7a00] bg-white/10 backdrop-blur-md px-2 py-0.5 rounded font-black">{blog.readTime || "5 min read"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. Enhanced Breadcrumbs ── */}
      <div className="bg-[#f8fafc] border-b border-gray-100 py-4 transition-all">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-[#ff7a00] transition-colors flex items-center gap-1">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/blogs" className="hover:text-[#ff7a00] transition-colors">Blog</Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#0f172a] truncate max-w-[250px] font-black bg-gray-100 px-2 py-0.5 rounded">
            {blog.title}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ── Main Content Column ── */}
          <div className="lg:col-span-2">
            <article>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium
                  [&_p]:mb-6
                  [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#0f172a] [&_h1]:mt-12 [&_h1]:mb-6
                  [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#0f172a] [&_h2]:mt-12 [&_h2]:mb-6
                  [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-[#0f172a] [&_h3]:mt-10 [&_h3]:mb-4
                  [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-[#0f172a] [&_h4]:mt-8 [&_h4]:mb-3
                  [&_h5]:text-base [&_h5]:font-bold [&_h5]:text-[#0f172a] [&_h5]:mt-6 [&_h5]:mb-2
                  [&_h6]:text-sm [&_h6]:font-bold [&_h6]:text-[#0f172a] [&_h6]:mt-6 [&_h6]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#ff7a00] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:bg-orange-50/30 [&_blockquote]:py-6 [&_blockquote]:my-10 [&_blockquote]:rounded-r-2xl
                  [&_img]:rounded-2xl [&_img]:my-10 [&_img]:shadow-lg
                  [&_a]:text-[#ff7a00] [&_a]:underline font-bold"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* FAQ Section */}
              {blog.faqContent && blog.faqContent.trim() !== "" && (
                <div className="mt-16 pt-12 border-t border-gray-100">
                  <h3 className="text-2xl font-black text-[#0f172a] mb-8 uppercase tracking-tight">Questions & Answers</h3>
                  <div className="space-y-8" dangerouslySetInnerHTML={{ __html: blog.faqContent }} />
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-[#0f172a] hover:text-white transition-all cursor-pointer">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA is rendered in the sidebar widget – no inline rendering here */}

              {/* ── Comment Section ── */}
              {blog.allowComments && (
                <div id="leave-comment" className="mt-20">
                  <h3 className="text-3xl font-black text-[#0f172a] mb-2">Comments ({comments.length})</h3>
                  <div className="w-12 h-1.5 bg-[#ff7a00] rounded-full mb-10"></div>
                  
                  {commentMsg && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-sm font-bold animate-in fade-in zoom-in">
                      {commentMsg}
                    </div>
                  )}

                  <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm mb-12">
                    <p className="text-[10px] font-black text-gray-400 mb-8 uppercase tracking-widest">Leave a Comment</p>
                    <div className="space-y-6">
                      <input 
                        type="text" 
                        placeholder="Your Name *" 
                        value={newComment.name}
                        onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] transition-all font-bold text-sm"
                      />
                      <textarea 
                        rows={5} 
                        placeholder="Your Comment *" 
                        value={newComment.text}
                        onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff7a00] transition-all font-bold text-sm resize-none"
                      />

                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                          <span className="text-lg font-black text-[#0f172a]">{captcha.a} + {captcha.b} =</span>
                          <input 
                            type="number"
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                            placeholder="?"
                            className="w-16 h-10 bg-white rounded-lg text-center font-black text-[#ff7a00] focus:outline-none focus:border-[#ff7a00] border border-gray-200"
                          />
                        </div>
                        <button 
                          onClick={async () => {
                            if (!newComment.name.trim() || !newComment.text.trim()) { alert("Name and comment are required."); return; }
                            if (parseInt(captchaInput) !== captcha.a + captcha.b) { alert("Incorrect captcha!"); return; }
                            setSubmitting(true);
                            try {
                              await saveComment({ blog_id: blog.id, name: newComment.name, text: newComment.text, status: 'pending' });
                              setCommentMsg("Thank you! Your comment has been sent to admin for verification.");
                              setNewComment({ name: '', text: '' });
                              setCaptcha({ a: Math.floor(Math.random()*10)+1, b: Math.floor(Math.random()*10)+1 });
                              setCaptchaInput('');
                            } catch (e) { console.error(e); }
                            setSubmitting(false);
                          }}
                          disabled={submitting}
                          className="px-10 py-4 bg-[#0f172a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#ff7a00] transition-all disabled:opacity-50"
                        >
                          {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  {comments.length > 0 && (
                    <div className="space-y-8 mt-12">
                      {comments.map(c => (
                        <div key={c.id} className="bg-[#f8fafc] p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-[10px] font-black uppercase">
                                {(c.name || "A")[0]}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">{c.name || "Anonymous"}</h4>
                                <span style={{fontFamily:"'Roboto',sans-serif"}} className="text-[10px] font-bold text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                           <p className="text-gray-600 text-sm italic">"{c.text}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <Link to="/blogs" style={{fontFamily:"'Roboto',sans-serif"}} className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#ff7a00] transition-colors mt-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Blog
              </Link>
            </article>
          </div>

          {/* ── Sidebar Column ── */}
          <div className="space-y-12">
            {/* 1. Categories */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
              <h3 style={{fontFamily:"'Roboto',sans-serif"}} className="text-base font-black text-[#0f172a] mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#ff7a00] rounded-full"></span>
                Categories
              </h3>
              <ul className="space-y-3">
                {categories.map(c => (
                  <li key={c}>
                    <Link to="/blogs" style={{fontFamily:"'Roboto',sans-serif"}} className="flex items-center justify-between group py-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#ff7a00] transition-colors border-b border-gray-50 last:border-0">
                      <span>{c}</span>
                      <svg className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Popular Tags */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
              <h3 style={{fontFamily:"'Roboto',sans-serif"}} className="text-base font-black text-[#0f172a] mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map(t => (
                  <span key={t} style={{fontFamily:"'Roboto',sans-serif"}} className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-[#0f172a] hover:text-white transition-all cursor-pointer border border-gray-100">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Recent Posts */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
              <h3 className="text-lg font-black text-[#0f172a] mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                Recent Posts
              </h3>
              <div className="space-y-6">
                {recentBlogs.map(b => (
                  <Link key={b.id} to={`/blogs/${b.slug}`} className="group flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-50">
                      <img src={b.coverImage || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-[#0f172a] line-clamp-2 group-hover:text-[#ff7a00] transition-colors leading-tight mb-1 uppercase tracking-tight">{b.title}</h4>
                      <span style={{fontFamily:"'Roboto',sans-serif"}} className="text-[9px] font-bold text-gray-400 uppercase">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar CTA – driven by Admin Sidebar CTA Builder */}
            <div className="bg-[#0f172a] rounded-[2rem] p-10 text-center relative overflow-hidden group shadow-2xl shadow-[#0f172a]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7a00] rounded-full blur-3xl opacity-15 -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500 rounded-full blur-3xl opacity-5 -ml-10 -mb-10"></div>
              <h4 className="text-xl font-black text-white mb-3 relative z-10 leading-tight">{ctaData.heading}</h4>
              <p className="text-gray-400 text-xs mb-8 relative z-10 leading-relaxed">{ctaData.subtext}</p>
              <Link
                to={ctaData.btnLink || "/contact"}
                className="inline-block px-10 py-4 bg-[#ff7a00] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white hover:text-[#0f172a] transition-all relative z-10 shadow-lg shadow-[#ff7a00]/20"
              >
                {ctaData.btnText}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Blogs;
