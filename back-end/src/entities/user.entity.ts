export interface User {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  profile_pic_url: string | null;
  wants_email_reminders: boolean;
}

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export type UserResponse = Omit<User, 'password_hash'>;
