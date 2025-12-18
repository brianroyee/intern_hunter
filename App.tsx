import React, { useState, useRef } from "react";
import { Link, Route, Routes } from "react-router-dom";
import BlogsPage from "./BlogsPage";
import BlogPostPage from "./BlogPostPage";
import BlogArchivePage from "./BlogArchivePage";
import JobDetailsPage from "./JobDetailsPage";
import Admin from "./Admin";
import LandingPage from "./LandingPage";
import ApplyPage from "./ApplyPage";
import RecruiterPage from "./RecruiterPage";
import PostJobPage from "./PostJobPage";
import { CandidateProfile, DEPARTMENTS } from "./types";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
  BrutalTextArea,
  BrutalCheckbox,
} from "./components/BrutalComponents";
import {
  Upload,
  ArrowRight,
  Send,
  Terminal,
  Briefcase,
  AlertCircle,
  Database,
} from "lucide-react";

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsBooting(false), 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center font-mono p-6 text-center select-none">
        <div className="max-w-md w-full">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 border-4 border-brutal-yellow animate-spin" />
          </div>

          <h1 className="text-brutal-yellow text-xl md:text-2xl font-black uppercase tracking-[0.2em] mb-4 animate-pulse">
            INITIALIZING_SYSTEM...
          </h1>

          <p className="text-white text-[10px] md:text-xs font-bold uppercase opacity-60 mb-8 tracking-widest leading-loose">
            [!] DESKTOP_PREVIEW_RECOMMENDED_FOR_FULL_EXPERIENCE <br />
            [!] OPTIMIZING_FOR_HIGH_FIDELITY_TERMINAL
          </p>

          <div className="w-full border-2 border-white p-1">
            <div
              className="h-4 bg-brutal-yellow transition-all duration-100 ease-out"
              style={{ width: `${bootProgress}%` }}
            />
          </div>

          <div className="mt-4 flex justify-between text-[8px] font-black text-white/40 uppercase">
            <span>INTERN_OS_V1.1</span>
            <span>{bootProgress}%</span>
            <span>SECURE_BOOT</span>
          </div>
        </div>

        {/* Decorative background scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1001] bg-[length:100%_2px,3px_100%]" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/hire" element={<RecruiterPage />} />
      <Route path="/jobs/:id" element={<JobDetailsPage />} />
      <Route path="/post-job" element={<PostJobPage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/archive" element={<BlogArchivePage />} />
      <Route path="/blogs/:id" element={<BlogPostPage />} />
    </Routes>
  );
}
