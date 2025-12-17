import React from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt: string;
  imageBase64?: string;
}

export default function BlogsPage() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";
        const response = await fetch(`${apiBase}/api/blogs`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  return (
    <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono selection:bg-brutal-yellow selection:text-black">
      {/* Header */}
      <header className="mb-12 border-b-8 border-black pb-6 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-8xl uppercase leading-[0.9] tracking-tighter break-words">
            Brutal<span className="text-brutal-blue">_</span>Blogs
          </h1>
          <p className="mt-4 text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <BookOpen size={24} />
            <span>KNOWLEDGE_BASE // V.1.0</span>
          </p>
        </div>
        <Link to="/">
          <BrutalButton variant="secondary">
            <ArrowLeft className="inline mr-2" size={18} />
            BACK TO HQ
          </BrutalButton>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto pb-20">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-2xl font-black uppercase animate-pulse">
              LOADING KNOWLEDGE...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border-4 border-black bg-white">
            <p className="text-xl font-bold uppercase">NO LOGS FOUND</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <div key={post.id} className="animate-fade-in-up">
                <BrutalBox title={`LOG_ENTRY_00${post.id}`}>
                  <div className="flex flex-col gap-4">
                    {/* Image Section */}
                    <div className="border-b-4 border-black pb-4 mb-2">
                      <img
                        src={`${apiBase}/api/blogs/${post.id}/image`}
                        alt={post.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).parentElement!.style.display = "none";
                        }}
                        className="w-full h-64 object-cover border-4 border-black"
                      />
                    </div>

                    <div className="border-b-4 border-black pb-4">
                      <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-2 hover:text-brutal-blue transition-colors cursor-pointer">
                        {post.title}
                      </h2>
                      <div className="flex gap-4 text-sm font-bold uppercase text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {formatDate(post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} /> {post.author}
                        </span>
                      </div>
                    </div>

                    <div className="text-lg leading-relaxed border-l-4 border-brutal-yellow pl-4">
                      {post.excerpt}
                    </div>

                    {expandedId === post.id && (
                      <div className="mt-4 pt-4 border-t-2 border-black border-dashed whitespace-pre-wrap font-sans text-lg">
                        {post.content}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <BrutalButton
                        className="text-sm"
                        onClick={() =>
                          setExpandedId(expandedId === post.id ? null : post.id)
                        }
                      >
                        {expandedId === post.id ? "CLOSE_LOG" : "READ_FULL_LOG"}{" "}
                        <span className="ml-2">
                          {expandedId === post.id ? "↑" : "→"}
                        </span>
                      </BrutalButton>
                    </div>
                  </div>
                </BrutalBox>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto border-t-8 border-black pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="font-mono text-sm">
          <p>© 2024 INTERN_OS. READ AT YOUR OWN RISK.</p>
        </div>
      </footer>
    </div>
  );
}
