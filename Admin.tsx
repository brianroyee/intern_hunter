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
import { supabase, SUPABASE_CONFIG } from "./lib/supabase";

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image: File | null;
  imageId?: string; // This will hold the Public URL in Supabase context or just remain unused if we use image_url directly
  imageUrl?: string;
  createdAt?: string;
}

interface JobPost {
  id?: string;
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
  locationType?: string;
  internshipType?: string;
  duration?: string;
  academicYear?: string;
  discipline?: string;
  compensationType?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  admin_rating?: number;
  admin_comments?: string;
  status?: string;
  creatorId?: string;
}

interface Application {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  appliedAt: string;
  // Snapshot Fields
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  experienceLevel?: string;
  skills?: string;
  education?: string;
  bio?: string;
  portfolioUrl?: string;
  cvFileId?: string; // Will store Path or URL
  cvUrl?: string; // Direct URL
  cvFilename?: string;
  subscribeToNewsletter?: boolean;
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
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isPreviewBlog, setIsPreviewBlog] = useState(false);

  // Job State
  const [jobsList, setJobsList] = useState<JobPost[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobPost[]>([]);
  const [reviews, setReviews] = useState<{
    [key: string]: { rating: number; comments: string };
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
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Applications State
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const getTimeAgo = (dateStr: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
    );
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  useEffect(() => {
    if (activeTab === "blogs") {
      fetchBlogs();
    } else if (activeTab === "jobs") {
      fetchJobs();
    } else if (activeTab === "applications") {
      fetchApps();
    }
  }, [activeTab]);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const posts = (data || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        excerpt: doc.excerpt,
        content: doc.content,
        author: doc.author,
        createdAt: doc.created_at,
        imageUrl: doc.image_url,
        image: null,
      }));
      setBlogsList(posts);
    } catch (error) {
      console.error("Failed blogs fetch", error);
    }
  };

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const apps = (data || []).map((doc: any) => ({
        id: doc.id,
        studentId: doc.student_id,
        jobId: doc.job_id,
        status: doc.status,
        appliedAt: doc.created_at,
        fullName: doc.full_name,
        email: doc.email,
        phone: doc.phone,
        department: doc.department,
        education: doc.education,
        experienceLevel: doc.experience_level,
        skills: JSON.stringify(doc.skills), // Convert JSONB to string for UI compatibility if needed
        bio: doc.bio,
        portfolioUrl: doc.portfolio_url,
        cvUrl: doc.cv_url,
        cvFilename: doc.cv_filename,
        subscribeToNewsletter: doc.subscribeToNewsletter,
      }));
      setApplications(apps);
    } catch (error) {
      console.error("Failed apps fetch", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allJobs: JobPost[] = (data || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        company: doc.company,
        company_url: doc.company_url,
        location: doc.location,
        locationType: doc.location_type,
        internshipType: doc.internship_type,
        salary_min: doc.salary_min,
        salary_max: doc.salary_max,
        equity: doc.equity,
        tags: doc.tags || [], // JSONB returns array
        description: doc.description,
        apply_url: doc.apply_url,
        status: doc.status,
        created_at: doc.created_at,
        duration: doc.duration,
        academicYear: doc.academic_year,
        discipline: doc.discipline,
        compensationType: doc.compensation_type,
        linkedin_url: doc.linkedin_url,
        twitter_url: doc.twitter_url,
        instagram_url: doc.instagram_url,
        company_description: doc.company_description,
        admin_rating: doc.admin_rating,
        admin_comments: doc.admin_comments,
      }));

      setJobsList(allJobs.filter((j) => j.status === "active"));
      setPendingJobs(allJobs.filter((j) => j.status === "pending"));
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  const handleApproveJob = async (
    id: string,
    rating?: number,
    comments?: string
  ) => {
    try {
      // If we are just approving via the simple button, we might not have rating/comments
      // But let's support them if passed (UI might need updating to pass them)
      const updateData: any = { status: "active" };
      if (rating !== undefined) updateData.admin_rating = rating;
      if (comments !== undefined) updateData.admin_comments = comments;

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      alert("Job Approved! ✅");
      fetchJobs();
    } catch (err) {
      alert("Error approving job");
    }
  };

  const handleRejectJob = async (id: string, comments?: string) => {
    try {
      const updateData: any = { status: "rejected" };
      if (comments) updateData.admin_comments = comments;

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      alert("Job Rejected! ❌");
      fetchJobs();
    } catch (e) {
      alert("Error rejecting job");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Delete this job permanently?")) return;
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      fetchJobs();
    } catch (e) {
      alert("Error deleting job");
    }
  };
  const handleLogin = async () => {
    // Determine if user is authorized. For now, simple password check against env or hardcoded.
    // Ideally use Appwrite Account session.
    // For this migration, we'll keep the password gate but rely on Appwrite for data.
    // Or we can just pretend 'admin' is the password.
    if (password === "admin") {
      // Replace with better check later
      setIsAuthenticated(true);
      setStoredPassword(password);
      setPassword("");
      fetchApps(); // Initial fetch
    } else {
      setLoginError("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStoredPassword("");
    setApplications([]);
  };

  const deleteApplication = async (appId: string) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS APPLICATION?"))
      return;
    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", appId);

      if (error) throw error;

      setApplications(applications.filter((a) => a.id !== appId));
    } catch (error) {
      console.error("Failed to delete application", error);
      alert("Failed to delete application");
    }
  };

  const deleteAllApplications = async () => {
    if (
      !window.confirm(
        "WARNING: THIS WILL DELETE ALL APPLICATIONS. THIS ACTION CANNOT BE UNDONE. CONTINUE?"
      )
    )
      return;

    alert("Bulk delete not fully implemented in this version for safety.");
  };

  // Helper to parse skills from JSON string
  const parseSkills = (skillsJson: string | undefined): string[] => {
    if (!skillsJson) return [];
    try {
      return JSON.parse(skillsJson);
    } catch (e) {
      // Handle case where it might already be an object or invalid
      if (typeof skillsJson === "object") return skillsJson as string[];
      return [];
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const handleBlogSubmit = async () => {
    if (!blogForm.title || !blogForm.content) {
      alert("Please fill in Title and Content");
      return;
    }

    setIsSubmittingBlog(true);
    try {
      let imageUrl =
        editingBlogId && (blogForm as any).imageUrl
          ? (blogForm as any).imageUrl
          : null;

      // Handle Image Upload
      if (blogForm.image && blogForm.image instanceof File) {
        try {
          const fileExt = blogForm.image.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { data, error } = await supabase.storage
            .from("blog-images")
            .upload(filePath, blogForm.image);

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from("blog-images").getPublicUrl(data.path);

          imageUrl = publicUrl;
        } catch (e) {
          console.error("Image upload failed", e);
          alert("Image upload failed, proceeding without image update.");
        }
      }

      const payload: any = {
        title: blogForm.title,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        author: blogForm.author,
        image_url: imageUrl,
      };

      if (editingBlogId) {
        // Update
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingBlogId);
        if (error) throw error;
        alert("Blog Updated! 📝");
      } else {
        // Create
        const { error } = await supabase.from("blog_posts").insert([payload]);
        if (error) throw error;
        alert("Blog Published! 🚀");
      }

      resetBlogForm();
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to save blog post");
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleEditBlog = (post: BlogPost) => {
    setBlogForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      image: null,
      imageUrl: post.imageUrl,
    } as any);
    setEditingBlogId(post.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      fetchBlogs();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  // JOB HANDLERS
  const handleJobSubmit = async () => {
    if (!jobForm.title || !jobForm.company) {
      alert("Title and Company are required.");
      return;
    }
    setIsSubmittingJob(true);
    try {
      const payload: any = {
        title: jobForm.title,
        company: jobForm.company,
        company_url: jobForm.company_url,
        location: jobForm.location,
        location_type: jobForm.locationType || "Remote",
        internship_type: jobForm.internshipType || "Summer Internship",
        salary_min: Number(jobForm.salary_min),
        salary_max: Number(jobForm.salary_max),
        equity: jobForm.equity,
        tags: jobForm.tags, // JSONB accepts array
        description: jobForm.description,
        company_description: jobForm.company_description,
        apply_url: jobForm.apply_url,
        academic_year: jobForm.academicYear,
        compensation_type: jobForm.compensationType,
        linkedin_url: jobForm.linkedin_url,
        twitter_url: jobForm.twitter_url,
        instagram_url: jobForm.instagram_url,
        duration: jobForm.duration,
        discipline: jobForm.discipline,
      };

      if (editingJobId) {
        const { error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", editingJobId);

        if (error) throw error;
        alert("Job Updated! 💼");
      } else {
        payload.status = "active";
        const { error } = await supabase.from("jobs").insert([payload]);

        if (error) throw error;
        alert("Job Posted! 💼");
      }

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
        academicYear: "Any Year",
        compensationType: "Paid Stipend",
        internshipType: "Summer Internship",
        duration: "3 Months",
        discipline: "Other",
      });
      setEditingJobId(null);
      fetchJobs();
    } catch (error) {
      console.error(error);
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
      locationType: job.locationType || "Remote",
      internshipType: job.internshipType || "Summer Internship",
      duration: job.duration || "3 Months",
      academicYear: job.academicYear || "Any Year",
      discipline: job.discipline || "Other",
      compensationType: job.compensationType || "Paid Stipend",
      linkedin_url: job.linkedin_url || "",
      twitter_url: job.twitter_url || "",
      instagram_url: job.instagram_url || "",
      company_description: job.company_description || "",
    } as any);
    setEditingJobId(job.id || null);
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
      academicYear: "Any Year",
      compensationType: "Paid Stipend",
      internshipType: "Summer Internship",
    });
    setEditingJobId(null);
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
        <div className="border-b-8 border-black">
          <div className="border-b-4 border-black bg-gray-100 flex items-center justify-center min-h-[200px] overflow-hidden">
            {blogForm.image && blogForm.image instanceof File ? (
              <img
                src={URL.createObjectURL(blogForm.image)}
                className="w-full object-cover max-h-[400px]"
                alt="Preview"
              />
            ) : (blogForm as any).imageUrl ? (
              <img
                src={(blogForm as any).imageUrl}
                className="w-full object-cover max-h-[400px]"
                alt="Featured"
              />
            ) : (
              <div className="p-8 text-center text-gray-400 font-mono text-sm uppercase">
                NO_DATA_STREAM // INSERT_IMAGE
              </div>
            )}
          </div>

          <div className="p-4 md:p-12">
            <div className="flex flex-wrap gap-1.5 mb-6 md:mb-8">
              <span className="bg-brutal-yellow px-2 py-0.5 border-2 border-black text-[10px] md:text-xs font-black uppercase shadow-solid-sm">
                <Calendar size={10} className="inline mr-1" />{" "}
                {new Date().toLocaleDateString()}
              </span>
              <span className="bg-brutal-blue px-2 py-0.5 border-2 border-black text-white text-[10px] md:text-xs font-black uppercase flex items-center gap-1 shadow-solid-sm">
                <User size={10} /> {blogForm.author}
              </span>
              <span className="bg-black text-white px-2 py-0.5 border-2 border-black text-[10px] md:text-xs font-black uppercase flex items-center gap-1 shadow-solid-sm">
                <Clock size={10} /> {getReadTime(blogForm.content)} MIN
              </span>
            </div>

            <h1 className="text-3xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8 text-balance">
              {blogForm.title || "UNTITLED_LOG_ENTRY"}
            </h1>

            <p className="text-lg md:text-2xl font-bold italic leading-relaxed border-l-4 md:border-l-8 border-brutal-yellow pl-4 md:pl-8 opacity-80 max-w-3xl">
              {blogForm.excerpt || "Awaiting TLDR payload..."}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-12 prose prose-lg max-w-none font-mono prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-4xl prose-p:leading-relaxed prose-p:mb-8 prose-img:border-8 prose-img:border-black prose-strong:bg-brutal-yellow prose-strong:px-1">
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
            <div className="border-4 border-black bg-brutal-green p-6 shadow-solid-sm">
              <p className="text-4xl font-black text-black">
                {applications.filter((a) => a.status === "accepted").length}
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                ACCEPTED
              </p>
            </div>
            <div className="border-4 border-black bg-brutal-red text-white p-6 shadow-solid-sm">
              <p className="text-4xl font-black">
                {applications.filter((a) => a.status === "rejected").length}
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                REJECTED
              </p>
            </div>
            <div className="border-4 border-black bg-brutal-yellow p-6 shadow-solid-sm">
              <p className="text-4xl font-black">
                {
                  applications.filter(
                    (a) => !a.status || a.status === "pending"
                  ).length
                }
              </p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                PENDING
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
            <div className="border-4 border-black bg-white p-6 shadow-solid-sm text-gray-400">
              <p className="text-4xl font-black">0</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                REFERRALS (N/A)
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
        <BrutalButton onClick={fetchApps} disabled={loading}>
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
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl uppercase">
                          {app.fullName ? app.fullName.substring(0, 2) : "?"}
                        </div>
                        <div>
                          <h3 className="font-black text-lg uppercase truncate max-w-[200px]">
                            {app.fullName ||
                              (app.studentId
                                ? `STUDENT: ${app.studentId}`
                                : "UNKNOWN CANDIDATE")}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            {app.department && (
                              <span className="font-bold">
                                {app.department} //{" "}
                              </span>
                            )}
                            <Briefcase size={12} /> Job ID: {app.jobId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold uppercase ${
                            app.status === "accepted"
                              ? "bg-brutal-green"
                              : app.status === "rejected"
                              ? "bg-brutal-red text-white"
                              : "bg-brutal-yellow"
                          }`}
                        >
                          {app.status || "PENDING"}
                        </span>
                        <span className="text-xs text-gray-500 hidden md:block">
                          {app.appliedAt ? formatDate(app.appliedAt) : "N/A"}
                        </span>
                        {app.cvFileId && (
                          <a
                            href={
                              supabase.storage
                                .from(SUPABASE_CONFIG.storageBucketResumes)
                                .getPublicUrl(app.cvFileId).data.publicUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
                            title="Download CV"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={16} />
                          </a>
                        )}
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
                                Application ID
                              </p>
                              <p className="font-mono text-xs">{app.id}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Student ID
                              </p>
                              <p className="font-mono text-xs">
                                {app.studentId}
                              </p>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold uppercase text-gray-500">
                                Job ID
                              </p>
                              <p className="font-mono text-xs">{app.jobId}</p>
                            </div>
                            <div className="p-4 bg-gray-100 border-2 border-black text-xs font-mono">
                              <p className="font-bold mb-2">SNAPSHOT DATA:</p>
                              <p>EMAIL: {app.email || "N/A"}</p>
                              <p>PHONE: {app.phone || "N/A"}</p>
                              <p>EXP: {app.experienceLevel || "N/A"}</p>
                              <p>BIO: {app.bio || "N/A"}</p>
                              <p className="truncate">
                                PORTFOLIO: {app.portfolioUrl || "N/A"}
                              </p>
                              <p>SKILLS: {app.skills || "N/A"}</p>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch h-[calc(100vh-380px)] min-h-[650px] overflow-hidden">
              {/* EDITOR COLUMN */}
              <BrutalBox
                title={editingBlogId ? "EDIT_LOG_ENTRY" : "NEW_LOG_ENTRY"}
                className="bg-white h-full flex flex-col p-0 overflow-hidden"
              >
                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-100">
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
                </div>

                {/* FIXED ACTION BAR */}
                <div className="border-t-4 border-black p-4 bg-gray-50 flex justify-between items-center z-20 shrink-0">
                  <div className="flex gap-4">
                    <button
                      onClick={resetBlogForm}
                      className="bg-white border-2 border-black p-2 hover:bg-brutal-red hover:text-white transition-colors"
                      title="RESET_FORM"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <BrutalButton
                    onClick={handleBlogSubmit}
                    loading={isSubmittingBlog}
                    className="bg-brutal-yellow text-black hover:bg-black hover:text-white px-10 py-3 text-lg font-black italic shadow-solid"
                  >
                    {editingBlogId
                      ? "EXECUTE_LOG_UPDATE"
                      : "PUBLISH_TO_NETWORK"}
                  </BrutalButton>
                </div>
              </BrutalBox>

              {/* LIVE PREVIEW COLUMN */}
              <div className="flex flex-col h-full overflow-hidden border-4 border-black bg-white shadow-hard relative">
                <div className="absolute -top-3 left-4 bg-black text-white border-2 border-black px-2 py-0.5 transform -rotate-1 z-20">
                  <span className="font-display font-bold uppercase text-[10px] tracking-wider flex items-center gap-2">
                    <Terminal size={10} /> REALTIME_PREVIEW_RELAY
                  </span>
                </div>

                <div className="absolute top-2 right-4 flex items-center gap-2 z-20 bg-white/80 backdrop-blur px-2 py-1 border border-black text-[8px] font-black uppercase">
                  <span>SYNC_ACTIVE</span>
                  <span className="bg-green-500 w-1.5 h-1.5 rounded-full animate-pulse"></span>
                </div>

                <div className="flex-grow overflow-y-auto p-8 pt-12 scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-100 bg-gray-50">
                  {renderBlogPreview()}
                </div>

                <div className="border-t-4 border-black p-4 bg-white flex justify-between items-center shrink-0">
                  <div className="text-[10px] font-black uppercase opacity-40">
                    MONITORING_DRAFT_CID: {editingBlogId || "NEW"}
                  </div>
                  <div className="flex gap-2 text-[10px] font-black uppercase opacity-60">
                    <span>
                      WORDS: {blogForm.content?.split(/\s+/).length || 0}
                    </span>
                    <span>READ: {getReadTime(blogForm.content)}M</span>
                  </div>
                </div>
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
                        {blog.imageUrl ? (
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <div className="w-full h-full bg-brutal-yellow flex items-center justify-center font-black text-xs">
                            IMG
                          </div>
                        )}
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
                        onClick={() => handleDeleteBlog(blog.id)}
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
                      value={jobForm.internshipType}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          internshipType: e.target.value,
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
                      value={jobForm.academicYear}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          academicYear: e.target.value,
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
                      value={jobForm.compensationType}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          compensationType: e.target.value,
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
                          {job.locationType})
                        </p>
                        <p>
                          <strong>Type:</strong> {job.internshipType} |{" "}
                          {job.duration}
                        </p>
                        <p>
                          <strong>Comp:</strong> {job.compensationType}
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
                          <strong>Year:</strong> {job.academicYear}
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
                            value={reviews[job.id]?.rating || 0}
                            onChange={(e) =>
                              setReviews({
                                ...reviews,
                                [job.id]: {
                                  ...reviews[job.id],
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
                            value={reviews[job.id]?.comments || ""}
                            onChange={(e) =>
                              setReviews({
                                ...reviews,
                                [job.id]: {
                                  ...reviews[job.id],
                                  comments: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApproveJob(job.id)}
                          className="flex-1 bg-brutal-green text-black font-black uppercase py-3 hover:bg-white transition-colors"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleRejectJob(job.id)}
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
                        {/* Referrals Logic Removed for Appwrite Migration */}
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-brutal-red text-white px-4 py-2 font-bold hover:bg-black transition-colors flex items-center gap-2 h-fit"
                        >
                          <Trash2 size={16} /> DELETE
                        </button>
                      </div>
                    </div>
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
