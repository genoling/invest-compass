import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Target,
  Brain,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/dashboard",
    label: "资产大盘",
    icon: LayoutDashboard,
  },
  {
    to: "/news",
    label: "实时资讯",
    icon: Newspaper,
  },
  {
    to: "/goals",
    label: "投资目标",
    icon: Target,
  },
  {
    to: "/ai-advisor",
    label: "AI 决策",
    icon: Brain,
  },
  {
    to: "/learn",
    label: "知识学习",
    icon: BookOpen,
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r bg-card">
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <p className="text-xs text-muted-foreground text-center">
          智投罗盘 v0.1.0
        </p>
      </div>
    </aside>
  );
}
