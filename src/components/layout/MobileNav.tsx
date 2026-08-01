import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Target,
  Brain,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "大盘", icon: LayoutDashboard },
  { to: "/news", label: "资讯", icon: Newspaper },
  { to: "/goals", label: "目标", icon: Target },
  { to: "/quant", label: "量化", icon: BarChart3 },
  { to: "/ai-advisor", label: "AI", icon: Brain },
  { to: "/learn", label: "学习", icon: BookOpen },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : ""
                  )}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
