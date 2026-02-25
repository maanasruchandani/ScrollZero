"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ParticleBackground from "@/components/ParticleBackground";

const themes = [
  { id: "minimalistic", label: "Minimalist", icon: "◻", desc: "Clean & simple" },
  { id: "dark", label: "Dark Mode", icon: "◈", desc: "Sleek & moody" },
  { id: "professional", label: "Professional", icon: "◆", desc: "Corporate ready" },
];

export default function Dashboard() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [botName, setBotName] = useState("");
  const [theme, setTheme] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [botUrl, setBotUrl] = useState("");

  const progress = [linkedinUrl, phone, botName, theme, pdf].filter(Boolean).length * 20;

async function handleSubmit() {
    if (!pdf) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("bot_name", botName);
    formData.append("theme", theme);
    formData.append("pdf", pdf);

    const res = await fetch("http://localhost:8000/generate-bot", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    setLoading(false);
}

  return (
    <main className="min-h-screen text-white font-sans relative overflow-hidden">
      <ParticleBackground />
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/5">
        <span className="text-lg font-bold tracking-widest text-white/90">SCROLLZERO</span>
        <div className="flex gap-6 text-sm text-white/40">
          <span className="text-white border-b border-violet-500 pb-1 cursor-pointer">Dashboard</span>
          <span className="hover:text-white/70 cursor-pointer transition">Analytics</span>
          <span className="hover:text-white/70 cursor-pointer transition">Settings</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-5">

        {/* Left — Profile Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold tracking-widest text-white/40 uppercase">Your Profile</h2>

          <div className="flex flex-col gap-3">
            <div>
              <Label className="text-white/40 text-xs">LinkedIn URL</Label>
              <Input
                className="mt-1 bg-white/5 border-white/10 text-sm placeholder:text-white/20"
                placeholder="linkedin.com/in/yourname"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-white/40 text-xs">LinkedIn PDF Export</Label>
              <input
                type="file"
                accept=".pdf"
                onChange={e => setPdf(e.target.files?.[0] || null)}
                className="mt-1 w-full text-sm text-white/50 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white cursor-pointer"
              />
            </div>
            <div>
              <Label className="text-white/40 text-xs">Phone Number</Label>
              <Input
                className="mt-1 bg-white/5 border-white/10 text-sm placeholder:text-white/20"
                placeholder="+91 00000 00000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-white/40 text-xs">Bot Name</Label>
              <Input
                className="mt-1 bg-white/5 border-white/10 text-sm placeholder:text-white/20"
                placeholder="e.g. Alex AI"
                value={botName}
                onChange={e => setBotName(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between text-xs text-white/30 mb-2">
              <span>Profile complete</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Middle — Theme Picker */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold tracking-widest text-white/40 uppercase">Bot Theme</h2>
          <div className="grid grid-cols-1 gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  theme === t.id
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <span className="text-2xl text-violet-400">{t.icon}</span>
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-white/30">{t.desc}</p>
                </div>
                {theme === t.id && (
                  <span className="ml-auto text-violet-400 text-xs font-semibold">Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Launch */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold tracking-widest text-white/40 uppercase">Launch</h2>

          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-2 text-sm">
              <Row label="Bot Name" value={botName || "—"} />
              <Row label="Theme" value={theme || "—"} />
              <Row label="Profile" value={linkedinUrl ? "Provided" : "—"} />
              <Row label="PDF" value={pdf ? pdf.name : "—"} />
              <Row label="Phone" value={phone ? "Provided" : "—"} />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || progress < 100}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold tracking-wide py-5 rounded-xl transition disabled:opacity-30"
            >
              {loading ? "Generating..." : "Create & Deploy Bot"}
            </Button>

            {progress < 100 && (
              <p className="text-xs text-white/20 text-center">Complete all fields to deploy</p>
            )}
          </div>

          {botUrl && (
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
              <p className="text-xs text-white/40 mb-1">Your bot is live at</p>
              <a href={botUrl} target="_blank" className="text-violet-400 underline text-sm break-all">{botUrl}</a>
            </div>
          )}
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3 text-sm text-white/30">
          {progress === 100
            ? "Ready to deploy — hit Create & Deploy Bot"
            : "Fill in all fields to unlock deployment"}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/30">{label}</span>
      <span className="text-white/70 capitalize">{value}</span>
    </div>
  );
}