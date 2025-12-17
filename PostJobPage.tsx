import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
  BrutalTextArea,
} from "./components/BrutalComponents";
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  MapPin,
  Globe,
  Tag,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Clock,
  Building,
} from "lucide-react";

// Predefined options for dropdowns - INTERNSHIP FOCUSED
const LOCATION_TYPES = ["Remote", "On-site", "Hybrid"];

// Internship types only - no full-time roles
const INTERNSHIP_TYPES = [
  "Summer Internship",
  "Winter Internship",
  "Co-op Program",
  "Research Internship",
  "Project-Based",
  "Part-time Internship",
];

// Duration options for internships
const DURATION_OPTIONS = [
  "1-2 Months",
  "3 Months",
  "6 Months",
  "12 Months",
  "Flexible",
];

// Compensation types for interns
const COMPENSATION_TYPES = [
  "Paid Stipend",
  "Unpaid (For Credit)",
  "Equity / Sweat Equity",
  "Stipend + Equity",
];

// Target academic year
const ACADEMIC_YEARS = [
  "Any Year",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "Final Year",
  "Recent Graduate",
];

// Disciplines/Departments - aligned with intern hiring
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

// Common skill tags
const COMMON_TAGS = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "AI/ML",
  "Backend",
  "Frontend",
  "Full-Stack",
  "DevOps",
  "Mobile",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Social Media",
  "SEO",
  "Data Analysis",
  "Excel",
  "Video Editing",
];

