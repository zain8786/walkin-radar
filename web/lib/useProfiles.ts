"use client";

import { useCallback, useEffect, useState } from "react";
import type { Profile, SavedState } from "./types";
import { readActiveId, readProfiles, writeActiveId, writeProfiles } from "./profiles";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfiles(readProfiles());
    setActiveId(readActiveId());
    setReady(true);
  }, []);

  const commit = useCallback((next: Profile[]) => {
    setProfiles(next);
    writeProfiles(next);
  }, []);

  const saveProfile = useCallback(
    (profile: Profile) => {
      const exists = profiles.some((p) => p.id === profile.id);
      commit(exists ? profiles.map((p) => (p.id === profile.id ? profile : p)) : [...profiles, profile]);
    },
    [profiles, commit],
  );

  const deleteProfile = useCallback(
    (id: string) => {
      commit(profiles.filter((p) => p.id !== id));
      if (activeId === id) {
        writeActiveId(null);
        setActiveId(null);
      }
    },
    [profiles, activeId, commit],
  );

  const chooseProfile = useCallback((id: string) => {
    writeActiveId(id);
    setActiveId(id);
  }, []);

  const setSaved = useCallback(
    (profileId: string, listingId: string, state: SavedState | null) => {
      commit(
        profiles.map((p) => {
          if (p.id !== profileId) return p;
          const saved = { ...p.saved };
          if (state) saved[listingId] = state;
          else delete saved[listingId];
          return { ...p, saved };
        }),
      );
    },
    [profiles, commit],
  );

  const replaceAll = useCallback((next: Profile[]) => commit(next), [commit]);

  const active = profiles.find((p) => p.id === activeId) ?? null;

  return { ready, profiles, active, activeId, saveProfile, deleteProfile, chooseProfile, setSaved, replaceAll };
}
