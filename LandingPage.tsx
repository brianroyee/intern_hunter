import React from "react";
import { Link } from "react-router-dom";
import { BrutalButton } from "./components/BrutalComponents";
import { UserPlus, BookOpen, Briefcase, Terminal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brutal-bg font-mono selection:bg-black selection:text-white flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Branding Section */}
          <div className="animate-fade-in-up">
            <div className="border-8 border-black p-8 bg-white shadow-hard relative">
              {/* Decorative Tag */}
              <div className="absolute -top-6 -right-6 bg-brutal-red text-white px-4 py-2 font-black text-xl border-4 border-black rotate-3">
                V.1.5 LIVE
              </div>

              <h1 className="font-display text-6xl md:text-9xl uppercase leading-[0.8] tracking-tighter mb-6 break-words">
                Intern
                <br /> Hunter
              </h1>
              <p className="text-2xl md:text-3xl font-bold uppercase tracking-widest border-t-8 border-black pt-6 flex items-center gap-3">
                <Terminal size={32} />
                The Brutal Database
              </p>
              <p className="mt-6 text-lg font-bold opacity-70 leading-relaxed uppercase">
                Filtered talent. No fluff. Strictly business. <br />
                Welcome to the Intern Operating System.
              </p>
            </div>
          </div>

          {/* Navigation Options */}
          <div
            className="flex flex-col gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* OPTION 1: ENROLL FOR OPENINGS (APPLY) */}
            <Link to="/apply" className="group">
              <div className="bg-white border-8 border-black p-6 hover:bg-brutal-yellow transition-all hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#000]">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-2 group-hover:underline decoration-4">
                  <UserPlus className="inline mb-2 mr-3" size={36} />
                  1. Enroll for Openings
                </h2>
                <p className="font-bold opacity-60 uppercase">
                  For Candidates // Submit your payload
                </p>
              </div>
            </Link>

            {/* OPTION 2: READ THE INDUSTRY (BLOGS) */}
            <Link to="/blogs" className="group">
              <div className="bg-white border-8 border-black p-6 hover:bg-brutal-blue hover:text-white transition-all hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#000]">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-2 group-hover:underline decoration-4">
                  <BookOpen className="inline mb-2 mr-3" size={36} />
                  2. Read the Industry
                </h2>
                <p className="font-bold opacity-60 group-hover:opacity-100 uppercase">
                  Knowledge Base // Classified Logs
                </p>
              </div>
            </Link>

            {/* OPTION 3: ENROLL AN OPENING (RECRUITER) */}
            <Link to="/hire" className="group">
              <div className="bg-white border-8 border-black p-6 hover:bg-brutal-red hover:text-white transition-all hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#000]">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-2 group-hover:underline decoration-4">
                  <Briefcase className="inline mb-2 mr-3" size={36} />
                  3. Enroll an Opening
                </h2>
                <p className="font-bold opacity-60 group-hover:opacity-100 uppercase">
                  For Recruiters // Hunt Talent
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <footer className="w-full bg-black text-white p-4 text-center border-t-8 border-white">
        <p className="font-mono text-xs uppercase flex justify-center gap-8">
          <span>© 2024 INTERN_OS</span>
          <Link to="/admin" className="hover:text-brutal-yellow">
            ADMIN ACCESS
          </Link>
        </p>
      </footer>
    </div>
  );
}
