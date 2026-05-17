"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: () => fetch("/api/audit").then((r) => r.json()),
  });

  const logs = data?.logs || [];

  const ACTION_COLORS: Record<string, string> = {
    APPROVE: "bg-green-100 text-green-700",
    UNLOCK: "bg-violet-100 text-violet-700",
    RETURN: "bg-red-100 text-red-700",
    EDIT: "bg-orange-100 text-orange-700",
    STATUS_CHANGE: "bg-blue-100 text-blue-700",
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500 text-sm mt-1">{logs.length} audit events • Last 100 events</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
          No audit events yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Entity</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(log.timestamp), "MMM d, HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-xs">{log.user?.name}</div>
                    <div className="text-xs text-gray-400">{log.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {log.entityType} • <code className="text-gray-400 text-xs">{log.entityId.slice(0, 8)}...</code>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                    {log.newValue ? JSON.stringify(log.newValue).slice(0, 80) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
