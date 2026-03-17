"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { use } from "react";



interface Message {
  role: "user" | "bot";
  text: string;
}

interface Personality {
  name: string;
  title: string;
  summary: string;
  skills: string[];
  experience: { company: string; role: string }[];
  personality: string;
  greeting: string;
  phone: string;
  bot_name: string;
}

const themeStyles: Record<string, any> = {
  minimalistic: {
    bg: "bg-white",
    text: "text-gray-900",
    header: "bg-gray-900 text-white",
    userBubble: "bg-gray-900 text-white",
    botBubble: "bg-gray-100 text-gray-900",
    input: "bg-white border-gray-200 text-gray-900",
    button: "bg-gray-900 text-white hover:bg-gray-700",
  },
  dark: {
    bg: "bg-[#0a0a0f]",
    text: "text-white",
    header: "bg-violet-700 text-white",
    userBubble: "bg-violet-600 text-white",
    botBubble: "bg-[#1a1a2e] text-white",
    input: "bg-[#1a1a2e] border-white/10 text-white",
    button: "bg-violet-600 text-white hover:bg-violet-500",
  },
  professional: {
    bg: "bg-slate-50",
    text: "text-slate-800",
    header: "bg-slate-800 text-white",
    userBubble: "bg-slate-800 text-white",
    botBubble: "bg-slate-200 text-slate-800",
    input: "bg-white border-slate-200 text-slate-800",
    button: "bg-slate-800 text-white hover:bg-slate-700",
  },
};

export default function BotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBot() {
      const { data } = await supabase
        .from("bots")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setPersonality(data.personality);
        setTheme(data.theme);
        setMessages([{ role: "bot", text: data.personality.greeting }]);
      }
    }
    loadBot();
  }, [id]);

  async function sendMessage() {
    if (!input.trim() || !personality) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const systemPrompt = `You are ${personality.bot_name}, an AI assistant for ${personality.name}.
Title: ${personality.title}
Summary: ${personality.summary}
Skills: ${personality.skills.join(", ")}
Tone: ${personality.personality}
Phone: ${personality.phone}
Answer questions about this person concisely and professionally.`;

    const history = messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    }));

    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: input }
        ],
        stream: false
      })
    });

    const data = await res.json();
    const botText = data.message?.content || "Sorry, I could not respond.";
    setMessages(prev => [...prev, { role: "bot", text: botText }]);
    setLoading(false);
  }

  if (!personality) return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      Loading bot...
    </div>
  );

  const s = themeStyles[theme] || themeStyles.dark;

  return (
    <main className={`min-h-screen ${s.bg} ${s.text} flex items-center justify-center p-4`}>
      <div className="w-full max-w-2xl flex flex-col h-[85vh] rounded-2xl overflow-hidden border border-white/10">
        <div className={`px-5 py-4 ${s.header}`}>
          <h1 className="font-semibold text-lg">{personality.bot_name}</h1>
          <p className="text-sm opacity-70">{personality.title}</p>
        </div>

        <div className={`flex-1 overflow-y-auto p-5 flex flex-col gap-3 ${s.bg}`}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[75%] text-sm leading-relaxed ${m.role === "user" ? s.userBubble : s.botBubble}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <p className="text-sm opacity-40">Typing...</p>}
        </div>

        <div className={`flex gap-3 p-4 border-t border-white/10 ${s.bg}`}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className={`flex-1 px-4 py-2 rounded-xl border text-sm outline-none ${s.input}`}
          />
          <button
            onClick={sendMessage}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${s.button}`}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}