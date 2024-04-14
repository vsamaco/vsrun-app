import { type ReactNode, createContext, useState } from "react";

type ProfileContextType = {
  profile: { name: string; slug: string } | null;
  setProfile: (profile: { name: string; slug: string }) => void;
  showProfileHeader: boolean;
  setShowProfileHeader: (value: boolean) => void;
};

export const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<{ name: string; slug: string } | null>(
    null
  );
  const [showProfileHeader, setShowProfileHeader] = useState(false);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, showProfileHeader, setShowProfileHeader }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
