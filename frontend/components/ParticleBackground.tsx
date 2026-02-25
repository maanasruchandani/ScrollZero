"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; len: number; speed: number; opacity: number; tail: number }[] = [];

    // background static stars
    const staticStars: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < 150; i++) {
      staticStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2,
        o: Math.random() * 0.5 + 0.1,
      });
    }

    // only 2 shooting stars
    for (let i = 0; i < 2; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        len: Math.random() * 120 + 80,
        speed: Math.random() * 1 + 0.5,
        opacity: 1,
        tail: Math.random() * 60 + 40,
      });
    }

    function draw() {
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw static background stars
      staticStars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.fill();
      });

      // draw shooting stars
      stars.forEach(s => {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.tail, s.y - s.tail);
        grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.tail, s.y - s.tail);
        ctx.stroke();

        // bright head dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();

        s.x += s.speed;
        s.y += s.speed;

        if (s.x > canvas.width + 100 || s.y > canvas.height + 100) {
          s.x = Math.random() * canvas.width * 0.5;
          s.y = Math.random() * canvas.height * 0.3;
          s.opacity = 1;
        }
      });

      requestAnimationFrame(draw);
    }

    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}