// app.ts
import express from 'express';
import cors from 'cors';
import moviesRouter from './routes/movies';
import favoritesRouter from './routes/favorites';
import authRouter from './routes/auth';



const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/favorites', favoritesRouter);
app.use('/api/auth', authRouter);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', moviesRouter);

export default app;