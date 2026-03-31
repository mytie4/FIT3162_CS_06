import app from './app';
import { testConnection } from './db';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await testConnection();
});
