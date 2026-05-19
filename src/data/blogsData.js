import { supabase } from '../lib/supabaseClient';

// ============================================================
//  blogsData.js  –  Pure Supabase-backed blog store
// ============================================================

// ── Mapping Helpers ──────────────────────────────────────────
function mapBlogToDB(blog) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    faq_content: blog.faqContent,
    cta_content: blog.ctaContent,
    cover_image: blog.coverImage,
    cover_image_alt: blog.coverImageAlt,
    category: blog.category,
    tags: blog.tags,
    author: blog.author,
    author_role: blog.author_role || 'admin',
    status: blog.status,
    featured: blog.featured,
    allow_comments: blog.allowComments !== undefined ? blog.allowComments : true,
    read_time: blog.readTime,
    schedule_date: blog.scheduleDate || null,
    meta_title: blog.metaTitle,
    meta_description: blog.metaDescription,
    created_at: blog.created_at || blog.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function mapBlogFromDB(dbBlog) {
  if (!dbBlog) return null;
  return {
    ...dbBlog,
    faqContent: dbBlog.faq_content,
    ctaContent: dbBlog.cta_content,
    coverImage: dbBlog.cover_image,
    coverImageAlt: dbBlog.cover_image_alt,
    allowComments: dbBlog.allow_comments,
    readTime: dbBlog.read_time,
    scheduleDate: dbBlog.schedule_date,
    metaTitle: dbBlog.meta_title,
    metaDescription: dbBlog.meta_description,
    createdAt: dbBlog.created_at,
    updatedAt: dbBlog.updated_at
  };
}

// ── Blogs ──────────────────────────────────────────────────
export async function getAllBlogs() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapBlogFromDB);
  } catch (err) {
    console.error("Error fetching all blogs:", err);
    throw err;
  }
}

export async function getPublishedBlogs() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapBlogFromDB);
  } catch (err) {
    console.error("Error fetching published blogs:", err);
    throw err;
  }
}

export async function getBlogById(id) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return mapBlogFromDB(data);
  } catch (err) {
    console.error(`Error fetching blog with id ${id}:`, err);
    return null;
  }
}

export async function getBlogBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return mapBlogFromDB(data);
  } catch (err) {
    console.error(`Error fetching blog with slug ${slug}:`, err);
    return null;
  }
}

export async function saveBlog(blog) {
  try {
    const dbData = mapBlogToDB(blog);
    
    const { data, error } = await supabase
      .from('blogs')
      .upsert([dbData])
      .select();
    
    if (error) throw error;
    return mapBlogFromDB(data && data[0]);
  } catch (err) {
    console.error("Error saving blog:", err);
    throw err;
  }
}

export async function deleteBlog(id) {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (err) {
    console.error(`Error deleting blog with id ${id}:`, err);
    throw err;
  }
}

export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Categories ────────────────────────────────────────────────
const DEFAULT_CATS = ["Construction", "Scaffolding", "Insulation", "Safety", "Industry News", "Project Updates", "Tips & Guides", "Company News"];

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(c => c.name);
    }
    
    return DEFAULT_CATS;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return DEFAULT_CATS;
  }
}

export async function addCategory(name) {
  try {
    const { error } = await supabase
      .from('categories')
      .insert([{ name }]);
    
    if (error) throw error;
  } catch (err) {
    console.error(`Error adding category ${name}:`, err);
    throw err;
  }
}

export async function deleteCategory(name) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', name);
    
    if (error) throw error;
  } catch (err) {
    console.error(`Error deleting category ${name}:`, err);
    throw err;
  }
}

export async function renameCategory(oldName, newName) {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ name: newName })
      .eq('name', oldName);
    
    if (error) throw error;
    
    await supabase
      .from('blogs')
      .update({ category: newName })
      .eq('category', oldName);
  } catch (err) {
    console.error(`Error renaming category from ${oldName} to ${newName}:`, err);
    throw err;
  }
}

// ── Bloggers ──────────────────────────────────────────────────
export async function getAllBloggers() {
  try {
    const { data, error } = await supabase
      .from('bloggers')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching bloggers:", err);
    throw err;
  }
}

export async function createBlogger(username, password) {
  try {
    const { data, error } = await supabase
      .from('bloggers')
      .insert([{ username, password }])
      .select();
    
    if (error) throw error;
    return data && data[0];
  } catch (err) {
    console.error(`Error creating blogger ${username}:`, err);
    throw err;
  }
}

export async function verifyBlogger(username, password) {
  try {
    const { data, error } = await supabase
      .from('bloggers')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`Error verifying blogger ${username}:`, err);
    return null;
  }
}

