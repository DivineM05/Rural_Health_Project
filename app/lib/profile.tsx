import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'patientProfile';

export type CheckupSchedule = {
  startDate: string;
  interval: number;
  unit: 'days' | 'weeks' | 'months' | 'years';
};

export type PatientProfile = {
  location: string;
  conditions: string[];
  checkupSchedule?: CheckupSchedule;
};

type ProfileState = {
  isLoading: boolean;
  profile: PatientProfile | null;
  saveProfile: (profile: PatientProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setProfile(JSON.parse(stored));
      setIsLoading(false);
    });
  }, []);

  async function saveProfile(newProfile: PatientProfile) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
  }

  async function resetProfile() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }

  return (
    <ProfileContext.Provider value={{ isLoading, profile, saveProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile outside ProfileProvider');
  return context;
}
