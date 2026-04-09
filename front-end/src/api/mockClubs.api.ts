import type { Club } from "../types/clubs.types";

export async function getAllClubs(): Promise<Club[]> {
  return [
    {
      club_id: "ee7b4666-97d3-45ab-acad-f0a28f645e68",
      name: "Club 1",
      description: "abc",
      shared_drive_link: null,
      club_color: "#F36D8A",
      ongoing_event_count: 1,
      member_count: 350,
    },
    {
      club_id: "8aea7ebe-bfc0-4c83-9644-f9d8c8a6647e",
      name: "Monash Thai Club",
      description: "def",
      shared_drive_link: null,
      club_color: "#25A9EF",
      ongoing_event_count: 0,
      member_count: 12,
    },
    {
      club_id: "27d5dc2f-eb87-41be-97b1-fe8b085f2783",
      name: "MEGA",
      description: "ghi",
      shared_drive_link: null,
      club_color: "#9B7CF3",
      ongoing_event_count: 18,
      member_count: 1,
    },
    {
      club_id: "622a58b6-e9a4-41eb-a5a9-d03b2a2a501d",
      name: "Club 2",
      description: "jkl",
      shared_drive_link: null,
      club_color: null,
      ongoing_event_count: 0,
      member_count: 0,
    },
  ];
}
