import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import {
  Search,
  MapPin,
  IndianRupee,
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
  location_type?: string;
}

export default function RecruiterPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [locationType, setLocationType] = useState<
    "On-site" | "Remote" | "Hybrid" | "Any"
  >("Any");
  const [compensationType, setCompensationType] = useState<
    "Paid" | "Unpaid" | "Any"
  >("Any");

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

    const matchesLocationType =
      locationType !== "Any"
        ? (job.location_type || "Remote") === locationType
        : true;

    const matchesCompensation =
      compensationType !== "Any"
        ? compensationType === "Paid"
          ? job.salary_max > 0
          : job.salary_max === 0
        : true;

    return (
      matchesSearch && matchesTag && matchesLocationType && matchesCompensation
    );
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* COMPACT RECRUITER BANNER */}
          <div className="bg-brutal-yellow border-4 border-black p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-brutal-sm">
            <div className="flex items-center gap-4">
              <div className="bg-black text-white p-2 font-black uppercase text-xs tracking-widest hidden md:block">
                Recruiter Mode
              </div>
              <p className="font-bold uppercase text-sm md:text-base">
                <span className="font-black">Hiring?</span> Stop filtering
                noise. Post to the elite network.
              </p>
            </div>
            <Link to="/post-job" className="whitespace-nowrap">
              <button className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-white hover:text-black border-2 border-black transition-colors flex items-center gap-2 text-sm">
                <Send size={14} /> Post Internship
              </button>
            </Link>
          </div>

          {/* INTERNSHIP FILTER BAR */}
          <div className="bg-white border-4 border-black p-4 md:p-6 shadow-brutal">
            <div className="flex flex-col gap-4">
              {/* Top Row: Search & Location Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow-[2] relative group">
                  <Search
                    className="absolute top-3 left-3 opacity-40 group-focus-within:opacity-100 transition-opacity"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by Title, Skill, or Company"
                    className="w-full bg-gray-50 border-2 border-gray-300 p-2 pl-10 font-bold uppercase focus:border-black focus:bg-white outline-none transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Location Type Dropdown */}
                <div className="flex-shrink-0 relative">
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as any)}
                    className="h-full bg-white border-2 border-gray-300 p-2 font-bold uppercase text-sm focus:border-black outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
                  >
                    <option value="Any">Location: Any</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50">
                    ▼
                  </div>
                </div>

                {/* Compensation Dropdown */}
                <div className="flex-shrink-0 relative">
                  <select
                    value={compensationType}
                    onChange={(e) => setCompensationType(e.target.value as any)}
                    className="h-full bg-white border-2 border-gray-300 p-2 font-bold uppercase text-sm focus:border-black outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
                  >
                    <option value="Any">Pay: Any</option>
                    <option value="Paid">Paid Only 💰</option>
                    <option value="Unpaid">Unpaid / Equity</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50">
                    ▼
                  </div>
                </div>
              </div>

              {/* Bottom Row: Pill Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-bold text-xs uppercase opacity-50 mr-2">
                  Quick Filters:
                </span>

                {[
                  "Remote",
                  "Intern",
                  "New Grad",
                  "Engineering",
                  "Design",
                  "Product",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`
                                px-3 py-1 rounded-full border-2 text-xs font-bold uppercase transition-all
                                ${
                                  selectedTag === tag
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black"
                                }
                            `}
                  >
                    {tag}
                  </button>
                ))}

                {selectedTag && (
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchTerm("");
                    }}
                    className="ml-auto text-xs font-bold text-red-600 hover:underline uppercase"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
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
              filteredJobs.map((job) => {
                const timeAgo = Math.floor(
                  (new Date().getTime() -
                    new Date(job.created_at || "").getTime()) /
                    (1000 * 3600 * 24)
                );
                const timeDisplay = timeAgo < 1 ? "Today" : `${timeAgo}d ago`;

                return (
                  <Link
                    to={`/jobs/${job.id}`}
                    key={job.id}
                    className="block group"
                  >
                    <div className="border-4 border-black bg-white p-6 transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-hard relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-xs font-bold opacity-50 uppercase">
                        POSTED {timeDisplay}
                      </div>
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
                            <IndianRupee size={16} />
                            <span>
                              ₹{(job.salary_min / 1000).toFixed(0)}k - ₹
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
                            <span>
                              {job.location} ({job.location_type || "Remote"})
                            </span>
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
                );
              })
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
