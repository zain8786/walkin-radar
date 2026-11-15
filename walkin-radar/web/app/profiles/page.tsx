"use client";

import { useRef, useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import { useProfiles } from "@/lib/useProfiles";
import { exportBackup, importBackup, newProfile } from "@/lib/profiles";
import type { Profile } from "@/lib/types";

export default function ProfilesPage() {
  const { ready, profiles, activeId, saveProfile, deleteProfile, chooseProfile, replaceAll } = useProfiles();
  const [editing, setEditing] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!ready) return <p className="text-sm text-slate-500">Loading…</p>;

  function handleSave(profile: Profile) {
    saveProfile(profile);
    chooseProfile(profile.id);
    setEditing(null);
    setMessage(`Saved ${profile.name}. This drive list now shows its eligibility.`);
  }

  function downloadBackup() {
    const blob = new Blob([exportBackup(profiles)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `walkin-radar-profiles-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function restoreBackup(file: File) {
    try {
      const merged = importBackup(await file.text(), profiles);
      replaceAll(merged);
      setMessage(`Restored. You now have ${merged.length} profile(s) on this browser.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not restore that file.");
    }
  }

  if (editing) {
    return (
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-4 text-lg font-semibold">{profiles.some((p) => p.id === editing.id) ? "Edit profile" : "New profile"}</h1>
        <ProfileForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Profiles on this browser</h1>
            <p className="text-sm text-slate-600">Profiles are stored only in this browser. Clearing browser data erases them, so keep a backup.</p>
          </div>
          <button onClick={() => setEditing(newProfile())} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            New profile
          </button>
        </div>

        {profiles.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No profiles yet. Create one to see eligibility.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {profiles.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{p.name || "Unnamed"} {p.id === activeId && <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">In use</span>}</p>
                  <p className="text-sm text-slate-600">{[p.highest_qualification, p.stream].filter(Boolean).join(", ") || "No education added"}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  {p.id !== activeId && (
                    <button onClick={() => chooseProfile(p.id)} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Use</button>
                  )}
                  <button onClick={() => setEditing(p)} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Edit</button>
                  <button
                    onClick={() => { if (confirm(`Delete ${p.name || "this profile"}? This cannot be undone.`)) deleteProfile(p.id); }}
                    className="rounded-md border border-rose-200 px-3 py-1.5 text-rose-700 hover:bg-rose-50"
                  >Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-semibold">Backup and restore</h2>
        <p className="mt-1 text-sm text-slate-600">Download a file with all profiles on this browser, or restore one to add profiles to another phone.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={downloadBackup} disabled={profiles.length === 0}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">Download backup</button>
          <button onClick={() => fileInput.current?.click()} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Restore from file</button>
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) restoreBackup(f); e.target.value = ""; }} />
        </div>
      </section>

      {message && <p role="status" className="rounded-md bg-indigo-50 p-3 text-sm text-indigo-900">{message}</p>}
    </div>
  );
}
