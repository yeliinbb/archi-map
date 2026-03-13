import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <div className="flex h-5 w-5 items-center justify-center border border-muted-foreground/40">
            <span className="text-[8px] font-bold leading-none">AC</span>
          </div>
          <span className="tracking-wider">
            Archi Curation &copy; {new Date().getFullYear()}
          </span>
        </div>

        <nav className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <Link
            href="/about"
            className="tracking-wider transition-colors hover:text-foreground"
          >
            About
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/map/buildings"
            className="tracking-wider transition-colors hover:text-foreground"
          >
            Buildings
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/map/architects"
            className="tracking-wider transition-colors hover:text-foreground"
          >
            Architects
          </Link>
        </nav>
      </div>
    </footer>
  );
}
