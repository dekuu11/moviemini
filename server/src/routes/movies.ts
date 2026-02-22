import { Router } from 'express';
import { tmdb } from '../services/tmdb';

const router = Router();

router.get('/movies/popular', async (req, res) => {
    try {
        const page = (req.query.page as string) || '1';
        const movies = await tmdb.popularMovies(page);
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
});

router.get('/tv/popular', async (req, res) => {
    try {
        const page = (req.query.page as string) || '1';
        const data = await tmdb.popularTv(page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch TV shows' });
    }
});

router.get('/trending', async (req, res) => {
    try {
        const data = await tmdb.trending();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trending' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ error: 'Query "q" is required' });
        }
        const page = (req.query.page as string) || '1';
        const data = await tmdb.search(query, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

router.get('/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        if (type !== 'movie' && type !== 'tv') {
            return res.status(400).json({ error: 'Type must be "movie" or "tv"' });
        }
        const data = await tmdb.details(type, id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});

export default router;