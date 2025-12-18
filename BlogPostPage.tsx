import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import {
  ArrowLeft,
  Calendar,
  User,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check,
  Clock,
  ArrowUp,
  Terminal,
  Wifi,
  Signal,
  Share2,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

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
    const cachedPost = localStorage.getItem(`intern_os_blog_${id}`);
    if (cachedPost) {
      try {
        setPost(JSON.parse(cachedPost));
        setLoading(false);
      } catch (e) {
        console.error("Cache corrupted", e);
      }
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`${apiBase}/api/blogs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
          localStorage.setItem(`intern_os_blog_${id}`, JSON.stringify(data));
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, apiBase]);

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

  const handleShare = (platform: "twitter" | "linkedin" | "copy") => {
    const url = window.location.href;

    if (platform === "twitter") {
      const tweetText = `"${post?.title.toUpperCase()}"\n\n${post?.excerpt}`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetText
        )}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center font-mono p-8 text-center">
        <div className="w-16 h-16 border-8 border-black border-t-brutal-yellow animate-spin mb-4" />
        <p className="text-2xl font-black uppercase tracking-tighter">
          DECRYPTING_DATA_STREAM...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono flex flex-col items-center justify-center">
        <BrutalBox className="bg-white text-center max-w-md shadow-hard border-8 border-black">
          <Terminal
            size={48}
            className="mx-auto mb-4 text-brutal-red animate-pulse"
          />
          <h1 className="text-4xl font-black mb-4 uppercase">404 ERROR</h1>
          <p className="mb-8 font-black uppercase opacity-60">
            {error || "FILE_NOT_FOUND"}
          </p>
          <Link to="/blogs" className="w-full">
            <BrutalButton className="w-full">RETURN_TO_ARCHIVES</BrutalButton>
          </Link>
        </BrutalBox>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono selection:bg-brutal-yellow selection:text-black mb-16 md:mb-0">
      {/* MOBILE INDUSTRIAL STATUS BAR */}
      <div className="fixed bottom-0 left-0 w-full z-[100] bg-black text-white py-2 px-4 shadow-[0_-8px_16px_rgba(0,0,0,0.2)] md:hidden flex justify-between items-center border-t-2 border-brutal-yellow">
        <div className="flex items-center gap-3">
          <Terminal size={12} className="text-brutal-yellow animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            USER@INTERN_OS: READ_MODE
          </span>
        </div>
        <div className="flex-grow mx-4 relative h-1 bg-gray-800">
          <div
            className="absolute top-0 left-0 h-full bg-brutal-yellow transition-all duration-100"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black">
            {Math.round(scrollProgress)}%
          </span>
          <Wifi size={10} className="text-brutal-yellow" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Navigation / Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-black pb-8">
          <Link to="/blogs" className="group">
            <BrutalButton
              variant="secondary"
              className="flex items-center gap-2 group-hover:-translate-x-1 transition-transform"
            >
              <ArrowLeft size={18} />
              BACK_TO_KNOWLEDGE_BASE
            </BrutalButton>
          </Link>
          <div className="flex items-center gap-2 font-black text-xs uppercase opacity-40">
            <FileText size={14} />
            <span>intern_os // blog_id: {post.id}</span>
          </div>
        </div>

        <article className="animate-fade-in-up">
          <BrutalBox
            title={`SECURED_CONTENT_LOG_00${post.id}`}
            className="bg-white p-0 relative"
          >
            {/* Hero Section */}
            <div className="border-b-8 border-black">
              {/* Image */}
              <div className="border-b-4 border-black bg-gray-100 overflow-hidden">
                <img
                  src={`${apiBase}/api/blogs/${post.id}/image`}
                  alt={post.title}
                  onError={(e) => {
                    (
                      e.target as HTMLImageElement
                    ).parentElement!.style.display = "none";
                  }}
                  className="w-full max-h-[600px] object-cover"
                />
              </div>

              <div className="p-4 md:p-12">
                <div className="flex flex-wrap gap-1.5 mb-6 md:mb-8">
                  <span className="bg-brutal-yellow px-2 py-0.5 border-2 border-black text-[10px] md:text-xs font-black uppercase shadow-solid-sm">
                    <Calendar size={10} className="inline mr-1" />{" "}
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="bg-brutal-blue px-2 py-0.5 border-2 border-black text-white text-[10px] md:text-xs font-black uppercase flex items-center gap-1 shadow-solid-sm">
                    <User size={10} /> {post.author}
                  </span>
                  <span className="bg-black text-white px-2 py-0.5 border-2 border-black text-[10px] md:text-xs font-black uppercase flex items-center gap-1 shadow-solid-sm">
                    <Clock size={10} /> {getReadTime(post.content)} MIN
                  </span>
                </div>

                <h1 className="text-3xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8 text-balance">
                  {post.title}
                </h1>

                <p className="text-lg md:text-2xl font-bold italic leading-relaxed border-l-4 md:border-l-8 border-brutal-yellow pl-4 md:pl-8 opacity-80 max-w-3xl">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Reading Content */}
            <div className="p-4 md:p-12 md:pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
                <div className="prose prose-lg md:prose-xl max-w-none font-mono prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-4xl md:prose-headings:text-5xl prose-headings:mt-12 prose-headings:mb-6 prose-p:leading-relaxed prose-p:mb-8 prose-img:border-8 prose-img:border-black prose-img:shadow-hard prose-strong:bg-brutal-yellow prose-strong:px-1 prose-a:text-brutal-blue prose-a:underline prose-a:font-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>

                  <div className="mt-20 pt-12 border-t-8 border-black border-double flex flex-col items-center text-center">
                    <div className="text-4xl mb-4">■ ■ ■</div>
                    <p className="font-black uppercase tracking-widest text-sm italic opacity-50">
                      END_OF_TRANSMISSION // INTERN_OS_SECURE_NODE_{post.id}
                    </p>
                  </div>
                </div>

                {/* Sidebar / Share Relay */}
                <aside className="space-y-8 sticky top-8 h-fit hidden lg:block">
                  <div className="border-4 border-black p-6 bg-gray-50">
                    <h4 className="font-black uppercase text-xs mb-4 pb-2 border-b-2 border-black flex items-center gap-2">
                      <Share2 size={14} /> SIGNAL_RELAY
                    </h4>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleShare("twitter")}
                        className="w-full bg-white border-2 border-black p-3 font-black text-xs uppercase hover:bg-black hover:text-white transition-all flex items-center justify-between group"
                      >
                        TWITTER_X
                        <Twitter
                          size={16}
                          className="group-hover:rotate-12 transition-transform"
                        />
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="w-full bg-white border-2 border-black p-3 font-black text-xs uppercase hover:bg-brutal-blue hover:text-white transition-all flex items-center justify-between group"
                      >
                        LINKEDIN
                        <Linkedin
                          size={16}
                          className="group-hover:rotate-12 transition-transform"
                        />
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className={`w-full border-2 border-black p-3 font-black text-xs uppercase transition-all flex items-center justify-between group ${
                          copied
                            ? "bg-green-500 text-white"
                            : "bg-white hover:bg-brutal-yellow"
                        }`}
                      >
                        {copied ? "COPIED_CID" : "COPY_LINK"}
                        {copied ? (
                          <Check size={16} />
                        ) : (
                          <LinkIcon
                            size={16}
                            className="group-hover:rotate-12 transition-transform"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="border-4 border-black p-4 bg-black text-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase opacity-60">
                        Read Progress
                      </span>
                      <span className="text-xs font-black">
                        {Math.round(scrollProgress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-brutal-yellow shadow-[0_0_8px_rgba(244,255,0,0.5)] transition-all"
                        style={{ width: `${scrollProgress}%` }}
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </BrutalBox>
        </article>

        <footer className="mt-20 border-t-8 border-black pt-12 pb-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-2xl font-black uppercase mb-2">
              INTERN_OS // KNOWLEDGE
            </h2>
            <p className="font-mono text-[10px] uppercase opacity-40">
              System Node: BLOG_SERVER_V1 // AUTHORIZED_ACCESS_ONLY
            </p>
          </div>
          <Link to="/blogs/archive">
            <BrutalButton
              variant="secondary"
              className="bg-brutal-yellow text-black hover:bg-black hover:text-white text-lg py-4 px-12"
            >
              BROWSE_FULL_ARCHIVE
            </BrutalButton>
          </Link>
        </footer>
      </div>

      {/* MOBILE INTERACTIVE ELEMENTS */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-[110] bg-white p-4 border-4 border-black shadow-solid active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all md:bottom-8"
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {/* Mobile Share Relay FAB */}
      <div className="fixed bottom-20 left-6 z-[110] md:hidden">
        <button
          onClick={() => handleShare("copy")}
          className="bg-black text-white p-4 border-4 border-black shadow-solid active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Share2 size={24} />
        </button>
      </div>
    </div>
  );
}
