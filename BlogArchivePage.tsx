import React from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import { ArrowLeft, BookOpen, Calendar, User, Grid } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
}

export default function BlogArchivePage() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  React.useEffect(() => {
    const cachedPosts = localStorage.getItem("intern_os_blogs");
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
        const response = await fetch(`${apiBase}/api/blogs`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
          localStorage.setItem("intern_os_blogs", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [apiBase]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blogs/${post.id}`}
                className="group block h-full"
              >
                <div className="border-4 border-black bg-white h-full transform transition-transform group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {/* Image Thumbnail */}
                  <div className="h-48 border-b-4 border-black bg-gray-100 overflow-hidden">
                    <img
                      src={`${apiBase}/api/blogs/${post.id}/image`}
                      alt={post.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x200?text=NO+IMAGE"; // Fallback
                      }}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>

                  <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                    <div className="flex justify-between items-start mb-4 text-xs font-bold uppercase text-gray-500">
                      <span>#{post.id}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase leading-tight mb-4 line-clamp-3 group-hover:text-brutal-blue transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm border-l-4 border-brutal-yellow pl-4 mb-6 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t-2 border-black border-dashed flex justify-between items-center">
                      <span className="text-xs font-bold uppercase flex items-center gap-1">
                        <User size={12} /> {post.author}
                      </span>
                      <span className="font-bold text-sm">READ →</span>
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
