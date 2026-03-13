import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagram",
};

export default function DiagramPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Diagram
      </p>
      <h1 className="mb-8 font-mono text-3xl font-light tracking-tight">
        Relationship Diagram
      </h1>
      <div className="mb-12 h-px w-16 bg-foreground/20" />

      <div className="flex aspect-[16/9] items-center justify-center border border-dashed border-border">
        <div className="text-center">
          <p className="mb-2 font-mono text-sm text-muted-foreground">
            Interactive diagram coming soon
          </p>
          <p className="font-mono text-xs text-muted-foreground/60">
            Visualizing connections between buildings, architects, and cities
          </p>
        </div>
      </div>
    </div>
  );
}
