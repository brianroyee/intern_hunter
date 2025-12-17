import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  ArrowRight,
  Send,
  ArrowLeft,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_min: number;
  salary_max: number;
  equity: string;
  tags: string[];
  created_at: string;
}

export default function RecruiterPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${apiBase}/api/jobs`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        console.error("API returned non-array:", data);
        setJobs([]);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique tags for filter chips
  const allTags = Array.from(new Set(jobs.flatMap((job) => job.tags))).slice(
    0,
    10
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesTag = selectedTag ? job.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-brutal-cream font-mono flex flex-col">
      {/* HEADER */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-black uppercase tracking-tighter hover:bg-black hover:text-white px-2 transition-colors"
          >
            INTERN_OS
          </Link>
          <Link to="/">
            <button className="font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> BACK TO HQ
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* RECRUITER CTA SECTION (The "Header" of the page) */}
          <div className="border-8 border-black bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brutal-yellow text-black font-black px-4 py-1 border-b-4 border-l-4 border-black text-xs uppercase z-10">
              RECRUITER ZONE
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase leading-none mb-2">
                HIRING?
              </h1>
              <p className="font-bold opacity-60 uppercase max-w-md">
                Stop filtering through noise. Post your bounty to the elite
                network.
              </p>
            </div>
            <a href="mailto:contactbrianroy@gmail.com" className="shrink-0">
              <BrutalButton className="bg-brutal-red text-white py-4 px-8 text-lg hover:shadow-hard-active">
                <Send className="inline mr-2" /> POST A BOUNTY
              </BrutalButton>
            </a>
          </div>

          {/* CANDIDATE SEARCH SECTION */}
          <div className="border-8 border-black bg-brutal-blue text-white p-6 md:p-12 shadow-brutal relative">
            <div className="absolute -top-6 -left-6 bg-black text-white px-4 py-2 border-4 border-white transform -rotate-2 font-black">
              FOR CANDIDATES
            </div>

            <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 leading-none">
              DEPLOY YOURSELF.
            </h2>

            <div className="bg-white p-4 border-4 border-black text-black">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <Search className="absolute top-4 left-4 opacity-50" />
                  <input
                    type="text"
                    placeholder="SEARCH ROLE, COMPANY, STACK..."
                    className="w-full bg-transparent p-3 pl-12 font-bold uppercase text-lg outline-none placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="hidden md:block w-1 bg-gray-200"></div>
                <div className="flex-shrink-0 flex items-center">
                  <span className="font-bold opacity-50 mr-2 text-sm">
                    FILTERS:
                  </span>
                  <div className="flex gap-2">
                    {["REMOTE", "Intern", "New Grad"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSearchTerm(f)}
                        className="border-2 border-black px-2 py-1 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TAG CLOUD */}
            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`
                                    px-3 py-1 text-sm font-bold uppercase border-2 border-white transition-all
                                    ${
                                      selectedTag === tag
                                        ? "bg-white text-black translate-x-[2px] translate-y-[2px]"
                                        : "bg-transparent text-white hover:bg-white hover:text-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-sm"
                                    }
                                `}
                  >
                    {selectedTag === tag ? "× " : "#"} {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* JOB LIST */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-20 font-bold text-xl animate-pulse">
                LOADING DATABASE...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="border-4 border-black bg-white p-12 text-center shadow-brutal">
                <h2 className="text-3xl font-black mb-4">NO LISTINGS FOUND</h2>
                <p className="text-lg opacity-70 mb-8">
                  SKILL ISSUE? OR MAYBE START A COMPANY.
                </p>
                <BrutalButton
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTag(null);
                  }}
                >
                  RESET FILTERS
                </BrutalButton>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Link
                  to={`/jobs/${job.id}`}
                  key={job.id}
                  className="block group"
                >
                  <div className="border-4 border-black bg-white p-6 transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-hard relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-6xl select-none group-hover:opacity-20 transition-opacity">
                      {job.company.substring(0, 2)}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      {/* Left: Role & Company */}
                      <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-black uppercase group-hover:text-brutal-blue transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-lg font-bold uppercase opacity-75 flex items-center gap-2">
                          <Briefcase size={18} /> {job.company}
                        </p>
                      </div>

                      {/* Middle: Transparency Stats */}
                      <div className="flex flex-wrap gap-3 md:gap-6 font-bold font-mono text-sm md:text-base">
                        <div className="flex items-center gap-2 bg-green-100 px-3 py-1 border-2 border-green-900 text-green-900">
                          <DollarSign size={16} />
                          <span>
                            ${(job.salary_min / 1000).toFixed(0)}k - $
                            {(job.salary_max / 1000).toFixed(0)}k
                          </span>
                        </div>
                        {job.equity && (
                          <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 border-2 border-purple-900 text-purple-900">
                            <span>{job.equity} EQ</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 border-2 border-gray-900">
                          <MapPin size={16} />
                          <span>{job.location}</span>
                        </div>
                      </div>

                      {/* Right: Arrow */}
                      <div className="hidden md:block">
                        <div className="w-12 h-12 border-4 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                          <ArrowRight size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-bold border border-black px-2 py-1 uppercase opacity-60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="border-t-4 border-black bg-white p-8 mt-12 text-center">
        <p className="font-bold opacity-50">INTERN_OS // RECRUITER_NET v1.0</p>
      </footer>
    </div>
  );
}
