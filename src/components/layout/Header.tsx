import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg text-primary"
        >
          <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sm:text-lg">智投罗盘</span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-normal">
            InvestCompass
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            MVP
          </span>
        </div>
      </div>
    </header>
  );
}
