import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  History,
  Clock,
  ArrowUp,
  Terminal,
  Wifi,
  Signal,
} from "lucide-react";

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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollValue = (totalScroll / windowHeight) * 100;

      setScrollProgress(scrollValue || 0);
      setShowBackToTop(totalScroll > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Attempt to load from cache first for instant UI
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
          // Store in cache
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

  const getReadTime = (content: string) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono selection:bg-brutal-yellow selection:text-black mb-16 md:mb-0">
      {/* MOBILE INDUSTRIAL STATUS BAR (Premium Footer) */}
      <div className="fixed bottom-0 left-0 w-full z-[100] bg-black text-white py-2 px-4 shadow-[0_-8px_16px_rgba(0,0,0,0.2)] md:hidden flex justify-between items-center border-t-2 border-brutal-yellow">
        <div className="flex items-center gap-3">
          <Terminal size={12} className="text-brutal-yellow animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            USER@INTERN_OS: BLOGS
          </span>
        </div>

        <div className="flex-grow mx-4 relative h-1 bg-gray-800">
          <div
            className="absolute top-0 left-0 h-full bg-brutal-yellow shadow-[0_0_8px_#F4FF00] transition-all duration-100"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black">
            {Math.round(scrollProgress)}%
          </span>
          <Wifi size={10} className="text-brutal-yellow" />
          <Signal size={10} />
        </div>
      </div>

      {/* Header - Fixed Layout Clash */}
      <header className="mb-12 border-b-8 border-black pb-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="w-full md:w-auto">
          <h1 className="font-display text-[12vw] md:text-8xl uppercase leading-[0.8] tracking-tighter break-words mb-2">
            intern<span className="text-brutal-blue">_</span>os
          </h1>
          <div className="flex items-center justify-between md:justify-start gap-4 mt-4 w-full">
            <p className="text-sm md:text-xl font-bold uppercase tracking-widest flex items-center gap-2 bg-black text-white px-2 py-1">
              <BookOpen size={18} className="animate-pulse" />
              <span>LOG_V1.1_STABLE</span>
            </p>
            <span className="md:hidden text-[10px] font-black opacity-50">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <Link to="/" className="group w-full md:w-auto">
          <BrutalButton
            variant="secondary"
            className="w-full md:w-auto flex items-center justify-center gap-2 py-4"
          >
            <ArrowLeft
              className="group-hover:-translate-x-2 transition-transform"
              size={18}
            />
            BACK TO HQ
          </BrutalButton>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto pb-20">
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-8 border-black border-t-brutal-yellow animate-spin" />
            <p className="text-2xl font-black uppercase tracking-tighter">
              INITIALIZING_DATA_STREAM...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border-8 border-black bg-white shadow-hard flex flex-col items-center gap-4">
            <div className="text-brutal-red animate-pulse">
              <Terminal size={48} />
            </div>
            <h2 className="text-2xl font-black uppercase">SYSTEM_EMPTY</h2>
            <p className="text-sm opacity-50 px-8">
              NO LOG ENTRIES DETECTED IN LOCAL OR PRODUCTION DATABASE.
            </p>
            <BrutalButton onClick={() => window.location.reload()}>
              RETRY_CONNECTION
            </BrutalButton>
          </div>
        ) : (
          <div className="flex flex-col gap-12 md:gap-20">
            {/* FEATURED HERO POST */}
            {featuredPost && (
              <article className="animate-fade-in-up">
                <BrutalBox
                  title={`SECURED_ENTRY_00${featuredPost.id}`}
                  className="bg-white group transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="lg:w-3/5">
                      <Link to={`/blogs/${featuredPost.id}`}>
                        <div className="relative border-4 border-black group overflow-hidden touch-manipulation shadow-hard hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                          <img
                            src={`${apiBase}/api/blogs/${featuredPost.id}/image`}
                            alt={featuredPost.title}
                            className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              (
                                e.target as HTMLImageElement
                              ).parentElement!.style.display = "none";
                            }}
                          />
                          <div className="absolute top-4 right-4 bg-brutal-blue text-white p-2 border-2 border-black font-black uppercase text-xs z-10 shadow-solid">
                            FEATURED_FILE
                          </div>
                          <div className="absolute bottom-4 left-4 bg-black text-white p-1 border-2 border-white font-mono text-[10px] uppercase opacity-80">
                            BLG_ID: {featuredPost.id}_AUTO_GEN
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="lg:w-2/5 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-brutal-yellow px-2 py-1 border-2 border-black text-xs font-black uppercase shadow-solid-sm">
                          {formatDate(featuredPost.createdAt)}
                        </span>
                        <span className="bg-white px-2 py-1 border-2 border-black text-black text-xs font-black uppercase flex items-center gap-1 shadow-solid-sm">
                          <Clock size={12} />{" "}
                          {getReadTime(featuredPost.content)} MIN
                        </span>
                      </div>

                      <Link to={`/blogs/${featuredPost.id}`}>
                        <h2 className="text-4xl md:text-7xl font-black uppercase leading-[0.85] mb-6 hover:text-brutal-blue transition-colors cursor-pointer active:scale-[0.98] origin-left">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="text-xl leading-relaxed border-l-8 border-black pl-6 mb-8 line-clamp-4 md:line-clamp-none italic">
                        {featuredPost.excerpt}
                      </p>

                      <Link
                        to={`/blogs/${featuredPost.id}`}
                        className="w-full md:w-auto"
                      >
                        <BrutalButton className="w-full md:w-auto text-xl py-5 px-10 group/btn">
                          DECRYPT_FILE{" "}
                          <span className="inline-block transform group-hover/btn:translate-x-2 transition-transform ml-2">
                            →
                          </span>
                        </BrutalButton>
                      </Link>
                    </div>
                  </div>
                </BrutalBox>
              </article>
            )}

            {/* SECONDARY GRID */}
            {otherPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                  <article key={post.id} className="animate-fade-in-up h-full">
                    <BrutalBox
                      title={`VOL_${post.id}`}
                      className="h-full flex flex-col hover:-rotate-1 transition-transform"
                    >
                      <div className="flex flex-col h-full">
                        <Link to={`/blogs/${post.id}`}>
                          <div className="border-4 border-black overflow-hidden aspect-[4/3] relative mb-6">
                            <img
                              src={`${apiBase}/api/blogs/${post.id}/image`}
                              alt={post.title}
                              className="w-full h-full object-cover transition-all"
                              onError={(e) => {
                                (
                                  e.target as HTMLImageElement
                                ).parentElement!.style.display = "none";
                              }}
                            />
                            <div className="absolute top-2 left-2 bg-brutal-yellow px-1 border-2 border-black text-[8px] font-black uppercase">
                              READ_TIME: {getReadTime(post.content)}M
                            </div>
                          </div>
                        </Link>

                        <div className="mb-4">
                          <span className="text-[10px] font-black opacity-50 uppercase tracking-widest block mb-1">
                            [ {formatDate(post.createdAt)} ]
                          </span>
                          <Link to={`/blogs/${post.id}`}>
                            <h3 className="text-3xl font-black uppercase leading-none hover:text-brutal-blue transition-colors mb-4">
                              {post.title}
                            </h3>
                          </Link>
                        </div>

                        <p className="text-sm font-medium line-clamp-3 mb-8 flex-grow">
                          {post.excerpt}
                        </p>

                        <Link to={`/blogs/${post.id}`} className="mt-auto">
                          <BrutalButton
                            variant="primary"
                            className="w-full text-sm font-black italic"
                          >
                            OPEN_DATA_STREAM
                          </BrutalButton>
                        </Link>
                      </div>
                    </BrutalBox>
                  </article>
                ))}
              </div>
            )}

            {/* HIGH-END ARCHIVE SECTION */}
            <section className="mt-12 bg-black text-white p-12 border-8 border-brutal-yellow shadow-hard relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Terminal size={120} />
              </div>
              <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase mb-2 tracking-tighter">
                    DATA_ARCHIVES
                  </h2>
                  <p className="font-mono opacity-60 uppercase text-xs md:text-sm">
                    ACCESSING LEGACY HISTORY // TOTAL_FILE_COUNT: {posts.length}
                  </p>
                </div>
                <Link to="/blogs/archive" className="w-full md:w-auto">
                  <BrutalButton
                    variant="secondary"
                    className="w-full bg-brutal-yellow text-black hover:bg-white text-xl px-12 py-5"
                  >
                    BROWSE_ALL_LOGS
                  </BrutalButton>
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* REFINED FOOTER */}
      <footer className="max-w-7xl mx-auto border-t-8 border-black pt-12 pb-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h4 className="text-xl font-black uppercase mb-2 animate-pulse">
            INTERN_OS // BLOGS
          </h4>
          <p className="font-mono text-[10px] opacity-60 uppercase">
            ESTABLISHED: 2024.12.18 // STATUS: ENCRYPTED
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4">
            <div className="w-4 h-4 bg-brutal-yellow border-2 border-black" />
            <div className="w-4 h-4 bg-brutal-blue border-2 border-black" />
            <div className="w-4 h-4 bg-brutal-red border-2 border-black" />
          </div>
          <p className="text-[10px] font-black uppercase opacity-40">
            AUTHORIZED_ONLY_ZONE
          </p>
        </div>
      </footer>

      {/* MOBILE INTERACTIVE ELEMENTS */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-[110] bg-white p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all md:bottom-8 opacity-80"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
