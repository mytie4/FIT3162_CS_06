import type { Request, Response } from 'express';
import * as clubService from '../services/club.service';
import type { CreateClubDTO, UpdateClubDTO } from '../entities/club.entity';
import type { AuthRequest } from '../middlewares/auth.middleware';

export async function createClub(req: AuthRequest, res: Response) {
  try {
    const clubData: CreateClubDTO = req.body;
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const club = await clubService.createClub(clubData, userId);

    return res.status(201).json({
      message: 'Club created successfully.',
      club,
    });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('Create club failed:', errorMessage);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function getAllClubs(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clubs = await clubService.getAllClubsForUser(userId);

    return res.status(200).json(clubs);
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('Fetch all clubs failed:', errorMessage);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function joinClub(req: AuthRequest, res: Response) {
  try {
    const userID = req.user?.user_id;
    const { joinCode } = req.body;

    if (!userID) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const joinCodeStr = String(joinCode ?? "").trim();
    if (!/^\d{6}$/.test(joinCodeStr)) {
      return res
        .status(400)
        .json({ error: 'Join code must be a 6-digit number' });
    }

    await clubService.joinClub(userID, joinCodeStr);

    return res.status(200).json({ message: 'Successfully joined club' });
  } catch (error: any) {
    if (
      error.message === 'Invalid join code' ||
      error.message === 'User is already a member of this club'
    ) {
      return res.status(400).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function leaveClub(req: AuthRequest, res: Response) {
  try {
    const userID = req.user?.user_id;
    const { clubID } = req.body;

    if (!userID) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!clubID) {
      return res.status(400).json({ error: 'clubID is required' });
    }

    await clubService.leaveClub(userID, clubID);

    return res.status(200).json({
      message: 'Successfully left the club',
    });
  } catch (error: any) {
    if (error.message === 'User is not in this club') {
      return res.status(400).json({ error: error.message });
    }

    console.error('leaveClub error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getClubById(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const club = await clubService.getClubById(clubId);

    return res.status(200).json(club);
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('getClubById failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getClubMembers(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const members = await clubService.getClubMembers(clubId);

    return res.status(200).json(members);
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('getClubMembers failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserRole(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    const { clubId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const role = await clubService.getUserRoleInClub(userId, clubId);

    return res.status(200).json({ role });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('getUserRole failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateClub(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    const { clubId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data: UpdateClubDTO = req.body;
    const updated = await clubService.updateClub(clubId, data, userId);

    return res
      .status(200)
      .json({ message: 'Club updated successfully.', club: updated });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('updateClub failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteClub(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.user_id;
    const { clubId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await clubService.deleteClub(clubId, userId);

    return res.status(200).json({ message: 'Club deleted successfully.' });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('deleteClub failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMemberRole(req: AuthRequest, res: Response) {
  try {
    const requesterId = req.user?.user_id;
    const { clubId, userId } = req.params;
    const { role } = req.body;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await clubService.updateMemberRole(clubId, userId, role, requesterId);

    return res.status(200).json({ message: 'Role updated successfully.' });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('updateMemberRole failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeMember(req: AuthRequest, res: Response) {
  try {
    const requesterId = req.user?.user_id;
    const { clubId, userId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await clubService.removeMember(clubId, userId, requesterId);

    return res.status(200).json({ message: 'Member removed successfully.' });
  } catch (error) {
    if (error instanceof clubService.ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error.';
    console.error('removeMember failed:', errorMessage);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
