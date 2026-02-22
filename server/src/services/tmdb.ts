const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(path: string, params?: Record<string, string>) {
    const url = new URL(`${TMDB_BASE}${path}`);
    if (params) {
        url.search = new URLSearchParams(params).toString();
    }
    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    });
    if (!response.ok) {
        throw new Error(`TMDB error: ${response.status}`);
    }
    return response.json();
}

export const tmdb = {
    popularMovies: (page = '1') => 
        tmdbFetch('/movie/popular', { language: 'en-US', page }),

    popularTv: (page = '1') => 
        tmdbFetch('/tv/popular', { language: 'en-US', page }),

    trending: () => 
        tmdbFetch('/trending/all/day', { language: 'en-US' }),

    search: (query: string, page = '1') => 
        tmdbFetch('/search/multi', { query, include_adult: 'false', language: 'en-US', page }),

    details: (type: string, id: string) => 
        tmdbFetch(`/${type}/${id}`, { language: 'en-US' })
};