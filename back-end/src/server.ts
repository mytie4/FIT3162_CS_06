import app from './app';
import { testConnection } from './db';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await testConnection();
});