export async function deleteBlogger(id) {
  try {
    const { error } = await supabase
      .from('bloggers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (err) {
    console.error(`Error deleting blogger with id ${id}:`, err);
    throw err;
  }
}

// ── Comments ──────────────────────────────────────────────────
// NOTE: isStatusColumnSupported is re-checked on every getAllComments() call
// so it always reflects the real DB schema state.
let isStatusColumnSupported = true;

/**
 * Normalizes a raw comment row from Supabase so that `status` is
 * always the string 'pending' or 'approved' — never null/undefined.
 * This prevents the UI filter `status !== 'approved'` from treating
 * null-status rows as pending after they have been approved.
 */
function normalizeComment(c) {
  return {
    ...c,
    status: c.status === 'approved' ? 'approved' : 'pending',
  };
}

export async function getCommentsForBlog(blogId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeComment);
  } catch (err) {
    console.error(`Error fetching comments for blog ${blogId}:`, err);
    return [];
  }
}

export async function getApprovedCommentsForBlog(blogId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      isStatusColumnSupported = 'status' in data[0];
    }

    // Normalize then filter — only truly approved comments reach live blogs.
    return (data || []).map(normalizeComment).filter(c => c.status === 'approved');
  } catch (err) {
    console.error(`Error fetching approved comments for blog ${blogId}:`, err);
    return [];
  }
}

export async function getAllComments() {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, blogs(title)')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42703' || error.code === 'PGRST204') {
        // 'status' column is missing — fall back to a plain select.
        console.warn("Supabase Info: 'status' column is missing in comments table. Please add it via SQL migration.");
        isStatusColumnSupported = false;
        const { data: allData, error: allError } = await supabase
          .from('comments')
          .select('*, blogs(title)')
          .order('created_at', { ascending: false });
        if (allError) throw allError;
        // Without a real status column every comment defaults to 'pending'.
        // Do NOT override a real status value if it somehow exists.
        return (allData || []).map(c => ({ ...c, status: c.status === 'approved' ? 'approved' : 'pending' }));
      }
      throw error;
    }

    if (data && data.length > 0) {
      isStatusColumnSupported = 'status' in data[0];
    }

    // Always normalize so the UI receives consistent status strings.
    return (data || []).map(normalizeComment);
  } catch (err) {
    console.error("Error fetching all comments:", err);
    throw err;
  }
}

/**
 * Persists a status change to Supabase.
 * Returns true on success.
 * Throws on real DB errors so the caller can show an error toast.
 * Throws (with a descriptive message) when the status column is missing
 * so optimistic UI updates are NOT applied when the write cannot persist.
 */
export async function updateCommentStatus(id, status) {
  if (!isStatusColumnSupported) {
    throw new Error(
      "Cannot persist comment status: the 'status' column is missing from the comments table. " +
      "Please run the SQL migration: ALTER TABLE comments ADD COLUMN status TEXT DEFAULT 'pending';"
    );
  }
  try {
    const { error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id);

    if (error) {
      if (error.code === '42703' || error.code === 'PGRST204') {
        isStatusColumnSupported = false;
        throw new Error(
          "Cannot persist comment status: the 'status' column is missing from the comments table. " +
          "Please run: ALTER TABLE comments ADD COLUMN status TEXT DEFAULT 'pending';"
        );
      }
      throw error;
    }
    return true;
  } catch (err) {
    console.error(`Error updating comment ${id} status to ${status}:`, err);
    throw err;
  }
}

export async function saveComment(comment) {
  try {
    const dbComment = {
      blog_id: comment.blog_id,
      name: comment.name,
      text: comment.text,
      created_at: new Date().toISOString()
    };
    
    // Add status if the database schema supports it
    if (isStatusColumnSupported && comment.status) {
      dbComment.status = comment.status;
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert([dbComment])
      .select();
    
    if (error) {
      // Gracefully catch database error code 42703 ("column status does not exist") or PGRST204
      if ((error.code === '42703' || error.code === 'PGRST204') && dbComment.status) {
        console.warn("Supabase Info: 'status' column does not exist. Retrying save without status field.");
        isStatusColumnSupported = false;
        delete dbComment.status;
        const { data: retryData, error: retryError } = await supabase
          .from('comments')
          .insert([dbComment])
          .select();
        if (retryError) throw retryError;
        return retryData && retryData[0];
      }
      throw error;
    }
    return data && data[0];
  } catch (err) {
    console.error("Error saving comment:", err);
    throw err;
  }
}

export async function deleteComment(id) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (err) {
    console.error(`Error deleting comment ${id}:`, err);
    throw err;
  }
}

// ── Settings ──────────────────────────────────────────────────
export async function getBlogBannerImage() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'blog_banner_image')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; 
    return data?.value || null;
  } catch (err) {
    console.error("Error fetching banner image:", err);
    return null;
  }
}

export async function updateSetting(key, value) {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert([{ key, value }]);
    
    if (error) throw error;
  } catch (err) {
    console.error(`Error updating setting ${key}:`, err);
    throw err;
  }
}
