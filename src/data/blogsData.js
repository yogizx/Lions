import { supabase } from '../lib/supabaseClient';

// ============================================================
//  blogsData.js  –  Supabase-backed blog store
// ============================================================

export async function getAllBlogs() {
  try {
    const { data, error } = await supabase.from('blogs').select('*').order('createdAt', { ascending: false });
    if (error) {
      console.error("Error fetching all blogs:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getPublishedBlogs() {
  try {
    const { data, error } = await supabase.from('blogs').select('*').eq('status', 'published').order('createdAt', { ascending: false });
    if (error) {
      console.error("Error fetching published blogs:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getBlogById(id) {
  try {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function getBlogBySlug(slug) {
  try {
    const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function saveBlog(blog) {
  // convert camelCase to snake_case if necessary, but assuming we can just save it as is.
  // wait, the local storage structure used camelCase. I will map it to snake_case for Supabase or just save as camelCase. 
  // Let's just pass it as is. In Supabase, if the columns are created manually, they might be snake_case. 
  // To be safe, I'll keep the object structure identical to what it was.
  const { data, error } = await supabase.from('blogs').upsert([blog]).select();
  if (error) throw error;
  return data && data[0];
}

export async function deleteBlog(id) {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

export function generateId() {
  return `blog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Comments ──────────────────────────────────────────────────
export async function getCommentsForBlog(blogId) {
  try {
    const { data, error } = await supabase.from('comments').select('*').eq('blog_id', blogId).order('created_at', { ascending: true });
    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveComment(comment) {
  const { data, error } = await supabase.from('comments').insert([comment]).select();
  if (error) throw error;
  return data && data[0];
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}
