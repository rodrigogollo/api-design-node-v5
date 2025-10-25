import { app } from './server.ts';

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// catch any unhandled errors
// wont work in express 
process.on('uncaughtException', (e) => {
  console.error('Uncaught Exception', e)
})
