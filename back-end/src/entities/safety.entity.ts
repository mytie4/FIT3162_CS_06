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

// Default checklist seeded into every new event. Labels track the Monash HSW
// event planning framework so club organisers see the same language they'll
// encounter when filing the ERMP in SARAH. Kept in code (not the DB) so
// future tweaks don't require a migration. Order matters — the UI renders by
// sort_order.
export const DEFAULT_SAFETY_CHECK_TEMPLATE: ReadonlyArray<{
  label: string;
  description?: string;
  required: boolean;
}> = [
  {
    label: 'Event Risk Management Plan (ERMP) submitted',
    description: 'Lodge via the Monash SARAH system before promoting the event.',
    required: true,
  },
  {
    label: 'Event Safety Marshal appointed',
    description: 'Named Monash worker trained to act on risks during the event.',
    required: true,
  },
  {
    label: 'First aider identified',
    description: 'At least one attendee with current first aid qualifications.',
    required: true,
  },
  {
    label: 'Hazards identified with control measures',
    description: 'Each hazard recorded with a mitigation in the ERMP.',
    required: true,
  },
  {
    label: 'Emergency contacts confirmed',
    required: true,
  },
  {
    label: 'Weather and site conditions reviewed',
    required: true,
  },
  {
    label: 'Equipment inspected and signed off',
    required: true,
  },
  {
    label: 'Attendee consent and medical declarations collected',
    required: true,
  },
];
