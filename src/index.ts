import express from 'express';
import router from './adapter/in/web/routes/account.routes';
import env from './adapter/config/env';

const app = express();
const PORT = env.PORT || 3000;

app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Deprecated: use src/adapter/in/web/server.ts as entrypoint
export * from './adapter/in/web/server';
