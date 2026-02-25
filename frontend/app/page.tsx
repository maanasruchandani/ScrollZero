import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">ScrollZero</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-6">
        <h1 className="text-5xl font-bold max-w-2xl leading-tight">
          Turn your LinkedIn into an AI chatbot
        </h1>
        <p className="text-white/60 text-lg max-w-xl">
          Paste your LinkedIn URL, pick a style, and we deploy a personal AI bot that answers for you!... live in minutes.
        </p>
        <Link href="/signup">
          <Button size="lg" className="mt-2">Create Your Bot</Button>
        </Link>
      </section>

      <footer className="text-center py-5 text-white/30 text-sm border-t border-white/10">
        ScrollZero 2026
      </footer>
    </main>
  );
}