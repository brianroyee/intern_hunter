import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import { Briefcase, Users, FileText, ChevronRight } from "lucide-react";

export default function EmployerDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchEmployerData();
    }
  }, [user]);

  const fetchEmployerData = async () => {
    try {
      // Fetch jobs posted by this employer
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("creator_id", user?.id || "");

      if (jobsError) throw jobsError;
      setJobs(jobs || []);

      if (jobs.length > 0) {
        // Fetch all applications for these jobs
        const jobIds = jobs.map((j) => j.id);
        const { data: apps, error: appsError } = await supabase
          .from("applications")
          .select("*")
          .in("job_id", jobIds);

        if (appsError) throw appsError;

        // Fetch student profiles for these applications
        const studentIds = Array.from(new Set(apps.map((a) => a.student_id)));

        if (studentIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("students")
            .select("*")
            .in("user_id", studentIds);

          if (profilesError) throw profilesError;

          const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

          const enrichedApps = apps.map((app) => ({
            ...app,
            student: profileMap.get(app.student_id),
            job: jobs.find((j) => j.id === app.job_id),
          }));

          setApplicants(enrichedApps);
        }
      }
    } catch (error) {
      console.error("Employer fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-brutal-red font-mono">
        <h1 className="text-4xl font-black animate-pulse uppercase">
          SYNCHRONIZING_RECRUITER_DATA...
        </h1>
      </div>
    );

  const filteredApplicants = selectedJobId
    ? applicants.filter((a) => a.job_id === selectedJobId)
    : applicants;

  return (
    <div className="min-h-screen bg-brutal-bg font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-8 border-black pb-8">
          <div>
            <div className="flex items-center gap-3 text-brutal-red mb-2">
              <Briefcase size={24} />
              <span className="font-black tracking-widest text-sm uppercase">
                Employer Node // Internal View
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              MISSION_CONTROL
            </h1>
          </div>
          <div className="flex gap-4">
            <Link
              to="/post-job"
              className="bg-brutal-yellow p-4 border-4 border-black font-black uppercase text-xs shadow-solid-sm hover:shadow-none translate-x-[-1px] hover:translate-x-0 transition-all"
            >
              Post New Mission
            </Link>
            <BrutalButton onClick={logout} variant="accent" className="text-xs">
              LOGOUT
            </BrutalButton>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Jobs Posted */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase flex items-center gap-2">
              ACTIVE_CAMPAIGNS [{jobs.length}]
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedJobId(null)}
                className={`w-full text-left p-4 border-4 border-black font-bold uppercase transition-all ${
                  !selectedJobId ? "bg-black text-white" : "bg-white"
                }`}
              >
                ALL_APPLICANTS
              </button>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`w-full text-left p-4 border-4 border-black font-bold uppercase transition-all hover:bg-brutal-yellow hover:text-black ${
                    selectedJobId === job.id
                      ? "bg-brutal-yellow text-black"
                      : "bg-white"
                  }`}
                >
                  {job.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Applicants List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase flex items-center gap-2">
                <Users size={32} /> APPLICANT_POOL [{filteredApplicants.length}]
              </h3>
            </div>

            {filteredApplicants.length === 0 ? (
              <div className="border-8 border-black border-dashed p-20 text-center bg-gray-50">
                <p className="text-2xl font-black opacity-20 uppercase tracking-widest">
                  Awaiting Incoming Transmissions...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredApplicants.map((app) => (
                  <BrutalBox
                    key={app.id}
                    title={`ID_${app.id.substring(0, 6)}`}
                    className="bg-white p-0"
                  >
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-3xl font-black uppercase">
                            {app.student?.name}
                          </h4>
                          {app.student?.fieldOfStudy && (
                            <span className="bg-brutal-blue text-white text-[10px] px-2 py-1 font-black uppercase">
                              {app.student.field_of_study}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs opacity-60 uppercase">
                          {app.student?.email} //{" "}
                          {app.student?.skills?.join(", ")}
                        </p>
                        <div className="pt-2">
                          <span className="bg-black text-white text-[10px] px-2 py-1 font-bold uppercase tracking-widest">
                            APPLYING_FOR: {app.job?.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 w-full md:w-auto">
                        {app.student?.resume_url && (
                          <a
                            href={app.student.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none"
                          >
                            <BrutalButton
                              variant="primary"
                              className="w-full flex items-center justify-center gap-2 text-xs py-3 px-6"
                            >
                              <FileText size={16} /> VIEW_RESUME
                            </BrutalButton>
                          </a>
                        )}
                        <BrutalButton
                          variant="secondary"
                          className="flex-1 md:flex-none text-xs py-3 px-6"
                        >
                          MOVE_TO_INTERVIEW
                        </BrutalButton>
                      </div>
                    </div>
                  </BrutalBox>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
