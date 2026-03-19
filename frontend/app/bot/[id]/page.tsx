"use client";

import { use, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  email: string;
  bot_name: string;
}

const themes: Record<string, any> = {
  minimalistic: {
    bg: "#ffffff",
    headerBg: "#f7f7f7",
    headerBorder: "#e5e5e5",
    headerText: "#111111",
    subText: "#888888",
    userBubble: "#111111",
    userText: "#ffffff",
    botBubble: "#e9e9eb",
    botText: "#111111",
    inputBg: "#f7f7f7",
    inputBorder: "#e5e5e5",
    inputText: "#111111",
    inputPlaceholder: "#aaaaaa",
    sendBtn: "#111111",
    sendBtnText: "#ffffff",
    avatarBg: "#111111",
    avatarText: "#ffffff",
    statusDot: "#34c759",
    timeText: "#aaaaaa",
    screenBg: "#ffffff",
  },
  dark: {
    bg: "#0a0a0f",
    headerBg: "#111118",
    headerBorder: "#2a2a3a",
    headerText: "#ffffff",
    subText: "#888899",
    userBubble: "#7c3aed",
    userText: "#ffffff",
    botBubble: "#1e1e2e",
    botText: "#ffffff",
    inputBg: "#1e1e2e",
    inputBorder: "#2a2a3a",
    inputText: "#ffffff",
    inputPlaceholder: "#555566",
    sendBtn: "#7c3aed",
    sendBtnText: "#ffffff",
    avatarBg: "#7c3aed",
    avatarText: "#ffffff",
    statusDot: "#34c759",
    timeText: "#555566",
    screenBg: "#0a0a0f",
  },
  professional: {
    bg: "#f0f4f8",
    headerBg: "#ffffff",
    headerBorder: "#dde3ea",
    headerText: "#0f172a",
    subText: "#64748b",
    userBubble: "#0f172a",
    userText: "#ffffff",
    botBubble: "#ffffff",
    botText: "#0f172a",
    inputBg: "#ffffff",
    inputBorder: "#dde3ea",
    inputText: "#0f172a",
    inputPlaceholder: "#94a3b8",
    sendBtn: "#0f172a",
    sendBtnText: "#ffffff",
    avatarBg: "#0f172a",
    avatarText: "#ffffff",
    statusDot: "#34c759",
    timeText: "#94a3b8",
    screenBg: "#f0f4f8",
  }
};

function Avatar({ name, bg, text, size = 36 }: { name: string; bg: string; text: string; size?: number }) {
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function BotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string; time: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBot() {
      const { data } = await supabase.from("bots").select("*").eq("id", id).single();
      if (data) {
        setPersonality(data.personality);
        setTheme(data.theme);
        setMessages([{ role: "bot", text: data.personality.greeting, time: getTime() }]);
      }
    }
    loadBot();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || !personality) return;
    const userText = input;
    setMessages(prev => [...prev, { role: "user", text: userText, time: getTime() }]);
    setInput("");
    setLoading(true);

    const systemPrompt = `You are ${personality.bot_name}, an AI assistant representing ${personality.name} (he/him).
Title: ${personality.title}
Summary: ${personality.summary}
Skills: ${personality.skills.join(", ")}
Tone: ${personality.personality}
Always refer to ${personality.name} using he/him pronouns.
Keep responses concise and friendly.`;

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
          { role: "user", content: userText }
        ],
        stream: false
      })
    });

    const data = await res.json();
    const botText = data.message?.content || "Sorry, I could not respond.";
    setMessages(prev => [...prev, { role: "bot", text: botText, time: getTime() }]);
    setLoading(false);
  }

  if (!personality) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "system-ui" }}>
      Loading...
    </div>
  );

  const s = themes[theme] || themes.dark;

  return (
    <div style={{ minHeight: "100vh", background: s.screenBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", height: "100vh", maxHeight: "820px", display: "flex", flexDirection: "column", background: s.bg, borderRadius: "40px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.25)" }}>

        {/* iOS Header */}
        <div style={{ background: s.headerBg, borderBottom: `1px solid ${s.headerBorder}`, padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <Avatar name={personality.bot_name} bg={s.avatarBg} text={s.avatarText} size={42} />
            <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: s.statusDot, border: `2px solid ${s.headerBg}` }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: s.headerText }}>{personality.bot_name}</div>
            <div style={{ fontSize: 12, color: s.subText, marginTop: 1 }}>Active now</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", background: s.bg }}>
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            const showAvatar = !isUser && (i === 0 || messages[i - 1]?.role === "user");
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: "2px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: isUser ? "row-reverse" : "row" }}>
                  {!isUser && (
                    <div style={{ width: 28, flexShrink: 0 }}>
                      {showAvatar && <Avatar name={personality.bot_name} bg={s.avatarBg} text={s.avatarText} size={28} />}
                    </div>
                  )}
                  <div style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: isUser ? s.userBubble : s.botBubble,
                    color: isUser ? s.userText : s.botText,
                    fontSize: 15,
                    lineHeight: 1.45,
                    wordBreak: "break-word"
                  }}>
                    {m.text}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: s.timeText, marginTop: 3, paddingLeft: isUser ? 0 : 34, paddingRight: isUser ? 4 : 0 }}>
                  {m.time}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
              <Avatar name={personality.bot_name} bg={s.avatarBg} text={s.avatarText} size={28} />
              <div style={{ padding: "10px 16px", borderRadius: "20px 20px 20px 4px", background: s.botBubble, display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map(d => (
                  <div key={d} style={{
                    width: 7, height: 7, borderRadius: "50%", background: s.subText,
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${d * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 12px 24px", background: s.headerBg, borderTop: `1px solid ${s.headerBorder}`, display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Message..."
            style={{
              flex: 1, padding: "10px 16px",
              borderRadius: 22, border: `1px solid ${s.inputBorder}`,
              background: s.inputBg, color: s.inputText,
              fontSize: 15, outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: s.sendBtn, color: s.sendBtnText,
              border: "none", cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}