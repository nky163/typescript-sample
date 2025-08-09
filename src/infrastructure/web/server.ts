import express from 'express';
import env from '../config/env';
import router from './routes/account.routes';
import logger from '../logging/logger';
import { initDataSource } from '../config/data-source';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();
const port = env.PORT || 3000;

// Middleware
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', router);
app.use(errorMiddleware);

async function start() {
  try {
    await initDataSource();
    if (!process.env.JEST_WORKER_ID) {
      app.listen(port, () => {
        logger.info('Server started', { port });
      });
    }
  } catch (e) {
    logger.error('Failed to start server', { error: e });
  }
}

void start();
