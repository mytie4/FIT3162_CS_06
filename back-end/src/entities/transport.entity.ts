export interface TransportPassenger {
  passenger_id: string;
  driver_id: string;
  user_id: string;
  user_name: string | null;
  created_at: string;
}

export interface TransportDriver {
  driver_id: string;
  event_id: string;
  driver_user_id: string | null;
  driver_name: string;
  vehicle: string | null;
  seats_total: number;
  departure_location: string;
  departure_time: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  passengers: TransportPassenger[];
}

export interface CreateTransportDriverDTO {
  driver_user_id?: string | null;
  driver_name: string;
  vehicle?: string | null;
  seats_total: number;
  departure_location: string;
  departure_time: string;
  notes?: string | null;
}

export interface UpdateTransportDriverDTO {
  driver_user_id?: string | null;
  driver_name?: string;
  vehicle?: string | null;
  seats_total?: number;
  departure_location?: string;
  departure_time?: string;
  notes?: string | null;
}
