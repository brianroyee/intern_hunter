import React, { useState, useRef } from "react";
import { Link, Route, Routes } from "react-router-dom";
import BlogsPage from "./BlogsPage";
import BlogPostPage from "./BlogPostPage";
import BlogArchivePage from "./BlogArchivePage";
import Admin from "./Admin";
import LandingPage from "./LandingPage";
import ApplyPage from "./ApplyPage";
import RecruiterPage from "./RecruiterPage";
import { CandidateProfile, SKILL_CATEGORIES, DEPARTMENTS } from "./types";
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
      <Route path="/hire" element={<RecruiterPage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/archive" element={<BlogArchivePage />} />
      <Route path="/blogs/:id" element={<BlogPostPage />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
