import express from 'express';
import authRoutes from './routes/authRoutes.ts';
import habitRoutes from './routes/habitRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { isTest } from '../env.ts';

const app = express();

app.use(helmet())
app.use(cors({
  origin: ['*']
}))
app.use(express.json()) // Insures that req.body is the payload in json
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev', {
  skip: () => isTest(),
}))

app.get('/health', (req, res) => {
  res
    .status(200)
    .json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Habit Tracker API',
    })
})

// app.get('/health/detailed', async (req, res) => {
//   try {
//     // Check database connection
//     await db.raw('SELECT 1')
//
//     // Check external services
//     const redisStatus = await redis.ping();
//
//     res
//     .status(200)
//     .json({
//       status: 'OK',
//       timestamp: new Date().toISOString(),
//       services: {
//         database: 'connected',
//         redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
//       }
//       version: process.env.APP_VERSION,
//       uptime: process.uptime(),
//     })
//   } catch (error) {
//     res.status(503).json({
//       status: 'ERROR',
//       message: 'Service unhealthy',
//       error: error.message,
//     })
//   }
// })

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/users', userRoutes)

export { app };
export default app;
