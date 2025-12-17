import React from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  content: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "WHY EVERYTHING IS SO BRUTAL",
    excerpt:
      "We ditched the rounded corners for hard edges. Here is why software needs to stop being so soft.",
    date: "2024-10-15",
    author: "ADMIN",
    content:
      "Modern UI is too soft. We need more borders. We need more contrast. We need to feel the pixels again.",
  },
  {
    id: 2,
    title: "THE INTERN HUNTER PROTOCOL",
    excerpt:
      "How we select the best candidates using our proprietary brutalist algorithm.",
    date: "2024-10-20",
    author: "SYSTEM",
    content: "Our algorithm filters out weak resumes. Only the bold survive.",
  },
  {
    id: 3,
    title: "CSS IS PAIN BUT WE LOVE IT",
    excerpt:
      "A deep dive into why Tailwind + Raw CSS is the ultimate combo for chaos.",
    date: "2024-11-01",
    author: "DEV_TEAM",
    content:
      "We writes styles that scream. Utility classes are just the beginning.",
  },
];

export default function BlogsPage() {
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
        <div className="grid gap-8">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="animate-fade-in-up">
              <BrutalBox title={`LOG_ENTRY_00${post.id}`}>
                <div className="flex flex-col gap-4">
                  <div className="border-b-4 border-black pb-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-2 hover:text-brutal-blue transition-colors cursor-pointer">
                      {post.title}
                    </h2>
                    <div className="flex gap-4 text-sm font-bold uppercase text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> {post.author}
                      </span>
                    </div>
                  </div>

                  <div className="text-lg leading-relaxed border-l-4 border-brutal-yellow pl-4">
                    {post.excerpt}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <BrutalButton className="text-sm">
                      READ_FULL_LOG <span className="ml-2">→</span>
                    </BrutalButton>
                  </div>
                </div>
              </BrutalBox>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto border-t-8 border-black pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="font-mono text-sm">
          <p>© 2024 INTERN_OS. READ AT YOUR OWN RISK.</p>
        </div>
      </footer>
    </div>
  );
}
