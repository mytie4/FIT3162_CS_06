import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import apiRouter from './routes';
import swaggerSpec from './swagger';

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

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', apiRouter);

export default app;
