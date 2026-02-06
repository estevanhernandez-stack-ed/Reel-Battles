import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, apiPost } from "../constants/api";

const PROFILE_KEY = "@cinegame_profile_id";
const USERNAME_KEY = "@cinegame_username";

export interface Profile {
  id: string;
  username: string;
  currentStreak: number;
  longestStreak: number;
  lastChallengeDate: string | null;
  totalGamesPlayed: number;
}

export function useProfile() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedId = await AsyncStorage.getItem(PROFILE_KEY);
        const savedUsername = await AsyncStorage.getItem(USERNAME_KEY);
        if (savedId && savedUsername) {
          setProfileId(savedId);
          setUsername(savedUsername);
          const data = await apiFetch<Profile>(`/api/profiles/${savedId}`);
          setProfile(data);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      }
      setLoading(false);
    })();
  }, []);

  const createProfile = useCallback(async (name: string) => {
    try {
      const data = await apiPost<Profile>("/api/profiles", { username: name });
      await AsyncStorage.setItem(PROFILE_KEY, data.id);
      await AsyncStorage.setItem(USERNAME_KEY, data.username);
      setProfileId(data.id);
      setUsername(data.username);
      setProfile(data);
      return data;
    } catch (e) {
      throw e;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!profileId) return;
    try {
      const data = await apiFetch<Profile>(`/api/profiles/${profileId}`);
      setProfile(data);
    } catch (e) {
      console.error("Error refreshing profile:", e);
    }
  }, [profileId]);

  return {
    profileId,
    username,
    profile,
    loading,
    createProfile,
    refreshProfile,
    hasProfile: !!profileId,
  };
}
