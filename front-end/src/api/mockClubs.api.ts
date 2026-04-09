import type { Club } from "../types/clubs.types";

export async function getAllClubs(): Promise<Club[]> {
  return [
    {
      club_id: 1,
      name: "Club 1",
      description: "abc",
      shared_drive_link: null,
      club_color: "#F36D8A",
    },
    {
      club_id: 2,
      name: "MEGA",
      description: "def",
      shared_drive_link: null,
      club_color: "#25A9EF",
    },
    {
      club_id: 3,
      name: "Monash Thai Club",
      description: "ghi",
      shared_drive_link: null,
      club_color: "#9B7CF3",
    },
    {
      club_id: 4,
      name: "Club 2",
      description: "jkl",
      shared_drive_link: null,
      club_color: null,
    },
  ];
}
