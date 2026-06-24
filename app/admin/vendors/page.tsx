// C:\sawa-web\app\admin\vendors\page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { streamAllUsers, updateUserRole } from "@/lib/users";
import { User } from "@/types";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminVendorsPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = streamAllUsers(
      (data) => { setUsers(data); setLoading(false); },
      (err) => { console.error("خطأ في جلب المستخدمين:", err); setLoading(false); }
    );
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (uid: string, newRole: "user" | "vendor") => {
    setProcessing(uid);
    try {
      await updateUserRole(uid, newRole);
    } catch {
      console.error("خطأ في تحديث الدور");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = users.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const vendors = filtered.filter((u) => u.role === "vendor");
  const regularUsers = filtered.filter((u) => u.role === "user");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <AdminLayout title="إدارة الموردين">

      {/* ─── Search ──────────────────────────────────────── */}
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المستخدم أو البريد الإلكتروني..."
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <>
          {/* ─── Vendors ───────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-bold text-[#0f172a]">موردو الخدمات</h2>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {vendors.length}
              </span>
            </div>

            {vendors.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <span className="text-3xl mb-2">🏪</span>
                <p className="text-sm">لا يوجد موردون بعد</p>
                <p className="text-xs mt-1">حوّل مستخدماً لمورد من القائمة أدناه</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vendors.map((vendor) => (
                  <div key={vendor.uid}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                        {vendor.displayName?.charAt(0) ?? "V"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{vendor.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{vendor.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRoleChange(vendor.uid, "user")}
                      disabled={processing === vendor.uid}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50 flex-shrink-0"
                    >
                      {processing === vendor.uid ? "..." : "إلغاء المورد"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Regular Users ─────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-bold text-[#0f172a]">المستخدمون</h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {regularUsers.length}
              </span>
            </div>

            {regularUsers.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <span className="text-3xl mb-2">👤</span>
                <p className="text-sm">لا يوجد مستخدمون</p>
              </div>
            ) : (
              <div className="space-y-2">
                {regularUsers.map((user) => (
                  <div key={user.uid}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                        {user.displayName?.charAt(0) ?? "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRoleChange(user.uid, "vendor")}
                      disabled={processing === user.uid}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#1a3c6e] text-white hover:bg-[#1a3c6e]/90 transition disabled:opacity-50 flex-shrink-0"
                    >
                      {processing === user.uid ? "..." : "تحويل لمورد"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}