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
      {/* Route path="/jobs" is now /hire */}
    </Routes>
  );
}
