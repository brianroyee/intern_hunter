import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
  BrutalTextArea,
} from "./components/BrutalComponents";
import {
  MapPin,
  Briefcase,
  ArrowLeft,
  Globe,
  Share2,
  ShieldCheck,
  CheckCircle,
  X,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  company_url: string;
  location: string;
  salary_min: number;
  salary_max: number;
  equity: string;
  tags: string[];
  description: string;
  apply_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  created_at?: string;
  location_type?: string;
  company_description?: string;
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Referral Form State
  const [refForm, setRefForm] = useState({
    name: "",
    email: "",
    linkedin: "",
    why_me: "",
  });
  const [submittingRef, setSubmittingRef] = useState(false);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`${apiBase}/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error("Failed to fetch job", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!job) return;
    if (job.apply_url) {
      window.open(job.apply_url, "_blank");
    } else {
      // If no external URL, we could route to our internal apply page,
      // passing the job title in state or query param.
      // For now, let's just alert or redirect to /apply
      window.location.href = "/apply";
    }
  };

  const handleReferralSubmit = async () => {
    if (!refForm.name || !refForm.email || !refForm.why_me) {
      alert("Please fill in the required fields.");
      return;
    }
    setSubmittingRef(true);
    try {
      const response = await fetch(`${apiBase}/api/referral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job?.id,
          ...refForm,
        }),
      });
      if (response.ok) {
        alert(
          "Request Sent! We'll review your profile and connect you if it's a match. 🤝"
        );
        setShowReferralModal(false);
        setRefForm({ name: "", email: "", linkedin: "", why_me: "" });
      } else {
        alert("Failed to send request.");
      }
    } catch (error) {
      alert("Error sending request.");
    } finally {
      setSubmittingRef(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brutal-cream flex items-center justify-center font-bold text-2xl font-mono animate-pulse">
        LOADING BOUNTY_DATA...
      </div>
    );
  if (!job)
    return (
      <div className="min-h-screen bg-brutal-cream flex items-center justify-center font-bold text-2xl font-mono">
        JOB NOT FOUND (404)
      </div>
    );

  return (
    <div className="min-h-screen bg-brutal-cream font-mono">
      {/* HEADER */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <Link
            to="/hire"
            className="font-bold uppercase flex items-center gap-2 hover:underline"
          >
            <ArrowLeft size={20} /> BACK TO BOARD
          </Link>
          <Link
            to="/"
            className="text-xl font-black uppercase tracking-tighter"
          >
            INTERN_OS
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* HERO HEADER */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {job.company_url ? (
                <a
                  href={job.company_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors font-bold uppercase shrink-0 w-fit"
                >
                  <Globe size={18} /> {job.company} Website
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 border-2 border-black px-4 py-2 bg-gray-200 text-gray-500 font-bold uppercase shrink-0 w-fit cursor-not-allowed"
                >
                  <Globe size={18} />{" "}
                  <span className="line-through">WEBSITE</span>
                </button>
              )}
              {job.linkedin_url && (
                <a
                  href={job.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-brutal-blue hover:text-white transition-colors font-bold uppercase shrink-0 w-fit"
                >
                  <Linkedin size={18} /> LinkedIn
                </a>
              )}
              {job.twitter_url && (
                <a
                  href={job.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors font-bold uppercase shrink-0 w-fit"
                >
                  <Twitter size={18} />
                </a>
              )}
              {job.instagram_url && (
                <a
                  href={job.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-pink-600 hover:text-white transition-colors font-bold uppercase shrink-0 w-fit"
                >
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xl font-bold uppercase opacity-60 flex items-center gap-2">
              <Briefcase /> AT {job.company}
            </p>
            <p className="text-sm font-bold opacity-40 uppercase">
              POSTED{" "}
              {Math.floor(
                (new Date().getTime() -
                  new Date(job.created_at || "").getTime()) /
                  (1000 * 3600 * 24)
              ) < 1
                ? "Today"
                : `${Math.floor(
                    (new Date().getTime() -
                      new Date(job.created_at || "").getTime()) /
                      (1000 * 3600 * 24)
                  )}d ago`}
            </p>
          </div>
        </div>

        {/* TRANSPARENCY GRID ("THE OFFER") */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-black bg-white shadow-brutal">
          <div className="p-4 border-b-4 md:border-b-0 md:border-r-4 border-black text-center md:text-left">
            <p className="text-xs font-bold uppercase opacity-50 mb-1">
              Total Comp (Cash)
            </p>
            <p className="text-lg md:text-2xl font-black text-green-700">
              ₹{(job.salary_min / 1000).toFixed(0)}k - ₹
              {(job.salary_max / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="p-4 border-b-4 md:border-b-0 md:border-r-4 border-black text-center md:text-left">
            <p className="text-xs font-bold uppercase opacity-50 mb-1">
              Equity Upside
            </p>
            <p className="text-lg md:text-2xl font-black text-purple-700">
              {job.equity || "N/A"}
            </p>
          </div>
          <div className="p-4 border-r-4 border-black text-center md:text-left">
            <p className="text-xs font-bold uppercase opacity-50 mb-1">
              Location Mode
            </p>
            <p className="text-lg md:text-2xl font-black">{job.location}</p>
            <p className="text-sm font-bold opacity-50 uppercase">
              {job.location_type || "Remote"}
            </p>
          </div>
          <div className="p-4 text-center md:text-left">
            <p className="text-xs font-bold uppercase opacity-50 mb-1">
              Verified By
            </p>
            <p className="text-lg md:text-2xl font-black flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="text-brutal-blue" /> ADMIN
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          {/* Description */}
          <div className="space-y-6">
            <BrutalBox title="MISSION BRIEF" className="bg-white min-h-[400px]">
              <div className="prose font-mono whitespace-pre-wrap">
                {job.description}
              </div>
            </BrutalBox>

            {job.company_description && (
              <BrutalBox title={`ABOUT ${job.company}`} className="bg-white">
                <div className="prose font-mono whitespace-pre-wrap">
                  {job.company_description}
                </div>
              </BrutalBox>
            )}

            <div className="border-4 border-black bg-gray-100 p-6">
              <h3 className="font-bold uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                <CheckCircle size={18} /> THE STACK / TAGS
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-black text-white px-3 py-1 font-bold uppercase text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <button
                onClick={handleApply}
                className="w-full bg-black text-white border-4 border-black py-4 font-black text-xl uppercase hover:bg-white hover:text-black hover:shadow-hard transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                APPLY NOW
              </button>

              <div className="text-center p-2">
                <p className="font-bold text-sm mb-2 opacity-50">- OR -</p>
              </div>

              <button
                onClick={() => setShowReferralModal(true)}
                className="w-full bg-brutal-yellow text-black border-4 border-black py-3 font-bold text-lg uppercase hover:bg-white hover:shadow-hard transition-all flex flex-col items-center"
              >
                <span>Request Referral</span>
                <span className="text-[10px] opacity-75">
                  SKIP THE QUEUE 🚀
                </span>
              </button>

              <button
                onClick={() => {
                  const shareText = `${job.title} at ${job.company}\n${window.location.href}`;
                  navigator.clipboard.writeText(shareText);
                  alert("Link & Details Copied!");
                }}
                className="w-full bg-white text-black border-4 border-black py-2 font-bold uppercase hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> SHARE BOUNTY
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* REFERRAL MODAL */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute -top-6 -right-6 bg-white border-4 border-black p-2 hover:bg-brutal-red hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>
            <BrutalBox
              title="VIP ACCESS REQUEST"
              className="bg-brutal-cream border-8"
            >
              <p className="mb-6 font-bold text-sm">
                Want us to vouch for you? Fill this out and if you're legit,
                we'll send a direct intro to the founder/hiring manager.
              </p>
              <div className="space-y-4">
                <BrutalInput
                  label="Your Name"
                  placeholder="JOHN DOE"
                  value={refForm.name}
                  onChange={(e) =>
                    setRefForm({ ...refForm, name: e.target.value })
                  }
                />
                <BrutalInput
                  label="Email"
                  placeholder="YOU@EXAMPLE.COM"
                  value={refForm.email}
                  onChange={(e) =>
                    setRefForm({ ...refForm, email: e.target.value })
                  }
                />
                <BrutalInput
                  label="LinkedIn / Portfolio"
                  placeholder="LINKEDIN.COM/IN/..."
                  value={refForm.linkedin}
                  onChange={(e) =>
                    setRefForm({ ...refForm, linkedin: e.target.value })
                  }
                />
                <BrutalTextArea
                  label="Why You? (The Pitch)"
                  placeholder="Tell us why you're cracked. Keep it short."
                  value={refForm.why_me}
                  onChange={(e) =>
                    setRefForm({ ...refForm, why_me: e.target.value })
                  }
                />
                <BrutalButton
                  onClick={handleReferralSubmit}
                  loading={submittingRef}
                  className="w-full text-lg"
                >
                  SEND REQUEST 🚀
                </BrutalButton>
              </div>
            </BrutalBox>
          </div>
        </div>
      )}
    </div>
  );
}
