"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { RoleSwitcher } from "./RoleSwitcher";
import {
  Target,
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const navLinks = {
  EMPLOYEE: [
    { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/goals", label: "My Goals", icon: Target },
    { href: "/employee/achievements", label: "Achievements", icon: CheckSquare },
  ],
  MANAGER: [
    { href: "/manager/dashboard", label: "Team Overview", icon: LayoutDashboard },
    { href: "/manager/approvals", label: "Approvals", icon: CheckSquare },
    { href: "/manager/checkins", label: "Check-ins", icon: Clock },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cycles", label: "Cycles", icon: Clock },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/audit", label: "Audit Log", icon: Settings },
    { href: "/admin/escalations", label: "Escalations", icon: ChevronDown },
  ],
};

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role as keyof typeof navLinks;
  const links = navLinks[role] || [];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">AtomQuest</span>
              <span className="text-purple-300 text-xs ml-1.5 hidden sm:inline">Goal Portal</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/20">
              <div className="text-right">
                <div className="text-white text-sm font-medium">{session?.user?.name}</div>
                <div className="text-white/50 text-xs">{session?.user?.role}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