export default function PostJobPage() {
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    company_url: "",
    location: "",
    locationType: "Remote",
    internshipType: "Summer Internship",
    duration: "3 Months",
    academicYear: "Any Year",
    discipline: "Engineering",
    compensationType: "Paid Stipend",
    stipend_min: "",
    stipend_max: "",
    equity: "",
    selectedTags: [] as string[],
    customTags: "",
    description: "",
    apply_url: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Basic validation
      if (!jobForm.title || !jobForm.company || !jobForm.description) {
        throw new Error("Missing required fields: Title, Company, Description");
      }

      const payload = {
        ...jobForm,
        stipend_min: parseInt(jobForm.stipend_min) || 0,
        stipend_max: parseInt(jobForm.stipend_max) || 0,
        // Combine selected checkbox tags with any custom comma-separated tags
        tags: [
          ...jobForm.selectedTags,
          ...jobForm.customTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ],
      };

      const response = await fetch(`${apiBase}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit internship");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brutal-cream font-mono flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full border-8 border-black bg-white p-8 shadow-hard text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} className="text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
            INTERNSHIP POSTED
          </h1>
          <p className="text-lg font-bold opacity-70 mb-8">
            Your internship listing has been submitted for review. Once approved
            by the admins, it will go live on the network for students to apply.
          </p>
          <Link to="/hire">
            <BrutalButton className="w-full text-xl py-4">
              RETURN TO BOARD
            </BrutalButton>
          </Link>
        </div>
      </div>
    );
  }

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
          <Link to="/hire">
            <button className="font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> BACK TO BOARD
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-brutal-yellow border-4 border-black p-6 mb-8 shadow-brutal text-center">
            <h1 className="text-3xl md:text-5xl font-black uppercase leading-none mb-2">
              POST AN INTERNSHIP
            </h1>
            <p className="font-bold">
              Find talented students and recent graduates for your team. Quality
              listings only.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border-4 border-red-600 text-red-900 p-4 mb-6 font-bold flex items-center gap-2">
              <AlertTriangle /> {error}
            </div>
          )}

          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-hard space-y-6">
            <BrutalInput
              label="Internship Title *"
              placeholder="E.G. SOFTWARE ENGINEERING INTERN, MARKETING INTERN"
              value={jobForm.title}
              onChange={(e) =>
                setJobForm({ ...jobForm, title: e.target.value })
              }
            />

            <div className="grid md:grid-cols-2 gap-4">
              <BrutalInput
                label="Company Name *"
                placeholder="ACME CORP"
                value={jobForm.company}
                onChange={(e) =>
                  setJobForm({ ...jobForm, company: e.target.value })
                }
              />
              <BrutalInput
                label="Company URL"
                placeholder="https://acme.com"
                value={jobForm.company_url}
                onChange={(e) =>
                  setJobForm({ ...jobForm, company_url: e.target.value })
                }
              />
            </div>

            {/* INTERNSHIP-SPECIFIC DROPDOWNS */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Internship Type */}
              <div>
                <label className="font-bold uppercase block mb-2">
                  Internship Type *
                </label>
                <select
                  value={jobForm.internshipType}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, internshipType: e.target.value })
                  }
                  className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue bg-white"
                >
                  {INTERNSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="font-bold uppercase block mb-2">
                  Duration *
                </label>
                <select
                  value={jobForm.duration}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, duration: e.target.value })
                  }
                  className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue bg-white"
                >
                  {DURATION_OPTIONS.map((dur) => (
                    <option key={dur} value={dur}>
                      {dur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Location Type */}
              <div>
                <label className="font-bold uppercase block mb-2">
                  Location Type *
                </label>
                <select
                  value={jobForm.locationType}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, locationType: e.target.value })
                  }
                  className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue bg-white"
                >
                  {LOCATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discipline */}
              <div>
                <label className="font-bold uppercase block mb-2">
                  Discipline / Department *
                </label>
                <select
                  value={jobForm.discipline}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, discipline: e.target.value })
                  }
                  className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue bg-white"
                >
                  {DISCIPLINES.map((disc) => (
                    <option key={disc} value={disc}>
                      {disc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Academic Year Target */}
              <div>
                <label className="font-bold uppercase block mb-2">
                  Target Academic Year *
                </label>
                <select
                  value={jobForm.academicYear}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, academicYear: e.target.value })
                  }
                  className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue bg-white"
                >
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Compensation Type */}
              <div>
                <label className="font-bold uppercase block mb-2">
                  Compensation Type *
                </label>
                <select
                  value={jobForm.compensationType}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, compensationType: e.target.value })
                  }
                  className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:border-brutal-blue bg-white"
                >
                  {COMPENSATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location City/Region (Optional) */}
            <BrutalInput
              label="Location (City/Region)"
              placeholder="e.g., Bangalore, India or 'Worldwide'"
              value={jobForm.location}
              onChange={(e) =>
                setJobForm({ ...jobForm, location: e.target.value })
              }
            />

            <div className="grid md:grid-cols-3 gap-4">
              <BrutalInput
                label="Min Stipend (₹/month)"
                placeholder="5000"
                type="number"
                value={jobForm.stipend_min}
                onChange={(e) =>
                  setJobForm({ ...jobForm, stipend_min: e.target.value })
                }
              />
              <BrutalInput
                label="Max Stipend (₹/month)"
                placeholder="25000"
                type="number"
                value={jobForm.stipend_max}
                onChange={(e) =>
                  setJobForm({ ...jobForm, stipend_max: e.target.value })
                }
              />
              <BrutalInput
                label="Equity (%)"
                placeholder="0.1%"
                value={jobForm.equity}
                onChange={(e) =>
                  setJobForm({ ...jobForm, equity: e.target.value })
                }
              />
            </div>

            {/* TAGS - Checkbox MCQ */}
            <div>
              <label className="font-bold uppercase block mb-2">
                Skills / Tags (Select All That Apply)
              </label>
              <div className="flex flex-wrap gap-2 border-4 border-black p-4 bg-gray-50">
                {COMMON_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={jobForm.selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setJobForm({
                            ...jobForm,
                            selectedTags: [...jobForm.selectedTags, tag],
                          });
                        } else {
                          setJobForm({
                            ...jobForm,
                            selectedTags: jobForm.selectedTags.filter(
                              (t) => t !== tag
                            ),
                          });
                        }
                      }}
                      className="w-5 h-5 accent-black"
                    />
                    <span className="font-mono text-sm border border-black px-2 py-1 bg-white">
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <BrutalInput
              label="Other Tags (Comma Separated)"
              placeholder="e.g., Rust, Blockchain, Growth"
              value={jobForm.customTags}
              onChange={(e) =>
                setJobForm({ ...jobForm, customTags: e.target.value })
              }
            />

            <BrutalInput
              label="Application URL / Email"
              placeholder="https://... or mailto:..."
              value={jobForm.apply_url}
              onChange={(e) =>
                setJobForm({ ...jobForm, apply_url: e.target.value })
              }
            />

            <BrutalTextArea
              label="Internship Description *"
              placeholder="Describe what the intern will learn and do. What skills will they develop? What projects will they work on?"
              className="min-h-[200px]"
              value={jobForm.description}
              onChange={(e) =>
                setJobForm({ ...jobForm, description: e.target.value })
              }
            />

            <BrutalButton
              onClick={handleSubmit}
              loading={isSubmitting}
              className="w-full text-xl py-4 bg-black text-white hover:bg-brutal-blue hover:text-white"
            >
              SUBMIT FOR REVIEW
            </BrutalButton>
          </div>
        </div>
      </main>
    </div>
  );
}
