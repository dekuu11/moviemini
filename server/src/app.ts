// app.ts
import express from 'express';
import cors from 'cors';
import moviesRouter from './routes/movies.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', moviesRouter);

export default app;