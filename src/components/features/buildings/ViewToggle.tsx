"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { List, LayoutGrid } from "lucide-react";

export function ViewToggle() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentView = searchParams.get("view") ?? "list";

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-px border border-border">
      <button
        type="button"
        onClick={() => setView("list")}
        className={`p-1.5 transition-colors ${
          currentView === "list"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="List view"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        className={`p-1.5 transition-colors ${
          currentView === "grid"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
