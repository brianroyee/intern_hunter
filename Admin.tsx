import React, { useState, useEffect } from "react";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
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
} from "lucide-react";

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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [storedPassword, setStoredPassword] = useState("");

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

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
      <header className="max-w-6xl mx-auto mb-8">
        <div className="border-8 border-black bg-black text-brutal-cream p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                ADMIN_PANEL
              </h1>
              <p className="mt-2 text-sm uppercase tracking-widest flex items-center gap-2">
                <Terminal size={16} />
                <span>APPLICATION DATABASE</span>
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/"
                className="bg-brutal-yellow text-black px-4 py-2 font-bold hover:bg-white transition-colors"
              >
                ← BACK
              </a>
              <button
                onClick={handleLogout}
                className="bg-brutal-red text-white px-4 py-2 font-bold hover:bg-white hover:text-black transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> LOGOUT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-4 border-black bg-brutal-blue text-white p-4">
          <p className="text-4xl font-black">{applications.length}</p>
          <p className="text-xs uppercase">Total Applications</p>
        </div>
        <div className="border-4 border-black bg-brutal-yellow p-4">
          <p className="text-4xl font-black">
            {applications.filter((a) => a.subscribeToNewsletter).length}
          </p>
          <p className="text-xs uppercase">Newsletter Subs</p>
        </div>
        <div className="border-4 border-black bg-brutal-red text-white p-4">
          <p className="text-4xl font-black">
            {applications.filter((a) => a.cvFilename).length}
          </p>
          <p className="text-xs uppercase">With CV</p>
        </div>
        <div className="border-4 border-black bg-white p-4">
          <p className="text-4xl font-black">
            {new Set(applications.map((a) => a.department)).size}
          </p>
          <p className="text-xs uppercase">Departments</p>
        </div>
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
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6 border-4 border-brutal-red bg-red-100 p-4">
          <p className="font-bold text-brutal-red">{error}</p>
        </div>
      )}

      {/* Applications List */}
      <main className="max-w-6xl mx-auto">
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
                    {expandedId === app.id ? <ChevronUp /> : <ChevronDown />}
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
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 border-t-4 border-black pt-4 text-center">
        <p className="text-sm opacity-50">ADMIN_PANEL // INTERN_HUNTER</p>
      </footer>
    </div>
  );
}
