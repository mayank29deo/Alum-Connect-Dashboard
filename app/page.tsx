"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { getSupabase, AlumniProfile, AlumniStatus } from "@/lib/supabase";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  RefreshCw,
  Lock,
  Sparkles,
  Users,
  ChevronDown,
  ExternalLink,
  X,
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<
  AlumniStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-green-50 text-green-600 border-green-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
};

const ADMIN_PASSWORD =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ADMIN_SECRET) ||
  "vedantu_admin_2026";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AlumniStatus>("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [selected, setSelected] = useState<AlumniProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const { data, error } = await client
      .from("alumni_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error && data) setAlumni(data as AlumniProfile[]);
  }, []);

  useEffect(() => {
    if (authed) fetchAlumni();
  }, [authed, fetchAlumni]);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  const updateStatus = async (id: string, status: AlumniStatus) => {
    setActionLoading(id + status);
    const client = getSupabase();
    if (!client) { setActionLoading(null); return; }
    const { error } = await client
      .from("alumni_profiles")
      .update({
        status,
        reviewer_note: note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setActionLoading(null);
    if (!error) {
      setAlumni((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, reviewer_note: note } : a))
      );
      setSelected((s) => (s?.id === id ? { ...s, status } : s));
      setNote("");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Name","Email","Phone","Status","Field","College","Degree",
      "Passing Year","Company","Role","City","Specialization",
      "Exam Cleared","Rank / Result","Vedantu Years","Classes",
      "Subjects","Available for Mentoring","Session Pref","Duration (min)",
      "Tags","Bio","LinkedIn","Referral Source","Submitted On","Reviewer Note",
    ];
    const rows = filtered.map((a) => [
      a.full_name, a.email, a.phone ?? "", a.status ?? "",
      a.field, a.college_name, a.degree,
      a.college_year_of_passing ?? "", a.current_company ?? "",
      a.current_role ?? "", a.current_city ?? "", a.specialization ?? "",
      a.exam_cleared ?? "", a.rank_or_result ?? "",
      a.vedantu_study_years, a.vedantu_classes,
      (a.vedantu_subjects ?? []).join("; "),
      a.available_for_mentoring ? "Yes" : "No",
      a.session_preference ?? "",
      a.preferred_session_duration ?? "",
      (a.tags ?? []).join("; "),
      (a.bio ?? "").replace(/"/g, "'"),
      a.linkedin_url ?? "", a.referral_source ?? "",
      a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "",
      a.reviewer_note ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alumconnect_alumni_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const copyOnboardLink = () => {
    const link = `${window.location.origin}/onboard`;
    navigator.clipboard.writeText(link);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const allFields = [
    "all",
    ...Array.from(new Set(alumni.map((a) => a.field).filter(Boolean))),
  ];

  const filtered = alumni.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.college_name?.toLowerCase().includes(q) ||
      a.current_company?.toLowerCase().includes(q) ||
      a.exam_cleared?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchField = fieldFilter === "all" || a.field === fieldFilter;
    return matchSearch && matchStatus && matchField;
  });

  const counts = {
    total: alumni.length,
    pending: alumni.filter((a) => a.status === "pending").length,
    approved: alumni.filter((a) => a.status === "approved").length,
    rejected: alumni.filter((a) => a.status === "rejected").length,
  };

  // ── LOGIN ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center mb-3 shadow-lg shadow-orange-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">
              AlumConnect Admin
            </h1>
            <p className="text-sm text-gray-400 mt-1">Chief of Staff Dashboard</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Enter admin password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${
                  pwError ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
            </div>
            {pwError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Incorrect password. Try again.
              </p>
            )}
            <button
              onClick={handleLogin}
              className="w-full btn-orange py-3 rounded-xl text-sm"
            >
              Enter Dashboard
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Alumni?{" "}
            <a href="/onboard" className="text-orange-500 font-semibold hover:underline">
              Register here →
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Vedantu</p>
            <p className="text-sm font-extrabold text-gray-900">AlumConnect Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlumni}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 px-3 py-2 rounded-xl hover:bg-orange-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <a
            href="/onboard"
            target="_blank"
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 px-3 py-2 rounded-xl hover:bg-orange-50 transition-all"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Onboard Form</span>
          </a>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 btn-orange text-sm px-4 py-2 rounded-xl"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Submissions", val: counts.total, icon: Users, bg: "bg-gray-100", text: "text-gray-700" },
            { label: "Pending Review", val: counts.pending, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
            { label: "Approved", val: counts.approved, icon: CheckCircle, bg: "bg-green-50", text: "text-green-600" },
            { label: "Rejected", val: counts.rejected, icon: XCircle, bg: "bg-red-50", text: "text-red-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.text}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Onboard link banner */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900">Alumni Onboarding Link</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Share this link with alumni to collect registrations
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-600 min-w-0">
            <span className="text-orange-500 truncate max-w-[200px] sm:max-w-xs">
              {typeof window !== "undefined" ? `${window.location.origin}/onboard` : "/onboard"}
            </span>
            <button
              onClick={copyOnboardLink}
              className="text-xs font-sans font-bold text-orange-500 hover:text-orange-600 whitespace-nowrap ml-1 transition-colors"
            >
              {copyDone ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, college, company, exam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | AlumniStatus)
                  }
                  className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 cursor-pointer"
                >
                  {allFields.map((f) => (
                    <option key={f} value={f}>
                      {f === "all" ? "All Fields" : f}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2.5">
            Showing{" "}
            <strong className="text-gray-700">{filtered.length}</strong> of{" "}
            {alumni.length} submissions
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              <span className="text-sm">Loading submissions...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Users className="w-10 h-10 text-gray-200" />
              <p className="text-sm text-gray-400 font-medium">
                {alumni.length === 0
                  ? "No submissions yet — share the onboarding link"
                  : "No results match your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {[
                      "Name",
                      "Field",
                      "College",
                      "Exam & Rank",
                      "Available",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap first:pl-5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a) => {
                    const sc = STATUS_CONFIG[a.status ?? "pending"];
                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-orange-50/20 transition-colors group"
                      >
                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {a.profile_photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.profile_photo_url}
                                alt={a.full_name}
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
                                {initials(a.full_name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[130px]">
                                {a.full_name}
                              </p>
                              <p className="text-xs text-gray-400 truncate max-w-[130px]">
                                {a.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Field */}
                        <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                          {a.field}
                        </td>
                        {/* College */}
                        <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[150px] truncate">
                          {a.college_name}
                        </td>
                        {/* Exam */}
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                          <span className="text-gray-600">{a.exam_cleared}</span>
                          {a.rank_or_result && (
                            <span className="ml-1.5 font-bold text-orange-500">
                              {a.rank_or_result}
                            </span>
                          )}
                        </td>
                        {/* Available */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              a.available_for_mentoring
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {a.available_for_mentoring ? "Yes" : "No"}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`flex items-center gap-1 w-fit text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.color}`}
                          >
                            <sc.icon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          {a.created_at
                            ? new Date(a.created_at).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "2-digit" }
                              )
                            : "—"}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelected(a);
                                setNote("");
                              }}
                              title="View profile"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {a.status !== "approved" && (
                              <button
                                onClick={() => updateStatus(a.id!, "approved")}
                                disabled={!!actionLoading}
                                title="Approve"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-40"
                              >
                                {actionLoading === a.id + "approved" ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {a.status !== "rejected" && (
                              <button
                                onClick={() => updateStatus(a.id!, "rejected")}
                                disabled={!!actionLoading}
                                title="Reject"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                              >
                                {actionLoading === a.id + "rejected" ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Profile drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-extrabold text-gray-900">Profile Detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Photo + identity */}
              <div className="flex items-center gap-4">
                {selected.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.profile_photo_url}
                    alt={selected.full_name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-xl font-bold">
                    {initials(selected.full_name)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selected.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                  {selected.phone && (
                    <p className="text-xs text-gray-400 mt-0.5">{selected.phone}</p>
                  )}
                  {selected.linkedin_url && (
                    <a
                      href={selected.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-500 flex items-center gap-1 mt-1 hover:underline"
                    >
                      LinkedIn <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Current status badge */}
              {selected.status && (
                <div className={`flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border text-xs font-semibold ${STATUS_CONFIG[selected.status].color}`}>
                  {(() => {
                    const Icon = STATUS_CONFIG[selected.status].icon;
                    return <Icon className="w-3.5 h-3.5" />;
                  })()}
                  {STATUS_CONFIG[selected.status].label}
                  {selected.reviewer_note && (
                    <span className="text-gray-400 font-normal">· {selected.reviewer_note}</span>
                  )}
                </div>
              )}

              {/* Data sections */}
              {[
                {
                  title: "Vedantu Journey",
                  rows: [
                    ["Study Years", selected.vedantu_study_years],
                    ["Classes", selected.vedantu_classes],
                    ["Subjects", (selected.vedantu_subjects ?? []).join(", ") || null],
                    ["Exam Cleared", selected.exam_cleared],
                    ["Rank / Result", selected.rank_or_result],
                  ],
                },
                {
                  title: "Education",
                  rows: [
                    ["College", selected.college_name],
                    ["Degree", selected.degree],
                    ["Passing Year", selected.college_year_of_passing ? String(selected.college_year_of_passing) : null],
                  ],
                },
                {
                  title: "Current Status",
                  rows: [
                    ["Field", selected.field],
                    ["Role", selected.current_role],
                    ["Company", selected.current_company],
                    ["City", selected.current_city],
                    ["Specialization", selected.specialization],
                  ],
                },
                {
                  title: "Mentorship",
                  rows: [
                    ["Available", selected.available_for_mentoring ? "Yes ✓" : "Not yet"],
                    ["Session Type", selected.session_preference],
                    ["Duration", selected.preferred_session_duration ? `${selected.preferred_session_duration} min` : null],
                    ["Can help with", (selected.tags ?? []).join(", ") || null],
                    ["Heard via", selected.referral_source],
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">
                    {section.title}
                  </p>
                  <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {section.rows
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex px-4 py-2.5 gap-3">
                          <span className="text-xs text-gray-400 w-28 flex-shrink-0">
                            {k}
                          </span>
                          <span className="text-xs font-medium text-gray-800">
                            {v}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {selected.bio && (
                <div>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">
                    Bio
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
                    {selected.bio}
                  </p>
                </div>
              )}

              {/* Approve / Reject */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-800 mb-2">
                  Reviewer Note{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                <textarea
                  className="w-full text-xs bg-white border border-orange-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-400 resize-none mb-3"
                  rows={2}
                  placeholder="e.g. 'Verified JEE rank card', 'Cannot verify college claim'..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selected.id!, "approved")}
                    disabled={!!actionLoading || selected.status === "approved"}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {actionLoading === selected.id + "approved" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id!, "rejected")}
                    disabled={!!actionLoading || selected.status === "rejected"}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {actionLoading === selected.id + "rejected" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
