import type { Request, Response } from "express";
import * as clubService from "../services/club.service";
import type { CreateClubDTO } from "../entities/club.entity";

export async function createClub(req: Request, res: Response) {
  try {
    const clubData: CreateClubDTO = req.body;
    // temp. replace later with real UUID
    const userId = "1e23f456-...";
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
