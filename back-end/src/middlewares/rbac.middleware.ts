import { Response, NextFunction } from "express";
import { getUserRoleInClub } from "../repositories/club.repository";
import { ClubRole } from "../entities/club-member.entity";
import { AuthRequest } from "./auth.middleware";

export interface RBACRequest extends AuthRequest {
  clubRole?: ClubRole;
}

export function requireClubRole(...allowedRoles: ClubRole[]) {
  return async (req: RBACRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const clubId = req.params.clubId || req.body.club_id;
      if (!clubId) {
        return res.status(400).json({ message: "club_id is required" });
      }

      const role = await getUserRoleInClub(userId, clubId);
      if (!role) {
        return res.status(403).json({ message: "You are not a member of this club" });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      req.clubRole = role;
      next();

    } catch (error) {
      console.error("RBAC error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
