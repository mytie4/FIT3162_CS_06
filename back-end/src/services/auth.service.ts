import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import type { UserResponse } from '../entities/user.entity';
import * as userRepo from '../repositories/user.repository';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

export interface RegisterResult {
  user: UserResponse;
}

export interface LoginResult {
  token: string;
  user: UserResponse;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResult> {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail || !password) {
    throw new ServiceError(400, 'Name, email, and password are required');
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new ServiceError(400, 'Invalid email format');
  }

  if (password.length < 8) {
    throw new ServiceError(400, 'Password must be at least 8 characters long');
  }

  const exists = await userRepo.emailExists(normalizedEmail);
  if (exists) {
    throw new ServiceError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const createdUser = await userRepo.createUser(
    trimmedName,
    normalizedEmail,
    passwordHash,
  );

  return { user: createdUser };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new ServiceError(400, 'Email and password are required');
  }

  const user = await userRepo.findByEmail(normalizedEmail);
  if (!user) {
    throw new ServiceError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new ServiceError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      profile_pic_url: user.profile_pic_url,
      wants_email_reminders: user.wants_email_reminders,
    },
  };
}

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
