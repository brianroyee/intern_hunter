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

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${apiBase}/api/blogs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
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

  const handleShare = (platform: "twitter" | "linkedin" | "copy") => {
    const url = window.location.href;
    const text = `Check out this log entry: ${post?.title}`;

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
      <div className="min-h-screen bg-brutal-bg flex items-center justify-center font-mono">
        <p className="text-2xl font-black uppercase animate-pulse">
          LOADING LOG ENTRY...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brutal-bg p-8 font-mono flex flex-col items-center justify-center">
        <BrutalBox className="bg-white text-center max-w-md">
          <h1 className="text-4xl font-black mb-4">404 ERROR</h1>
          <p className="mb-6">{error || "LOG ENTRY NOT FOUND"}</p>
          <Link to="/blogs">
            <BrutalButton>RETURN TO ARCHIVES</BrutalButton>
          </Link>
        </BrutalBox>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono selection:bg-brutal-yellow selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/blogs">
            <BrutalButton variant="secondary" className="text-sm">
              <ArrowLeft className="inline mr-2" size={16} />
              BACK TO LOGS
            </BrutalButton>
          </Link>
        </div>

        <BrutalBox className="bg-white mb-12">
          <div className="border-b-4 border-black pb-6 mb-6">
            {/* Image */}
            <div className="border-4 border-black mb-6">
              <img
                src={`${apiBase}/api/blogs/${post.id}/image`}
                alt={post.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.style.display =
                    "none";
                }}
                className="w-full max-h-[500px] object-cover"
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-4 text-balance">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm font-bold uppercase text-gray-600">
              <span className="flex items-center gap-1 bg-brutal-yellow px-2 py-1 border-2 border-black text-black">
                <Calendar size={14} /> {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1 bg-brutal-blue px-2 py-1 border-2 border-black text-white">
                <User size={14} /> {post.author}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleShare("twitter")}
                className="bg-black text-white p-2 hover:bg-brutal-blue transition-colors border-2 border-black"
                title="Share on Twitter"
              >
                <Twitter size={20} />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="bg-black text-white p-2 hover:bg-brutal-blue transition-colors border-2 border-black"
                title="Share on LinkedIn"
              >
                <Linkedin size={20} />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className={`p-2 border-2 border-black transition-colors ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-black text-white hover:bg-brutal-blue"
                }`}
                title="Copy Link"
              >
                {copied ? <Check size={20} /> : <LinkIcon size={20} />}
              </button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none font-mono prose-headings:font-mono prose-headings:uppercase prose-headings:font-black prose-p:font-medium prose-img:border-4 prose-img:border-black">
            <div className="whitespace-pre-wrap leading-relaxed text-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </BrutalBox>

        <footer className="text-center pb-12 opacity-50 text-sm">
          END OF LOG ENTRY // {post.id}
        </footer>
      </div>
    </div>
  );
}
