import type { Request, Response } from 'express';

import {
  registerUser,
  loginUser,
  ServiceError,
} from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    const result = await registerUser(name ?? '', email ?? '', password ?? '');

    return res.status(201).json({
      message: 'Account created successfully',
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('Register failed:', errorMessage);

    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    const result = await loginUser(email ?? '', password ?? '');

    return res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('Login failed:', errorMessage);

    return res.status(500).json({ error: 'Internal server error' });
  }
}
