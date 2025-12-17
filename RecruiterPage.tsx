import React from "react";
import { Link } from "react-router-dom";
import {
  BrutalBox,
  BrutalButton,
  BrutalInput,
} from "./components/BrutalComponents";
import { ArrowLeft, Send } from "lucide-react";

export default function RecruiterPage() {
  return (
    <div className="min-h-screen bg-brutal-bg p-4 md:p-8 font-mono selection:bg-brutal-blue selection:text-white">
      <header className="mb-12 border-b-8 border-black pb-6 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-8xl uppercase leading-[0.9] tracking-tighter break-words">
            Brutal<span className="text-brutal-blue">_</span>Hire
          </h1>
          <p className="mt-4 text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <span>RECRUITER_NET // V.1.0</span>
          </p>
        </div>
        <Link to="/">
          <BrutalButton variant="secondary">
            <ArrowLeft className="inline mr-2" size={18} />
            BACK TO HQ
          </BrutalButton>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto mt-12">
        <div className="animate-fade-in-up">
          <BrutalBox title="ENROLL_OPENING">
            <div className="space-y-6 text-center">
              <h2 className="text-3xl font-black uppercase">
                WANT THE BEST TALENT?
              </h2>
              <p className="text-lg">
                Submit your opening to the Brutal Network. We filter the weak.
                You get the strong.
              </p>

              <div className="bg-brutal-yellow p-4 border-4 border-black font-bold">
                COMING SOON: SELF-SERVICE PORTAL
              </div>

              <p className="text-sm uppercase opacity-50">
                For now, email us directly to manual-enroll your position.
              </p>

              <a
                href="mailto:contact@internos.com"
                className="inline-block w-full"
              >
                <BrutalButton className="w-full py-4 text-xl">
                  <Send className="inline mr-2" /> CONTACT SALES
                </BrutalButton>
              </a>
            </div>
          </BrutalBox>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto border-t-8 border-black pt-8 mt-20 text-center font-mono text-sm">
        <p>© 2024 INTERN_OS. HIRE AT YOUR OWN RISK.</p>
      </footer>
    </div>
  );
}
