import { useEffect, useMemo, useState } from "react";
import { getUserRoleInClub } from "../api/clubs.api";
import { useAuth } from "../context/AuthContext";
import type { ClubRole } from "../types/clubs.types";

export function useClubRole(clubId: string) {
  const { token } = useAuth();
  const [role, setRole] = useState<ClubRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRole() {
      if (!token || !clubId) {
        if (isMounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const fetchedRole = await getUserRoleInClub(clubId, token);
        if (isMounted) {
          setRole(fetchedRole);
        }
      } catch {
        if (isMounted) {
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [clubId, token]);

  return useMemo(() => {
    const isPresident = role === "president";
    const isVicePresident = role === "vice_president";
    const isMember = role === "member";

    return {
      role,
      loading,
      isPresident,
      isVicePresident,
      isMember,
      canManageEvents: isPresident || isVicePresident,
      canManageMembers: isPresident,
    };
  }, [role, loading]);
}
