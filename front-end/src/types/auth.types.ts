export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
  profile_pic_url: string | null;
  wants_email_reminders: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}
