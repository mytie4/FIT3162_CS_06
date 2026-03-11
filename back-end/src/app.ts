import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import apiRouter from './routes';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Backend API is running',
  });
});

app.use('/api', apiRouter);

export default app;
