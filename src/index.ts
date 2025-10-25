import { env } from '../env.ts';
import { app } from './server.ts';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

// catch any unhandled errors
// wont work in express 
process.on('uncaughtException', (e) => {
  console.error('Uncaught Exception', e)
})
