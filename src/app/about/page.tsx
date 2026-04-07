import type { Metadata } from "next";
import { Divider } from "@/components/ui/divider";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        About
      </p>
      <h1 className="mb-8 font-mono text-3xl font-light tracking-tight">
        Archi Curation
      </h1>
      <Divider className="mb-8" />

      <div className="space-y-6 font-mono text-sm leading-relaxed text-muted-foreground">
        <p>
          Archi Curation is a curator-driven archive of architecture, mapping
          buildings, architects, and cities into an interconnected web of
          spatial knowledge.
        </p>
        <p>
          The project aims to present architecture not as isolated objects but as
          a network of relationships — between designers and their works,
          between buildings and their cities, between historical movements and
          contemporary practice.
        </p>
        <p>
          Each entry is carefully selected and contextualized, offering a
          perspective that goes beyond conventional architectural databases.
        </p>
        <div className="border-l border-border pl-4">
          <p className="text-xs italic">
            &quot;Architecture is the learned game, correct and magnificent, of
            forms assembled in the light.&quot;
          </p>
          <p className="mt-1 text-xs">— Le Corbusier</p>
        </div>
      </div>
    </div>
  );
}
