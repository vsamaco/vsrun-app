import { useContext } from "react";
import { ProfileContext } from "./Profile";

export function useProfile() {
  const profileContext = useContext(ProfileContext);
  if (profileContext == null) throw new Error("provider missing");
  return profileContext;
}
