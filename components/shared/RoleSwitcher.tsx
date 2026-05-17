"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RoleSwitcher() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const switchRole = async (role: "EMPLOYEE" | "MANAGER" | "ADMIN") => {
    setLoading(role);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const { email, password } = await res.json();

      await signOut({ redirect: false });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        alert("Role switch failed: " + result.error);
        return;
      }

      if (result?.ok) {
        if (role === "EMPLOYEE") router.push("/employee/dashboard");
        else if (role === "MANAGER") router.push("/manager/dashboard");
        else router.push("/admin/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const roles = [
    { key: "EMPLOYEE", label: "👤 Employee", color: "bg-blue-500 hover:bg-blue-600" },
    { key: "MANAGER", label: "👔 Manager", color: "bg-purple-500 hover:bg-purple-600" },
    { key: "ADMIN", label: "🔑 Admin", color: "bg-orange-500 hover:bg-orange-600" },
  ] as const;

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      <span className="text-xs text-white/60 px-2">Demo:</span>
      {roles.map((r) => (
        <button
          key={r.key}
          onClick={() => switchRole(r.key)}
          disabled={loading !== null || session?.user?.role === r.key}
          className={`px-3 py-1.5 rounded text-xs font-medium text-white transition-all
            ${r.color} 
            ${session?.user?.role === r.key ? "ring-2 ring-white ring-offset-1 ring-offset-transparent" : ""}
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading === r.key ? "..." : r.label}
        </button>
      ))}
    </div>
  );
}
