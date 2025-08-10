import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({
        level,
        message,
        timestamp,
        ...meta
      }: {
        level: string;
        message: unknown;
        timestamp?: string;
        [k: string]: unknown;
      }) => {
        const metaJson = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${String(timestamp ?? '')} [${String(level)}] ${String(message)} ${metaJson}`;
      },
    ),
  ),
  transports: [new winston.transports.Console()],
});
