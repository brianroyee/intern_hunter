import React, { useState, useEffect } from "react";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
  BrutalTextArea,
} from "./components/BrutalComponents";
import {
  Terminal,
  Users,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  Lock,
  LogOut,
  PenTool,
  Image as ImageIcon,
  Edit,
  X,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPost {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image: File | null;
  createdAt?: string;
}

interface JobPost {
  id?: number;
  title: string;
  company: string;
  company_url: string;
  location: string;
  salary_min: number;
  salary_max: number;
  equity: string;
  tags: string[];
  description: string;
  company_description?: string;
  apply_url: string;
  created_at?: string;
  location_type?: string;
  internship_type?: string;
  duration?: string;
  academic_year?: string;
  discipline?: string;
  compensation_type?: string;
  locationType?: string; // For form handling
  internshipType?: string; // For form handling
  academicYear?: string; // For form handling
  compensationType?: string; // For form handling
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  admin_rating?: number;
  admin_comments?: string;
}

interface Application {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  experienceLevel: string;
  skills: string;
  bio: string;
  portfolioUrl: string;
  cvFilename: string | null;
  subscribeToNewsletter: number;
  submittedAt: string;
}

interface Referral {
  id: number;
  job_id: number;
  name: string;
  email: string;
  linkedin: string;
  why_me: string;
  status: string;
  created_at: string;
  job_title?: string;
  company?: string;
}

// CONSTANTS FOR DROPDOWNS
const LOCATION_TYPES = ["Remote", "On-site", "Hybrid"];
const INTERNSHIP_TYPES = [
  "Summer Internship",
  "Winter Internship",
  "Co-op Program",
  "Research Internship",
  "Project-Based",
  "Part-time Internship",
];
const DURATION_OPTIONS = [
  "1-2 Months",
  "3 Months",
  "6 Months",
  "12 Months",
  "Flexible",
];
const COMPENSATION_TYPES = [
  "Paid Stipend",
  "Unpaid (For Credit)",
  "Equity / Sweat Equity",
  "Stipend + Equity",
];
const ACADEMIC_YEARS = [
  "Any Year",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "Final Year",
  "Recent Graduate",
];
const DISCIPLINES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales & BD",
  "Finance & Accounting",
  "Operations",
  "HR & People Ops",
  "Content & Media",
  "Research",
  "Data Science",
  "Product Management",
  "Legal",
  "Other",
];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [storedPassword, setStoredPassword] = useState("");

  // Blog State
  const [activeTab, setActiveTab] = useState<"applications" | "blogs" | "jobs">(
    "applications"
  );
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<BlogPost>({
    title: "",
    excerpt: "",
    content: "",
    author: "ADMIN",
    image: null,
  });
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [isPreviewBlog, setIsPreviewBlog] = useState(false);

  // Job State
  const [jobsList, setJobsList] = useState<JobPost[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobPost[]>([]);
  const [reviews, setReviews] = useState<{
    [key: number]: { rating: number; comments: string };
  }>({});
  const [jobForm, setJobForm] = useState<JobPost>({
    title: "",
    company: "",
    company_url: "",
    location: "REMOTE",
    salary_min: 0,
    salary_max: 0,
    equity: "",
    tags: [],
    description: "",
    company_description: "",
    apply_url: "",
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [showReferralsFor, setShowReferralsFor] = useState<number | null>(null);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      author: "ADMIN",
      image: null,
    });
    setEditingBlogId(null);
    setIsPreviewBlog(false);
  };

  const getReadTime = (content: string) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const renderBlogPreview = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-red-500 text-white font-black text-center p-2 text-[10px] tracking-widest border-4 border-black border-t-0 -mt-8 relative z-10">
        ⚠️ PREVIEW_MODE: REALTIME_DRAFT_RELAY
      </div>

      <BrutalBox
        title={`PREVIEW_NODE_00${editingBlogId || "NEW"}`}
        className="bg-white p-0 relative"
      >
        {/* Full fidelity preview header */}
        <div className="border-b-8 border-black">
          {/* Local Image Preview */}
          <div className="border-b-4 border-black bg-gray-100 flex items-center justify-center min-h-[200px] overflow-hidden">
            {blogForm.image ? (
              <img
                src={
                  typeof blogForm.image === "string"
                    ? blogForm.image
                    : URL.createObjectURL(blogForm.image)
                }
                className="w-full object-cover max-h-[400px]"
                alt="Preview"
              />
            ) : editingBlogId ? (
              <img
                src={`${apiBase}/api/blogs/${editingBlogId}/image`}
                className="w-full object-cover max-h-[400px]"
                alt="Current"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-20">
                <ImageIcon size={48} />
                <span className="text-xs font-black uppercase">
                  NO_IMAGE_UPLOADED
                </span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-12">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-brutal-yellow px-3 py-1 border-2 border-black text-[10px] font-black uppercase shadow-solid-sm">
                <Calendar size={12} className="inline mr-1" />{" "}
                {new Date().toLocaleDateString()}
              </span>
              <span className="bg-brutal-blue px-3 py-1 border-2 border-black text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-solid-sm">
                <User size={12} /> {blogForm.author}
              </span>
              <span className="bg-black text-white px-3 py-1 border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-solid-sm">
                <Clock size={12} /> {getReadTime(blogForm.content)} MIN_READ
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-8 text-balance">
              {blogForm.title || "UNTITLED_LOG_ENTRY"}
            </h1>

            <p className="text-xl md:text-2xl font-bold italic leading-relaxed border-l-8 border-brutal-yellow pl-8 opacity-80 max-w-3xl">
              {blogForm.excerpt || "Awaiting TLDR payload..."}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-12 prose prose-lg max-w-none font-mono prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-4xl prose-p:leading-relaxed prose-p:mb-8 prose-img:border-8 prose-img:border-black prose-strong:bg-brutal-yellow prose-strong:px-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blogForm.content || "_Awaiting decrypted data stream..._"}
          </ReactMarkdown>

          <div className="mt-20 pt-12 border-t-8 border-black border-double flex flex-col items-center text-center">
            <div className="text-2xl mb-4">■ ■ ■</div>
            <p className="font-black uppercase tracking-widest text-[10px] italic opacity-50">
              END_OF_TRANSMISSION // INTERN_OS_SECURE_NODE_
              {editingBlogId || "NEW"}
            </p>
          </div>
        </div>
      </BrutalBox>

      <div className="bg-white border-4 border-black p-4 flex justify-between items-center">
        <div className="flex gap-4 text-[10px] font-black uppercase opacity-50">
          <span>
            Words: {blogForm.content ? blogForm.content.split(/\s+/).length : 0}
          </span>
          <span>Chars: {blogForm.content?.length || 0}</span>
        </div>
        <BrutalButton
          onClick={handleBlogSubmit}
          loading={isSubmittingBlog}
          className="bg-brutal-green text-black hover:bg-black hover:text-white px-8 py-2 text-sm"
        >
          {editingBlogId ? "EXECUTE_UPDATE" : "INITIATE_PUBLISH"}
        </BrutalButton>
      </div>
    </div>
  );

  const getTimeAgo = (dateStr: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
    );
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // Fetch blogs when tab changes
  useEffect(() => {
    if (activeTab === "blogs") {
      fetchBlogs();
    } else if (activeTab === "jobs") {
      fetchJobs();
      fetchReferrals();
    }
  }, [activeTab]);

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`${apiBase}/api/admin/referrals`);
      if (response.ok) {
        const data = await response.json();
        setReferrals(data);
      }
    } catch (error) {
      console.error("Failed to fetch referrals", error);
    }
  };

  const fetchJobs = async () => {
    try {
      // Fetch Active Jobs
      const response = await fetch(`${apiBase}/api/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobsList(data);
      }

      // Fetch Pending Jobs (Authenticated)
      const pendingResponse = await fetch(`${apiBase}/api/admin/jobs/pending`, {
        headers: { "Content-Type": "application/json" }, // Should pass auth here realistically if we implemented middleware
      });
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingJobs(pendingData);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  const handleApproveJob = async (id: number) => {
    try {
      const review = reviews[id] || { rating: 0, comments: "" };
      const res = await fetch(`${apiBase}/api/admin/jobs/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          password: storedPassword,
          rating: review.rating,
          comments: review.comments,
        }),
      });
      if (res.ok) {
        alert("Job Approved! ✅");
        fetchJobs();
      } else {
        alert("Failed to approve");
      }
    } catch (err) {
      alert("Error approving job");
    }
  };

  const handleRejectJob = async (id: number) => {
    if (!confirm("Reject and remove this job submission?")) return;
    try {
      const review = reviews[id] || { rating: 0, comments: "" };
      const res = await fetch(`${apiBase}/api/admin/jobs/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          password: storedPassword,
          comments: review.comments,
        }),
      });
      if (res.ok) {
        alert("Job Rejected ❌");
        fetchJobs();
      } else {
        alert("Failed to reject");
      }
    } catch (err) {
      alert("Error rejecting job");
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${apiBase}/api/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogsList(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    }
  };

  const handleLogin = async () => {
    setLoginError(null);
    try {
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setStoredPassword(password);
        setPassword("");
        fetchApplications();
      } else {
        setLoginError(data.error || "Invalid password");
      }
    } catch (err) {
      setLoginError("Failed to authenticate");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStoredPassword("");
    setApplications([]);
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/applications`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm("Delete this application?")) return;
    try {
      const response = await fetch(`${apiBase}/api/applications/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: storedPassword }),
      });
      if (response.ok) {
        setApplications(applications.filter((a) => a.id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const deleteAllApplications = async () => {
    if (!confirm("DELETE ALL APPLICATIONS? This cannot be undone!")) return;
    if (!confirm("Are you REALLY sure?")) return;
    try {
      const response = await fetch(`${apiBase}/api/applications`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: storedPassword }),
      });
      if (response.ok) {
        setApplications([]);
      } else {
        alert("Failed to delete all");
      }
    } catch (err) {
      alert("Failed to delete all");
    }
  };

  const parseSkills = (skills: string): string[] => {
    try {
      return JSON.parse(skills);
    } catch {
      return skills ? [skills] : [];
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const handleBlogSubmit = async () => {
    if (!blogForm.title || !blogForm.content) {
      alert("Title and Content are required");
      return;
    }

    setIsSubmittingBlog(true);
    try {
      const formData = new FormData();
      formData.append("title", blogForm.title);
      formData.append("excerpt", blogForm.excerpt);
      formData.append("content", blogForm.content);
      formData.append("author", blogForm.author);
      if (blogForm.image) {
        formData.append("image", blogForm.image);
      }

      const url = editingBlogId
        ? `${apiBase}/api/blogs/${editingBlogId}`
        : `${apiBase}/api/blogs`;

      const method = editingBlogId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        alert(editingBlogId ? "Blog Updated! 📝" : "Blog Post Created! 🔥");
        resetBlogForm();
        fetchBlogs();
      } else {
        alert("Failed to save post");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving post");
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      image: null, // Reset image input as we can't prefill file input
    });
    setEditingBlogId(blog.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`${apiBase}/api/blogs/${id}`, { method: "DELETE" });
      fetchBlogs();
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  // JOB HANDLERS
  const handleJobSubmit = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.description) {
      alert("Title, Company, and Description are required.");
      return;
    }
    setIsSubmittingJob(true);
    try {
      const url = editingJobId
        ? `${apiBase}/api/jobs/${editingJobId}`
        : `${apiBase}/api/jobs`;
      const method = editingJobId ? "PUT" : "POST";

      const payload = {
        ...jobForm,
        password: storedPassword, // Required for PUT (Admin check)
      };

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert(editingJobId ? "Job Updated! 💼" : "Job Posted! 💼");
        setJobForm({
          title: "",
          company: "",
          company_url: "",
          location: "REMOTE",
          locationType: "Remote",
          salary_min: 0,
          salary_max: 0,
          equity: "",
          tags: [],
          description: "",
          company_description: "",
          apply_url: "",
          linkedin_url: "",
          twitter_url: "",
          instagram_url: "",
        });
        setEditingJobId(null);
        fetchJobs();
      } else {
        alert("Failed to save job");
      }
    } catch (error) {
      alert("Error posting job");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleEditJob = (job: JobPost) => {
    setJobForm({
      ...job,
      tags: Array.isArray(job.tags) ? job.tags : [],
      location: job.location || "",
      locationType: job.location_type || "Remote",
      internship_type: job.internship_type || "Summer Internship",
      duration: job.duration || "3 Months",
      academic_year: job.academic_year || "Any Year",
      discipline: job.discipline || "Other",
      compensation_type: job.compensation_type || "Paid Stipend",
      linkedin_url: (job as any).linkedin_url || "",
      twitter_url: (job as any).twitter_url || "",
      instagram_url: (job as any).instagram_url || "",
      company_description: job.company_description || "",
    });
    setEditingJobId(job.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditJob = () => {
    setJobForm({
      title: "",
      company: "",
      company_url: "",
      location: "REMOTE",
      locationType: "Remote",
      salary_min: 0,
      salary_max: 0,
      equity: "",
      tags: [],
      description: "",
      company_description: "",
      apply_url: "",
      linkedin_url: "",
      twitter_url: "",
      instagram_url: "",
    });
    setEditingJobId(null);
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Delete this job listing?")) return;
    try {
      await fetch(`${apiBase}/api/jobs/${id}`, { method: "DELETE" });
      fetchJobs();
    } catch (error) {
      alert("Failed to delete job");
    }
  };

  const handleResequence = async () => {
    if (
      !confirm(
        "CONFIRM DATABASE RENORMALIZATION? THIS WILL RESET ALL IDS TO BE SEQUENTIAL (1, 2, 3...)."
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/admin/resequence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: storedPassword || password }),
      });

      const data = await response.json();
      if (data.success) {
        alert("DATABASE RENORMALIZED. IDS ARE NOW SEQUENTIAL.");
        fetchBlogs();
      } else {
        alert("FAILED TO RENORMALIZE: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("ERROR RENORMALIZING");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brutal-cream flex items-center justify-center p-4 font-mono">
        <div className="border-8 border-black bg-white p-8 shadow-brutal max-w-md w-full">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-black uppercase">ADMIN LOGIN</h1>
            <p className="text-sm opacity-50 mt-2">Enter password to access</p>
          </div>

          {loginError && (
            <div className="border-4 border-brutal-red bg-red-100 p-3 mb-4 text-center">
              <p className="font-bold text-brutal-red">{loginError}</p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="PASSWORD"
              className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue"
            />
            <BrutalButton onClick={handleLogin} className="w-full">
              AUTHENTICATE
            </BrutalButton>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm opacity-50 hover:opacity-100 underline"
            >
              ← Back to Application Form
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-brutal-cream p-4 md:p-8 font-mono">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12">
        <div className="border-8 border-black bg-white shadow-hard overflow-hidden">
          {/* Top Industrial Bar */}
          <div className="bg-black text-white px-6 py-2 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                SYSTEM_LIVE
              </span>
              <span>NODE: ADMIN_HQ_V1.1</span>
            </div>
            <div className="flex items-center gap-4">
              <span>DB_AUTH: VERIFIED</span>
              <span>SECURE: AES-256</span>
            </div>
          </div>

          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t-4 border-black">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                ADMIN<span className="text-brutal-blue">_</span>CENTER
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { id: "applications", label: "Applications", icon: Terminal },
                  { id: "blogs", label: "Blog Editor", icon: PenTool },
                  { id: "jobs", label: "Job Board", icon: Briefcase },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 font-black uppercase border-4 border-black transition-all flex items-center gap-2 text-xs shadow-solid-sm active:shadow-none active:translate-x-1 active:translate-y-1 ${
                      activeTab === tab.id
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Link to="/blogs" className="hidden md:block">
                <button className="bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs hover:bg-brutal-yellow transition-all shadow-solid-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
                  VIEW_SITE
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-brutal-red text-white border-4 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-2 shadow-solid-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <LogOut size={14} /> DISCONNECT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {activeTab === "applications" && (
          <>
            <div className="border-4 border-black bg-brutal-blue text-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">{applications.length}</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                TOTAL_APPLICANTS
              </p>
            </div>
            <div className="border-4 border-black bg-brutal-yellow p-6 shadow-solid-sm">
              <p className="text-4xl font-black text-black">
                {applications.filter((a) => a.subscribeToNewsletter).length}
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                NEWSLETTER_SUBS
              </p>
            </div>
            <div className="border-4 border-black bg-brutal-red text-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">
                {applications.filter((a) => a.cvFilename).length}
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                VERIFIED_CVs
              </p>
            </div>
            <div className="border-4 border-black bg-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">
                {new Set(applications.map((a) => a.department)).size}
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                DEPT_COVERAGE
              </p>
            </div>
          </>
        )}
        {activeTab === "blogs" && (
          <>
            <div className="border-4 border-black bg-black text-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">{blogsList.length}</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                PUBLISHED_LOGS
              </p>
            </div>
            <div className="border-4 border-black bg-white p-6 shadow-solid-sm col-span-3 flex items-center justify-between">
              <div>
                <p className="font-black text-xl uppercase leading-none">
                  {editingBlogId
                    ? "SYSTEM_STATUS: EDITING_NODE"
                    : "SYSTEM_STATUS: IDLE // READY"}
                </p>
                <p className="text-[10px] opacity-50 uppercase mt-2">
                  Operator: {blogForm.author} // Session: Encrypted
                </p>
              </div>
              {!editingBlogId && (
                <div className="hidden md:block w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </>
        )}
        {activeTab === "jobs" && (
          <>
            <div className="border-4 border-black bg-brutal-yellow p-6 shadow-solid-sm">
              <p className="text-4xl font-black">{jobsList.length}</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                ACTIVE_BOUNTIES
              </p>
            </div>
            <div className="border-4 border-black bg-brutal-red text-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">{pendingJobs.length}</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                PENDING_APPROVAL
              </p>
            </div>
            <div className="border-4 border-black bg-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">{referrals.length}</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                TOTAL_REFERRALS
              </p>
            </div>
            <div className="border-4 border-black bg-black text-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">
                ₹
                {Math.round(
                  jobsList.reduce(
                    (acc, job) => acc + (job.salary_max || 0),
                    0
                  ) / 1000
                )}
                k
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                TOTAL_VAL_POOL
              </p>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-4">
        <BrutalButton onClick={fetchApplications} disabled={loading}>
          <RefreshCw
            className={`inline mr-2 ${loading ? "animate-spin" : ""}`}
            size={16}
          />
          {loading ? "LOADING..." : "REFRESH DATA"}
        </BrutalButton>

        {applications.length > 0 && (
          <button
            onClick={deleteAllApplications}
            className="bg-brutal-red text-white border-4 border-black px-4 py-2 font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} /> DELETE ALL
          </button>
        )}

        {activeTab === "blogs" && (
          <button
            onClick={handleResequence}
            className="bg-brutal-yellow text-black border-4 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> NORMALIZE DB
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6 border-4 border-brutal-red bg-red-100 p-4">
          <p className="font-bold text-brutal-red">{error}</p>
        </div>
      )}

      {/* Applications List */}
      <main className="max-w-6xl mx-auto">
        {activeTab === "applications" && (
          <>
            {applications.length === 0 && !loading ? (
              <BrutalBox className="text-center py-16">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold">NO APPLICATIONS YET</p>
                <p className="text-sm opacity-75">
                  Applications will appear here when submitted.
                </p>
              </BrutalBox>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border-4 border-black bg-white shadow-brutal"
                  >
                    {/* Card Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                      onClick={() =>
                        setExpandedId(expandedId === app.id ? null : app.id)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl">
                          {app.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-lg uppercase">
                            {app.fullName}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail size={12} /> {app.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="bg-brutal-blue text-white px-2 py-1 text-xs font-bold uppercase">
                          {app.department}
                        </span>
                        <span className="text-xs text-gray-500 hidden md:block">
                          {formatDate(app.submittedAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteApplication(app.id);
                          }}
                          className="p-2 hover:bg-brutal-red hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        {expandedId === app.id ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === app.id && (
                      <div className="border-t-4 border-black p-4 bg-gray-50">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Left Column */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Phone
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone size={14} /> {app.phone || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Experience
                              </p>
                              <p className="flex items-center gap-2">
                                <Briefcase size={14} />{" "}
                                {app.experienceLevel.toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Skills
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parseSkills(app.skills).map((skill, i) => (
                                  <span
                                    key={i}
                                    className="bg-black text-white px-2 py-1 text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Newsletter
                              </p>
                              <p
                                className={
                                  app.subscribeToNewsletter
                                    ? "text-green-600 font-bold"
                                    : "text-gray-400"
                                }
                              >
                                {app.subscribeToNewsletter
                                  ? "✓ SUBSCRIBED"
                                  : "Not subscribed"}
                              </p>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Bio
                              </p>
                              <p className="text-sm">
                                {app.bio || "No bio provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Portfolio
                              </p>
                              {app.portfolioUrl ? (
                                <a
                                  href={app.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brutal-blue underline hover:text-brutal-red"
                                >
                                  {app.portfolioUrl}
                                </a>
                              ) : (
                                <p className="text-gray-400">No portfolio</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                CV
                              </p>
                              {app.cvFilename ? (
                                <a
                                  href={`${apiBase}/api/cv/${app.id}`}
                                  className="flex items-center gap-2 bg-brutal-yellow px-3 py-2 font-bold hover:bg-brutal-red hover:text-white transition-colors inline-block"
                                >
                                  <Download size={14} />
                                  {app.cvFilename}
                                </a>
                              ) : (
                                <p className="text-gray-400">No CV uploaded</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === "blogs" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* EDITOR COLUMN */}
              <BrutalBox
                title={editingBlogId ? "EDIT_LOG_ENTRY" : "NEW_LOG_ENTRY"}
                className="bg-white"
              >
                <div className="grid gap-6">
                  {editingBlogId && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-yellow-800 uppercase text-xs">
                          EDITING_EXISTING_NODE
                        </p>
                        <p className="text-[10px] text-yellow-700 font-mono">
                          ID: {editingBlogId}
                        </p>
                      </div>
                      <button
                        onClick={resetBlogForm}
                        className="text-black font-bold text-xs flex items-center gap-1 hover:underline uppercase"
                      >
                        <X size={14} /> CANCEL
                      </button>
                    </div>
                  )}
                  <BrutalInput
                    label="Article Title"
                    placeholder="ENTER TITLE"
                    value={blogForm.title}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, title: e.target.value })
                    }
                  />
                  <div className="relative">
                    <BrutalInput
                      label="Excerpt / TLDR"
                      placeholder="SHORT SUMMARY"
                      value={blogForm.excerpt}
                      onChange={(e) =>
                        setBlogForm({ ...blogForm, excerpt: e.target.value })
                      }
                    />
                    <div className="absolute right-2 bottom-2 text-[8px] font-black uppercase opacity-30">
                      {blogForm.excerpt.length} / 160
                    </div>
                  </div>

                  <BrutalTextArea
                    label="Main Content (Markdown)"
                    placeholder="# HEADING\n\nWRITE YOUR THOUGHTS..."
                    className="min-h-[500px] font-mono text-sm leading-relaxed mb-1"
                    value={blogForm.content}
                    onChange={(e) =>
                      setBlogForm({ ...blogForm, content: e.target.value })
                    }
                  />
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3">
                      <span className="text-[10px] font-black uppercase opacity-40 bg-gray-100 px-2 py-0.5 border border-black">
                        {blogForm.content
                          ? blogForm.content.split(/\s+/).length
                          : 0}{" "}
                        WORDS
                      </span>
                      <span className="text-[10px] font-black uppercase opacity-40 bg-gray-100 px-2 py-0.5 border border-black">
                        {getReadTime(blogForm.content)} MIN_READ
                      </span>
                    </div>
                    <div className="text-[10px] font-black uppercase opacity-40 italic">
                      MARKDOWN_SUPPORTED
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="border-4 border-black p-4 bg-gray-50 h-full">
                      <label className="font-bold uppercase block mb-2 flex items-center gap-2 text-xs">
                        <ImageIcon size={16} /> Cover Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setBlogForm({
                              ...blogForm,
                              image: e.target.files[0],
                            });
                          }
                        }}
                        className="block w-full text-[10px] font-mono file:mr-4 file:py-1 file:px-2 file:border-2 file:border-black file:text-[10px] file:font-bold file:bg-brutal-yellow file:text-black hover:file:bg-black hover:file:text-white transition-colors"
                      />
                      <p className="text-[9px] mt-2 opacity-40 leading-tight uppercase font-black">
                        Landscape aspect ratio (16:9) verified for optimal grid
                        display.
                      </p>
                    </div>

                    <div className="border-4 border-black p-4 bg-black text-white text-[10px] font-black uppercase tracking-widest leading-loose h-full">
                      <p className="border-b border-gray-700 pb-1 mb-2 text-brutal-yellow flex items-center gap-2">
                        <PenTool size={10} /> QUICK_MARKDOWN
                      </p>
                      <ul className="space-y-1 opacity-80">
                        <li className="flex justify-between">
                          <span># Heading</span>{" "}
                          <span className="text-gray-500">H1</span>
                        </li>
                        <li className="flex justify-between">
                          <span>**Bold**</span>{" "}
                          <span className="text-gray-500">STG</span>
                        </li>
                        <li className="flex justify-between">
                          <span>_Italic_</span>{" "}
                          <span className="text-gray-500">ITL</span>
                        </li>
                        <li className="flex justify-between">
                          <span>[Link](url)</span>{" "}
                          <span className="text-gray-500">URL</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8">
                    <BrutalButton
                      onClick={handleBlogSubmit}
                      loading={isSubmittingBlog}
                      className="w-full text-xl py-4 bg-brutal-yellow text-black hover:bg-black hover:text-white group"
                    >
                      <span className="group-hover:tracking-[0.2em] transition-all">
                        {editingBlogId
                          ? "EXECUTE_LOG_UPDATE"
                          : "PUBLISH_TO_NETWORK"}
                      </span>
                    </BrutalButton>
                  </div>
                </div>
              </BrutalBox>

              {/* LIVE PREVIEW COLUMN */}
              <div className="sticky top-8 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black uppercase opacity-40 flex items-center gap-2">
                    <Terminal size={12} /> REALTIME_PREVIEW_RELAY
                  </span>
                  <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                </div>
                {renderBlogPreview()}
              </div>
            </div>

            {/* List of Existing Blogs */}
            <div className="border-t-8 border-black pt-12">
              <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-2">
                <Terminal /> EXISTING LOGS DATABASE
              </h2>
              <div className="space-y-4">
                {blogsList.map((blog) => (
                  <div
                    key={blog.id}
                    className="border-4 border-black bg-white p-4 flex flex-col md:flex-row justify-between gap-4 group hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 border-2 border-black shrink-0 overflow-hidden hidden sm:block">
                        <img
                          src={`${apiBase}/api/blogs/${blog.id}/image`}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).parentElement!.style.display = "none";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-xl uppercase tracking-tighter">
                          {blog.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 my-2">
                          <span className="text-[10px] font-black uppercase opacity-60 bg-gray-100 px-1 border border-black">
                            ID: {blog.id}
                          </span>
                          <span className="text-[10px] font-black uppercase opacity-60 bg-gray-100 px-1 border border-black">
                            By: {blog.author}
                          </span>
                          <span className="text-[10px] font-black uppercase opacity-60 bg-gray-100 px-1 border border-black">
                            <Clock size={8} className="inline mb-0.5 mr-0.5" />{" "}
                            {getReadTime(blog.content)} MIN
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 md:items-center">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="bg-black text-white px-4 py-2 font-black text-xs uppercase hover:bg-brutal-blue transition-all flex items-center gap-2 h-fit"
                      >
                        <Edit size={14} /> MODIFY
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id!)}
                        className="bg-brutal-red text-white px-4 py-2 font-black text-xs uppercase hover:bg-black border-2 border-black transition-all flex items-center gap-2 h-fit"
                      >
                        <Trash2 size={14} /> PURGE
                      </button>
                    </div>
                  </div>
                ))}
                {blogsList.length === 0 && (
                  <p className="opacity-50 italic">
                    No logs found in the archives.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JOBS TAB CONTENT */}
        {activeTab === "jobs" && (
          <div className="space-y-12">
            <BrutalBox title="POST_NEW_BOUNTY" className="bg-white">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <BrutalInput
                    label="Job Title"
                    placeholder="E.G. FOUNDING ENGINEER"
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    required
                  />
                  <BrutalInput
                    label="Company Name"
                    placeholder="E.G. ACME CORP"
                    value={jobForm.company}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, company: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <BrutalInput
                    label="Company Website"
                    placeholder="HTTPS://..."
                    value={jobForm.company_url}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, company_url: e.target.value })
                    }
                  />
                  <BrutalInput
                    label="Location"
                    placeholder="REMOTE, NYC, SF..."
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Transparency Grid Input */}
                <div className="border-4 border-black p-4 bg-gray-50">
                  <label className="font-bold uppercase block mb-4 border-b-2 border-black pb-2">
                    Transparency Data (Required)
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <BrutalInput
                      label="Salary Min (₹)"
                      type="number"
                      placeholder="100000"
                      value={jobForm.salary_min}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          salary_min: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <BrutalInput
                      label="Salary Max (₹)"
                      type="number"
                      placeholder="150000"
                      value={jobForm.salary_max}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          salary_max: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <BrutalInput
                      label="Equity (%)"
                      placeholder="0.5% - 1.0%"
                      value={jobForm.equity}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, equity: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold uppercase block mb-2">
                      Location Type
                    </label>
                    <select
                      value={jobForm.locationType}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, locationType: e.target.value })
                      }
                      className="w-full border-4 border-black p-3 font-mono focus:outline-none focus:border-brutal-blue bg-white"
                    >
                      {LOCATION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold uppercase block mb-2">
                      Internship Type
                    </label>
                    <select
                      value={jobForm.internship_type}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          internship_type: e.target.value,
                        })
                      }
                      className="w-full border-4 border-black p-3 font-mono focus:outline-none focus:border-brutal-blue bg-white"
                    >
                      {INTERNSHIP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold uppercase block mb-2">
                      Duration
                    </label>
                    <select
                      value={jobForm.duration}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, duration: e.target.value })
                      }
                      className="w-full border-4 border-black p-3 font-mono focus:outline-none focus:border-brutal-blue bg-white"
                    >
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold uppercase block mb-2">
                      Academic Year
                    </label>
                    <select
                      value={jobForm.academic_year}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          academic_year: e.target.value,
                        })
                      }
                      className="w-full border-4 border-black p-3 font-mono focus:outline-none focus:border-brutal-blue bg-white"
                    >
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold uppercase block mb-2">
                      Discipline
                    </label>
                    <select
                      value={jobForm.discipline}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, discipline: e.target.value })
                      }
                      className="w-full border-4 border-black p-3 font-mono focus:outline-none focus:border-brutal-blue bg-white"
                    >
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold uppercase block mb-2">
                      Compensation Type
                    </label>
                    <select
                      value={jobForm.compensation_type}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          compensation_type: e.target.value,
                        })
                      }
                      className="w-full border-4 border-black p-3 font-mono focus:outline-none focus:border-brutal-blue bg-white"
                    >
                      {COMPENSATION_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <BrutalInput
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/..."
                    value={jobForm.linkedin_url}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, linkedin_url: e.target.value })
                    }
                  />
                  <BrutalInput
                    label="Twitter URL"
                    placeholder="https://twitter.com/..."
                    value={jobForm.twitter_url}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, twitter_url: e.target.value })
                    }
                  />
                  <BrutalInput
                    label="Instagram URL"
                    placeholder="https://instagram.com/..."
                    value={jobForm.instagram_url}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, instagram_url: e.target.value })
                    }
                  />
                </div>

                <BrutalInput
                  label="Tags (Comma Separated)"
                  placeholder="REACT, NODE, RUST..."
                  value={jobForm.tags.join(", ")}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      tags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                />

                <BrutalInput
                  label="External Apply URL (Optional)"
                  placeholder="LEAVE EMPTY TO USE INTERNAL SYSTEM"
                  value={jobForm.apply_url}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, apply_url: e.target.value })
                  }
                />

                <BrutalTextArea
                  label="Company Description"
                  placeholder="ABOUT THE COMPANY..."
                  className="min-h-[150px]"
                  value={jobForm.company_description}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      company_description: e.target.value,
                    })
                  }
                />

                <BrutalTextArea
                  label="Job Description"
                  placeholder="SELL THE MISSION. KEEP IT RAW."
                  className="min-h-[200px]"
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                  required
                />

                <BrutalButton
                  onClick={handleJobSubmit}
                  loading={isSubmittingJob}
                  className="w-full text-xl py-4"
                >
                  {editingJobId ? "UPDATE JOB" : "POST BOUNTY"}
                </BrutalButton>

                {editingJobId && (
                  <BrutalButton
                    onClick={cancelEditJob}
                    className="w-full text-xl py-4 mt-4 bg-gray-200 text-black border-black"
                  >
                    CANCEL EDIT
                  </BrutalButton>
                )}
              </div>
            </BrutalBox>

            {/* PENDING APPROVALS */}
            <div className="border-t-8 border-black pt-12 mb-12">
              <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-2 text-brutal-red">
                <Lock /> PENDING APPROVALS ({pendingJobs.length})
              </h2>
              <div className="space-y-8">
                {pendingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border-4 border-black bg-yellow-50 p-6 shadow-brutal"
                  >
                    <h3 className="font-black text-2xl mb-2">
                      {job.title} @ {job.company}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm font-mono border-b-2 border-black pb-4">
                      <div>
                        <p>
                          <strong>Location:</strong> {job.location} (
                          {job.location_type})
                        </p>
                        <p>
                          <strong>Type:</strong> {job.internship_type} |{" "}
                          {job.duration}
                        </p>
                        <p>
                          <strong>Comp:</strong> {job.compensation_type}
                        </p>
                        <p>
                          <strong>Stipend:</strong> ₹{job.salary_min} - ₹
                          {job.salary_max}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Discipline:</strong> {job.discipline}
                        </p>
                        <p>
                          <strong>Year:</strong> {job.academic_year}
                        </p>
                        <p>
                          <strong>Equity:</strong> {job.equity || "None"}
                        </p>
                        <p>
                          <strong>Applied:</strong>{" "}
                          {new Date(job.created_at || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-black p-4 mb-4">
                      <p className="font-bold border-b-2 border-black mb-2">
                        DESCRIPTION
                      </p>
                      <p className="whitespace-pre-wrap text-sm">
                        {job.description}
                      </p>
                    </div>

                    {/* ADMIN REVIEW AREA */}
                    <div className="bg-black text-white p-4">
                      <p className="font-bold mb-2 uppercase text-brutal-yellow">
                        Admin Review
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs uppercase block mb-1">
                            Rating (1-5)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="w-full text-black p-2 font-bold"
                            value={reviews[job.id!]?.rating || 0}
                            onChange={(e) =>
                              setReviews({
                                ...reviews,
                                [job.id!]: {
                                  ...reviews[job.id!],
                                  rating: parseInt(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase block mb-1">
                            Comments (Internal)
                          </label>
                          <textarea
                            className="w-full text-black p-2 text-sm"
                            placeholder="Add notes..."
                            value={reviews[job.id!]?.comments || ""}
                            onChange={(e) =>
                              setReviews({
                                ...reviews,
                                [job.id!]: {
                                  ...reviews[job.id!],
                                  comments: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApproveJob(job.id!)}
                          className="flex-1 bg-brutal-green text-black font-black uppercase py-3 hover:bg-white transition-colors"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleRejectJob(job.id!)}
                          className="flex-1 bg-brutal-red text-white font-black uppercase py-3 hover:bg-black border-2 border-white transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingJobs.length === 0 && (
                  <p className="opacity-50">No pending jobs.</p>
                )}
              </div>
            </div>

            <div className="border-t-8 border-black pt-12">
              <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-2">
                <Briefcase /> ACTIVE BOUNTIES
              </h2>
              <div className="space-y-4">
                {jobsList.map((job) => (
                  <React.Fragment key={job.id}>
                    <div className="border-4 border-black bg-white p-4 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-black text-xl">
                          {job.title} @ {job.company}
                        </h3>
                        <div className="flex gap-2 my-2 text-xs font-bold font-mono">
                          <span className="bg-green-100 px-2 py-1 border border-black">
                            ₹{job.salary_min.toLocaleString()} - ₹
                            {job.salary_max.toLocaleString()}
                          </span>
                          <span className="bg-purple-100 px-2 py-1 border border-black">
                            {job.equity || "NO EQUITY"}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 border border-black">
                            {job.location}
                          </span>
                        </div>
                        <p className="opacity-50 text-sm">ID: {job.id}</p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-2">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="bg-brutal-yellow text-black px-4 py-2 font-bold hover:bg-white border-2 border-black transition-colors flex items-center gap-2 h-fit mb-2"
                        >
                          <Edit size={16} /> EDIT
                        </button>
                        <button
                          onClick={() =>
                            setShowReferralsFor(
                              showReferralsFor === job.id ? null : job.id!
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 font-bold hover:bg-black border-2 border-black transition-colors flex items-center gap-2 h-fit mb-2"
                        >
                          <Users size={16} /> REFERRALS (
                          {referrals.filter((r) => r.job_id === job.id).length})
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id!)}
                          className="bg-brutal-red text-white px-4 py-2 font-bold hover:bg-black transition-colors flex items-center gap-2 h-fit"
                        >
                          <Trash2 size={16} /> DELETE
                        </button>
                      </div>
                    </div>

                    {/* REFERRALS EXPAND */}
                    {showReferralsFor === job.id && (
                      <div className="bg-gray-100 border-4 border-black p-4 mb-4 -mt-4">
                        <h4 className="font-bold border-b-2 border-black mb-2">
                          CANDIDATES
                        </h4>
                        {referrals.filter((r) => r.job_id === job.id).length ===
                        0 ? (
                          <p className="opacity-50">No referrals yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {referrals
                              .filter((r) => r.job_id === job.id)
                              .map((ref) => (
                                <div
                                  key={ref.id}
                                  className="bg-white border-2 border-black p-2 text-sm"
                                >
                                  <p>
                                    <strong>{ref.name}</strong> ({ref.email})
                                  </p>
                                  <div className="flex gap-2 text-xs">
                                    <a
                                      href={ref.linkedin}
                                      target="_blank"
                                      className="underline text-blue-600"
                                    >
                                      LinkedIn
                                    </a>
                                    <span>•</span>
                                    <span>
                                      {new Date(
                                        ref.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 italic">"{ref.why_me}"</p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
                {jobsList.length === 0 && (
                  <p className="opacity-50 italic">No active job listings.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 border-t-4 border-black pt-4 text-center">
        <p className="text-sm opacity-50">ADMIN_PANEL // INTERN_OS</p>
      </footer>
    </div>
  );
}
