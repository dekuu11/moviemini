import { Router } from 'express';
import pool from '../index.js';


const router = Router();

router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await pool.query(
        'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get favorites' });
    }
  });

// Add a favorite
router.post('/', async (req, res) => {
    try {
      const { userId, tmdbId, mediaType } = req.body;
      const result = await pool.query(
        'INSERT INTO favorites (user_id, tmdb_id, media_type) VALUES ($1, $2, $3) RETURNING *',
        [userId, tmdbId, mediaType]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add favorite' });
    }
  });
  

// Remove a favorite by id
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM favorites WHERE id = $1', [id]);
      res.json({ message: 'Favorite removed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  });

// Remove a favorite by user and tmdb_id
router.delete('/user/:userId/tmdb/:tmdbId', async (req, res) => {
    try {
      const { userId, tmdbId } = req.params;
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND tmdb_id = $2',
        [userId, tmdbId]
      );
      res.json({ message: 'Favorite removed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  });
  
  export default router;