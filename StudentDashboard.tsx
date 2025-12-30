import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { BrutalBox, BrutalButton } from "./components/BrutalComponents";
import {
  LayoutDashboard,
  Target,
  History,
  Settings,
  ExternalLink,
} from "lucide-react";

export default function StudentDashboard() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
    if (!authLoading && user && !profile) navigate("/onboarding");
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch recommended jobs (matching skills or field)
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .limit(5);

      if (jobsError) throw jobsError;

      // Basic matching logic: Filter jobs that share at least one skill
      const matched = (jobs || []).filter((job) => {
        // job.tags is typically array now
        const jobTags = Array.isArray(job.tags) ? job.tags : [];
        return (
          jobTags.some((tag: string) =>
            (profile.skills || []).includes(tag.toUpperCase())
          ) ||
          job.discipline?.toLowerCase() ===
            profile.field_of_study?.toLowerCase()
        );
      });

      setRecommendedJobs(
        matched.length > 0 ? matched : (jobs || []).slice(0, 3)
      );

      // Fetch user's applications
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .eq("student_id", user?.id || "");

      if (appsError) throw appsError;

      setApplications(apps || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <h1 className="text-brutal-yellow text-4xl font-black animate-pulse">
          SYNCHRONIZING_DASHBOARD...
        </h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-brutal-bg font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-8 border-black pb-8">
          <div>
            <div className="flex items-center gap-3 text-brutal-blue mb-2">
              <LayoutDashboard size={24} />
              <span className="font-black tracking-widest text-sm">
                SECURE_NODE_04 // STUDENT_DASHBOARD
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              WELCOME_BACK,{" "}
              <span className="text-brutal-yellow italic">
                {profile.name?.split(" ")[0]}
              </span>
            </h1>
          </div>
          <div className="flex gap-4">
            <BrutalButton
              onClick={logout}
              variant="accent"
              className="text-xs py-2 px-4 shadow-hard-sm"
            >
              DISCONNECT_SESSION
            </BrutalButton>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Status */}
          <div className="space-y-8">
            <BrutalBox title="SYSTEM_PROFILE" className="bg-white">
              <div className="space-y-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="text-[10px] font-black opacity-40 uppercase">
                    Status
                  </p>
                  <p className="font-bold text-green-600 uppercase">
                    ACTIVE_HUNTING_MODE
                  </p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-[10px] font-black opacity-40 uppercase">
                    Field of Study
                  </p>
                  <p className="font-bold uppercase">
                    {profile.field_of_study}
                  </p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-[10px] font-black opacity-40 uppercase">
                    Capabilities
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile.skills || []).map((s: string) => (
                      <span
                        key={s}
                        className="bg-black text-white text-[10px] px-1 font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <BrutalButton
                  className="w-full text-xs py-3 mt-4"
                  variant="secondary"
                >
                  UPDATE_IDENT_PAYLOAD
                </BrutalButton>
              </div>
            </BrutalBox>

            <div className="bg-black text-white p-6 border-8 border-brutal-yellow shadow-hard transform -rotate-1">
              <h3 className="text-xl font-black uppercase mb-2">
                HACK_TIP_#42
              </h3>
              <p className="text-sm border-t border-white/20 pt-2 opacity-80 leading-relaxed italic">
                "The best code is the code you didn't have to write. The best
                job is the one you actually applied for. Send it."
              </p>
            </div>
          </div>

          {/* Middle Column: Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                <Target className="text-brutal-red" /> RECOMMENDED_MISSIONS
              </h2>
              <div className="grid gap-4">
                {recommendedJobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="group">
                    <div className="bg-white border-4 border-black p-4 flex justify-between items-center group-hover:bg-brutal-yellow transition-all shadow-solid-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                      <div>
                        <h4 className="font-black text-xl uppercase tracking-tighter">
                          {job.title}
                        </h4>
                        <p className="text-xs font-bold opacity-60 italic">
                          {job.company} // {job.location}
                        </p>
                      </div>
                      <ExternalLink
                        size={20}
                        className="opacity-40 group-hover:opacity-100"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3 leading-none">
                <History className="text-brutal-blue" /> TRANSMISSION_LOGS
                [APPLICATIONS]
              </h2>
              {applications.length === 0 ? (
                <div className="border-4 border-black border-dashed p-12 text-center bg-gray-50">
                  <p className="font-bold opacity-40 uppercase">
                    Awaiting Transmission Start...
                  </p>
                  <Link to="/hire">
                    <BrutalButton className="mt-4 text-xs">
                      SCAN_FOR_MISSIONS
                    </BrutalButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.$id}
                      className="bg-black text-white p-4 flex justify-between items-center border-l-8 border-brutal-blue"
                    >
                      <div>
                        <h4 className="font-black uppercase tracking-widest text-sm">
                          TARGET_ID: {app.job_id}
                        </h4>
                        <p className="text-[10px] opacity-60 uppercase">
                          SENT_ON:{" "}
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-brutal-blue text-white text-[10px] px-2 py-1 font-black uppercase">
                        DELIVERED
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
