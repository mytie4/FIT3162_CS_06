import type { Request, Response } from "express";
import * as clubService from "../services/club.service";
import type { CreateClubDTO } from "../entities/club.entity";
import type { AuthRequest } from "../middlewares/auth.middleware";

export async function createClub(req: AuthRequest, res: Response) {
  try {
    const clubData: CreateClubDTO = req.body;
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const club = await clubService.createClub(clubData, userId);

    return res.status(201).json({
      message: "Club created successfully.",
      club,
    });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error.";
    console.error("Create club failed:", errorMessage);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
