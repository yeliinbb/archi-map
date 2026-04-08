import { cn } from "@/lib/utils";

interface LineAnimationProps {
  className?: string;
}

export function LineAnimation({ className }: LineAnimationProps) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-md text-border"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Horizontal base line */}
        <line
          x1="40"
          y1="60"
          x2="360"
          y2="60"
          stroke="currentColor"
          strokeWidth="0.5"
          className="animate-draw-line"
          style={{
            strokeDasharray: 320,
            strokeDashoffset: 320,
            animation: "draw-line 1.2s ease-out 0.3s forwards",
          }}
        />
        {/* Left vertical tick */}
        <line
          x1="40"
          y1="40"
          x2="40"
          y2="80"
          stroke="currentColor"
          strokeWidth="0.5"
          style={{
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: "draw-line 0.6s ease-out 0.8s forwards",
          }}
        />
        {/* Right vertical tick */}
        <line
          x1="360"
          y1="40"
          x2="360"
          y2="80"
          stroke="currentColor"
          strokeWidth="0.5"
          style={{
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: "draw-line 0.6s ease-out 1.0s forwards",
          }}
        />
        {/* Center cross — vertical */}
        <line
          x1="200"
          y1="30"
          x2="200"
          y2="90"
          stroke="currentColor"
          strokeWidth="0.5"
          style={{
            strokeDasharray: 60,
            strokeDashoffset: 60,
            animation: "draw-line 0.8s ease-out 1.2s forwards",
          }}
        />
        {/* 45-degree diagonal left */}
        <line
          x1="120"
          y1="40"
          x2="160"
          y2="80"
          stroke="currentColor"
          strokeWidth="0.5"
          style={{
            strokeDasharray: 57,
            strokeDashoffset: 57,
            animation: "draw-line 0.6s ease-out 1.5s forwards",
          }}
        />
        {/* 45-degree diagonal right */}
        <line
          x1="240"
          y1="80"
          x2="280"
          y2="40"
          stroke="currentColor"
          strokeWidth="0.5"
          style={{
            strokeDasharray: 57,
            strokeDashoffset: 57,
            animation: "draw-line 0.6s ease-out 1.7s forwards",
          }}
        />
        {/* Small reference marks */}
        <circle
          cx="120"
          cy="60"
          r="2"
          fill="currentColor"
          className="opacity-0"
          style={{
            animation: "fade-in 0.4s ease-out 1.9s forwards",
          }}
        />
        <circle
          cx="280"
          cy="60"
          r="2"
          fill="currentColor"
          className="opacity-0"
          style={{
            animation: "fade-in 0.4s ease-out 2.0s forwards",
          }}
        />
      </svg>
    </div>
  );
}
