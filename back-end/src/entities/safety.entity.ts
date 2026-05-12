export type HazardSeverity = 'low' | 'medium' | 'high';

export interface SafetyCheck {
  check_id: string;
  event_id: string;
  label: string;
  description: string | null;
  required: boolean;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number;
  created_at: string;
}

export interface CreateSafetyCheckDTO {
  label: string;
  description?: string;
  required?: boolean;
  sort_order?: number;
}

export interface UpdateSafetyCheckDTO {
  label?: string;
  description?: string | null;
  required?: boolean;
  completed?: boolean;
  sort_order?: number;
}

export interface Hazard {
  hazard_id: string;
  event_id: string;
  label: string;
  severity: HazardSeverity;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateHazardDTO {
  label: string;
  severity?: HazardSeverity;
  notes?: string;
}

export interface UpdateHazardDTO {
  label?: string;
  severity?: HazardSeverity;
  notes?: string | null;
}

export interface EmergencyContact {
  contact_id: string;
  event_id: string;
  name: string;
  role: string | null;
  phone: string;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface CreateEmergencyContactDTO {
  name: string;
  role?: string;
  phone: string;
  notes?: string;
  sort_order?: number;
}

export interface UpdateEmergencyContactDTO {
  name?: string;
  role?: string | null;
  phone?: string;
  notes?: string | null;
  sort_order?: number;
}

// Default checklist seeded into every new outdoor event. Kept in code (not
// the DB) so future tweaks don't require a migration. Order matters — the UI
// renders by sort_order.
export const DEFAULT_SAFETY_CHECK_TEMPLATE: ReadonlyArray<{
  label: string;
  description?: string;
  required: boolean;
}> = [
  { label: 'Risk assessment completed and filed', required: true },
  { label: 'Trip leader and first-aider assigned', required: true },
  { label: 'Emergency contacts confirmed', required: true },
  { label: 'Weather forecast reviewed', required: true },
  { label: 'Hazard list reviewed with attendees', required: true },
  { label: 'Equipment checked and signed off', required: true },
  { label: 'Liability waivers collected from all attendees', required: true },
  { label: 'Medical declarations collected from all attendees', required: true },
];
