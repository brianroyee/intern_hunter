import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./lib/supabase";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
  BrutalTagInput,
} from "./components/BrutalComponents";
import { Upload, User, Book, Star } from "lucide-react";

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    fieldOfStudy: "",
    resume: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let resumeUrl = "";
      let resumeFilename = "";

      if (form.resume) {
        const fileExt = form.resume.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, form.resume);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(data.path);

        resumeUrl = publicUrl;
        resumeFilename = form.resume.name;
      }

      const { error } = await supabase.from("students").insert([
        {
          user_id: user.id,
          name: form.name,
          field_of_study: form.fieldOfStudy,
          skills: skills,
          resume_url: resumeUrl,
          email: user.email,
        },
      ]);

      if (error) throw error;

      await refreshProfile();
      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Onboarding failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brutal-bg p-8 font-mono">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="border-b-8 border-black pb-8">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            SYSTEM_ONBOARDING
          </h1>
          <p className="text-lg opacity-60 uppercase font-bold mt-2">
            Initialize your candidate profile // intern_os_v1.5
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <BrutalBox title="1. IDENTIFICATION">
            <div className="flex items-center gap-4 mb-6 text-brutal-blue">
              <User size={32} />
              <span className="font-black uppercase">
                Personal_Identity_Payload
              </span>
            </div>
            <BrutalInput
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </BrutalBox>

          <BrutalBox title="2. ACADEMIC_TRACK">
            <div className="flex items-center gap-4 mb-6 text-brutal-yellow grayscale invert">
              <Book size={32} />
              <span className="font-black uppercase">Field_Of_Exploration</span>
            </div>
            <BrutalInput
              label="Field of Study (e.g. Computer Science)"
              required
              value={form.fieldOfStudy}
              onChange={(e) =>
                setForm({ ...form, fieldOfStudy: e.target.value })
              }
            />
          </BrutalBox>

          <BrutalBox title="3. SKILL_MATRIX">
            <div className="flex items-center gap-4 mb-6 text-brutal-red">
              <Star size={32} />
              <span className="font-black uppercase">
                Technical_Capability_Array
              </span>
            </div>
            <BrutalTagInput
              label="Skills (Press Enter to add)"
              tags={skills}
              onChange={setSkills}
              suggestions={["React", "TypeScript", "Python", "Design", "UI/UX"]}
            />
          </BrutalBox>

          <BrutalBox title="4. RESUME_PAYLOAD">
            <div className="flex items-center gap-4 mb-6">
              <Upload size={32} />
              <span className="font-black uppercase">
                Encoded_Experience_PDF
              </span>
            </div>
            <input
              type="file"
              accept=".pdf"
              required
              onChange={(e) =>
                setForm({ ...form, resume: e.target.files?.[0] || null })
              }
              className="block w-full border-4 border-black p-4 bg-white font-bold cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-black file:bg-black file:text-white hover:file:bg-brutal-yellow hover:file:text-black transition-all"
            />
          </BrutalBox>

          <BrutalButton
            type="submit"
            loading={loading}
            className="w-full text-3xl py-6 bg-black text-white hover:bg-brutal-blue"
          >
            INITIATE_SEQUENCING
          </BrutalButton>
        </form>
      </div>
    </div>
  );
}
