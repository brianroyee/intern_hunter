import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import { ArrowLeft, BookOpen, Calendar, User, Grid } from "lucide-react";

import { supabase } from "./lib/supabase";

interface BlogPost {
  id: string; // Changed from number
  title: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function BlogArchivePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load from cache first
    const cachedPosts = localStorage.getItem("intern_os_blogs_archive");
    if (cachedPosts) {
      try {
        setPosts(JSON.parse(cachedPosts));
        setLoading(false);
      } catch (e) {
        console.error("Cache corrupted", e);
      }
    }

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedPosts = (data || []).map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          excerpt: doc.excerpt,
          content: doc.content,
          author: doc.author,
          createdAt: doc.created_at,
          imageBase64: doc.image_url,
        }));

        setPosts(formattedPosts);
        localStorage.setItem(
          "intern_os_blogs_archive",
          JSON.stringify(formattedPosts)
        );
      } catch (error) {
        console.error("Failed to load archive", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono selection:bg-brutal-yellow selection:text-black">
      {/* Header */}
      <header className="mb-12 border-b-8 border-black pb-6 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-7xl uppercase leading-[0.9] tracking-tighter break-words">
            LOG_ARCHIVES
          </h1>
          <p className="mt-4 text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <Grid size={24} />
            <span>FULL_KNOWLEDGE_BASE // ALL ENTRIES</span>
          </p>
        </div>
        <Link to="/blogs">
          <BrutalButton variant="secondary">
            <ArrowLeft className="inline mr-2" size={18} />
            BACK TO RECENT
          </BrutalButton>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto pb-20">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-2xl font-black uppercase animate-pulse">
              LOADING ARCHIVES...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border-4 border-black bg-white">
            <p className="text-xl font-bold uppercase">NO LOGS FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blogs/${post.id}`}
                className="group block h-full"
              >
                <div className="border-4 border-black bg-white h-full transform transition-transform group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {/* Image Thumbnail */}
                  <div className="h-48 border-b-4 border-black bg-gray-100 overflow-hidden">
                    {(post as any).imageBase64 ? (
                      <img
                        src={(post as any).imageBase64}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center font-black">
                        NO IMG
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                    <div className="flex justify-between items-start mb-4 text-xs font-bold uppercase text-gray-500">
                      <span>#{post.id}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase leading-tight mb-4 line-clamp-3 group-hover:text-brutal-blue transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm font-medium line-clamp-3 mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto">
                      <span className="inline-block bg-brutal-yellow px-2 py-1 border-2 border-black text-xs font-black uppercase group-hover:bg-black group-hover:text-white transition-colors">
                        READ_LOG
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto border-t-8 border-black pt-8 text-center md:text-left">
        <p className="font-mono text-sm opacity-50">END OF ARCHIVE</p>
      </footer>
    </div>
  );
}
