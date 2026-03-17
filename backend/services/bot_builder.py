import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

VERCEL_TOKEN = os.getenv("VERCEL_TOKEN")

def generate_bot_code(personality: dict, theme: str) -> str:
    p = json.dumps(personality, indent=2)
    
    theme_styles = {
        "minimalistic": {
            "bg": "#ffffff",
            "text": "#111111",
            "bubble_user": "#111111",
            "bubble_bot": "#f5f5f5",
            "bubble_user_text": "#ffffff",
            "bubble_bot_text": "#111111",
            "font": "Inter, sans-serif"
        },
        "dark": {
            "bg": "#0a0a0f",
            "text": "#ffffff",
            "bubble_user": "#7c3aed",
            "bubble_bot": "#1a1a2e",
            "bubble_user_text": "#ffffff",
            "bubble_bot_text": "#ffffff",
            "font": "Inter, sans-serif"
        },
        "professional": {
            "bg": "#f8fafc",
            "text": "#1e293b",
            "bubble_user": "#0f172a",
            "bubble_bot": "#e2e8f0",
            "bubble_user_text": "#ffffff",
            "bubble_bot_text": "#1e293b",
            "font": "Georgia, serif"
        }
    }

    s = theme_styles.get(theme, theme_styles["dark"])

    return f"""
import {{ useState }} from "react";

const personality = {p};

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function BotPage() {{
  const [messages, setMessages] = useState([
    {{ role: "bot", text: personality.greeting }}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {{
    if (!input.trim()) return;
    const userMsg = {{ role: "user", text: input }};
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map(m => ({{
      role: m.role === "user" ? "user" : "model",
      parts: [{{ text: m.text }}]
    }}));

    const systemPrompt = `You are ${{personality.bot_name}}, an AI assistant for ${{personality.name}}.
Their title: ${{personality.title}}
Summary: ${{personality.summary}}
Skills: ${{personality.skills.join(", ")}}
Personality/tone: ${{personality.personality}}
Phone: ${{personality.phone}}
Answer questions about this person professionally. Keep responses concise.`;

const res = await fetch("http://localhost:11434/api/generate", {{
        method: "POST",
        headers: {{ "Content-Type": "application/json" }},
        body: JSON.stringify({{
          model: "llama3.2",
          prompt: systemPrompt + "\\\\nUser: " + input + "\\\\nAssistant:",
          stream: false
        }})
      }});

    const data = await res.json();
    const botText = data.response || "Sorry, I couldn't respond.";
  }}

  return (
    <div style={{{{ fontFamily: "{s['font']}", background: "{s['bg']}", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}}}>
      <div style={{{{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", height: "80vh", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" }}}}>
        <div style={{{{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "{s['bubble_user']}", color: "{s['bubble_user_text']}" }}}}>
          <h1 style={{{{ margin: 0, fontSize: "18px" }}}}>{{}}{personality.bot_name}{{}}</h1>
          <p style={{{{ margin: 0, fontSize: "12px", opacity: 0.7 }}}}>{{}}{personality.title}{{}}</p>
        </div>
        <div style={{{{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: "{s['bg']}" }}}}>
          {{messages.map((m, i) => (
            <div key={{i}} style={{{{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}}}>
              <div style={{{{
                background: m.role === "user" ? "{s['bubble_user']}" : "{s['bubble_bot']}",
                color: m.role === "user" ? "{s['bubble_user_text']}" : "{s['bubble_bot_text']}",
                padding: "10px 16px",
                borderRadius: "12px",
                maxWidth: "75%",
                fontSize: "14px",
                lineHeight: "1.5"
              }}}}>{{m.text}}</div>
            </div>
          ))}}
          {{loading && <div style={{{{ color: "{s['text']}", opacity: 0.5, fontSize: "13px" }}}}>Typing...</div>}}
        </div>
        <div style={{{{ display: "flex", gap: "8px", padding: "16px", borderTop: "1px solid #e2e8f0", background: "{s['bg']}" }}}}>
          <input
            value={{input}}
            onChange={{e => setInput(e.target.value)}}
            onKeyDown={{e => e.key === "Enter" && sendMessage()}}
            placeholder="Ask me anything..."
            style={{{{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", background: "{s['bg']}", color: "{s['text']}", outline: "none" }}}}
          />
          <button
            onClick={{sendMessage}}
            style={{{{ padding: "10px 20px", background: "{s['bubble_user']}", color: "{s['bubble_user_text']}", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}}}
          >Send</button>
        </div>
      </div>
    </div>
  );
}}
"""

async def deploy_to_vercel(personality: dict, theme: str, gemini_key: str) -> str:
    bot_code = generate_bot_code(personality, theme)
    bot_name = personality["bot_name"].lower().replace(" ", "-")

    files = [
        {
            "file": "pages/index.jsx",
            "data": bot_code
        },
        {
            "file": "package.json",
            "data": json.dumps({
                "name": bot_name,
                "version": "1.0.0",
                "scripts": {"dev": "next dev", "build": "next build", "start": "next start"},
                "dependencies": {"next": "14.0.0", "react": "^18", "react-dom": "^18"}
            })
        },
        {
            "file": "next.config.js",
            "data": "module.exports = {}"
        }
    ]

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://api.vercel.com/v13/deployments",
            headers={
                "Authorization": f"Bearer {VERCEL_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "name": bot_name,
                "files": files,
                "projectSettings": {"framework": "nextjs"},
                "env": [
                    {
                        "key": "NEXT_PUBLIC_GEMINI_API_KEY",
                        "value": gemini_key,
                        "type": "plain",
                        "target": ["production", "preview"]
                    }
                ]
            }
        )
        data = response.json()
        url = data.get("url", "")
        return f"https://{url}" if url else ""