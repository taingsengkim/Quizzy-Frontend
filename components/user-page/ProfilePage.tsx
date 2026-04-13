"use client";

import Image from "next/image";
import { useState } from "react";
import { useGetProfileQuery } from "@/lib/auth/api-auth/authSlice";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditProfileModal from "./EditProfileModal (1)";

function scoreColor(correct: number, total: number) {
  const pct = correct / total;
  if (pct >= 0.8) return "text-emerald-400";
  if (pct >= 0.5) return "text-amber-400";
  return "text-rose-500";
}
function scoreHex(correct: number, total: number) {
  const pct = correct / total;
  if (pct >= 0.8) return "#34d399";
  if (pct >= 0.5) return "#fbbf24";
  return "#f43f5e";
}

export default function ProfileComponent2() {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading)
    return (
      <div className="font-mono text-sm text-slate-400 p-8 flex items-center gap-2">
        <span className="text-emerald-500 animate-pulse">~$</span>{" "}
        loading_profile.sh ...
      </div>
    );

  if (isError || !profile)
    return (
      <div className="font-mono text-sm text-rose-500 p-8">
        <span className="text-emerald-500">~$</span> fatal: failed to fetch
        profile
      </div>
    );

  const totalQ = profile.quizHistory.reduce(
    (s: number, q: any) => s + q.totalQuestions,
    0,
  );
  const totalC = profile.quizHistory.reduce(
    (s: number, q: any) => s + q.correctAnswers,
    0,
  );
  const avg = totalQ ? Math.round((totalC / totalQ) * 100) : 0;

  const avatarSrc =
    profile.avatarUrl ||
    `https://api.dicebear.com/8.x/identicon/svg?seed=${profile.username}`;

  return (
    <>
      {/* ── Edit Profile Modal ── */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentUsername={profile.username}
        currentAvatar={profile.avatarUrl}
        onSaved={() => refetch()}
      />

      <div className="max-w-2xl mx-auto p-6 space-y-6 font-mono-custom animate-fade-up">
        <br />
        <br />
        <div className="border border-slate-900/10 rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-2xl">
          {/* ── title bar ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 ml-2">
                user_session — {profile.username.toLowerCase()}
              </span>
            </div>

            {/* ── Edit button ── */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditOpen(true)}
              className="h-7 px-3 text-[10px] uppercase tracking-widest font-mono text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50 transition-all gap-1.5"
            >
              <Pencil className="w-3 h-3" />
              edit profile
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* ── avatar + username ── */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="relative w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-800 p-1 shadow-inner flex-shrink-0">
                <Image
                  src={avatarSrc}
                  alt={`${profile.username}'s avatar`}
                  width={250}
                  height={250}
                  className="rounded-full object-cover"
                  sizes="80px"
                  priority
                />
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <span className="text-emerald-500">~$</span>
                  <span className="text-sky-400">{profile.username}</span>
                  <span className="inline-block w-2 h-6 bg-sky-500 ml-1 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 mt-1 select-all">
                  // UUID: {profile.id}
                </p>
              </div>
            </div>

            {/* ── info rows ── */}
            <div className="grid gap-3 text-sm">
              <div className="flex items-center">
                <span className="text-slate-500 w-28 shrink-0">
                  email_address:
                </span>
                <span className="text-sky-300">{profile.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-500 w-28 shrink-0">
                  permissions:
                </span>
                <div className="flex gap-2">
                  {profile.role.map((r: any) => (
                    <span
                      key={r.id}
                      className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase"
                    >
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── stats ── */}
            <div className="grid grid-cols-3 gap-4 py-2">
              {[
                {
                  label: "SESSIONS",
                  value: profile.quizHistory.length,
                  color: "text-sky-400",
                },
                {
                  label: "ACCURACY",
                  value: `${totalC}/${totalQ}`,
                  color: "text-emerald-400",
                },
                {
                  label: "AVG_SCORE",
                  value: `${avg}%`,
                  color: scoreColor(totalC, totalQ || 1),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4"
                >
                  <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── quiz history ── */}
            <div className="space-y-3">
              <p className="text-xs text-slate-500">// execution_history.log</p>
              <div className="bg-slate-950/50 rounded-lg border border-slate-800/50 p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {profile.quizHistory.length === 0 ? (
                  <span className="text-xs text-slate-600 italic">
                    No records found.
                  </span>
                ) : (
                  <ul className="space-y-4">
                    {profile.quizHistory.map((q: any, i: number) => {
                      const pct = Math.round(
                        (q.correctAnswers / q.totalQuestions) * 100,
                      );
                      const col = scoreHex(q.correctAnswers, q.totalQuestions);
                      return (
                        <li key={q.quizId} className="group">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">
                              <span className="text-slate-600 mr-2">
                                {i + 1}.
                              </span>
                              {q.quizTitle}
                            </span>
                            <span style={{ color: col }} className="font-bold">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-1000"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: col,
                                boxShadow: `0 0 8px ${col}66`,
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
