import { type ReactNode, createContext, useState } from "react";
import { type RunProfileType } from "~/types";

type ProfileContextType = {
  profile: RunProfileType;
  setProfile: (profile: RunProfileType) => void;
  showProfileHeader: boolean;
  setShowProfileHeader: (value: boolean) => void;
};

export const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<RunProfileType | null>(null);
  const [showProfileHeader, setShowProfileHeader] = useState(false);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, showProfileHeader, setShowProfileHeader }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
