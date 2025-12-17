import React from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import { ArrowLeft, BookOpen, Calendar, User, History } from "lucide-react";

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

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
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
  }, [apiBase]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

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
          <div className="grid gap-12">
            {/* Recent Posts logic: Slice top 3 */}
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="animate-fade-in-up">
                <BrutalBox title={`LOG_ENTRY_00${post.id}`}>
                  <div className="flex flex-col gap-4">
                    {/* Image Section */}
                    <div className="border-b-4 border-black pb-4 mb-2">
                      <Link to={`/blogs/${post.id}`}>
                        <img
                          src={`${apiBase}/api/blogs/${post.id}/image`}
                          alt={post.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            (
                              e.target as HTMLImageElement
                            ).parentElement!.style.display = "none";
                          }}
                          className="w-full h-64 object-cover border-4 border-black hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </Link>
                    </div>

                    <div className="border-b-4 border-black pb-4">
                      <Link to={`/blogs/${post.id}`}>
                        <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-2 hover:text-brutal-blue transition-colors cursor-pointer decoration-4 hover:underline">
                          {post.title}
                        </h2>
                      </Link>
                      <div className="flex gap-4 text-sm font-bold uppercase text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {formatDate(post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} /> {post.author}
                        </span>
                      </div>
                    </div>

                    <div className="text-lg leading-relaxed border-l-4 border-brutal-yellow pl-4 line-clamp-3">
                      {post.excerpt}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Link to={`/blogs/${post.id}`}>
                        <BrutalButton className="text-sm">
                          READ_FULL_LOG <span className="ml-2">→</span>
                        </BrutalButton>
                      </Link>
                    </div>
                  </div>
                </BrutalBox>
              </div>
            ))}

            {/* Archive Button */}
            <div className="text-center mt-8">
              <div className="inline-block relative group">
                <Link to="/blogs/archive">
                  <BrutalButton className="text-xl py-4 px-12 border-4 bg-white hover:bg-black hover:text-white transition-colors">
                    <History className="inline mr-2" /> READ PREVIOUS LOGS
                  </BrutalButton>
                </Link>
              </div>
              <p className="mt-4 text-sm font-bold uppercase opacity-50">
                View entire history of {posts.length} entries
              </p>
            </div>
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
