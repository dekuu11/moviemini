import { useEffect, useState } from "react";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_URL;

function AccountPage({ user, onBack, onLogout, onMovieClick }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetch(`${API_BASE}/favorites/${user.id}`)
      .then(res => res.json())
      .then(async (data) => {
        if (!Array.isArray(data)) {
          setFavorites([]);
          setLoading(false);
          return;
        }
        
        const withDetails = await Promise.all(
          data.map(async (fav) => {
            try {
              const res = await fetch(`${API_BASE}/${fav.media_type}/${fav.tmdb_id}`);
              const details = await res.json();
              return {
                ...fav,
                title: details.title || details.name || "Untitled",
                poster: details.poster_path 
                  ? `https://image.tmdb.org/t/p/w300${details.poster_path}` 
                  : null
              };
            } catch {
              return { ...fav, title: "Unknown", poster: null };
            }
          })
        );
        
        setFavorites(withDetails);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load favorites", err);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="screen accountPage">
      <header className="topbar">
        <button className="backBtn" onClick={onBack}>❮ Back</button>
        <span className="appTitle">Account</span>
        <div style={{ width: 40 }} />
      </header>

      <div className="accountContent">
        <div className="accountSection">
          <div className="accountSectionTitle">My Favorites</div>
          
          {loading ? (
            <div className="accountLoading">Loading...</div>
          ) : favorites.length === 0 ? (
            <div className="accountEmpty">No favorites yet. Add some movies!</div>
          ) : (
            <div className="favoritesGrid">
              {favorites.map(fav => (
                <div 
                  key={fav.id} 
                  className="favoriteCard"
                  onClick={() => onMovieClick(fav.tmdb_id, fav.media_type)}
                >
                  {fav.poster ? (
                    <img src={fav.poster} alt={fav.title} className="favoritePoster" />
                  ) : (
                    <div className="favoritePosterPlaceholder">
                      {fav.media_type === 'tv' ? '📺' : '🎬'}
                    </div>
                  )}
                  <div className="favoriteTitle">{fav.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="logoutBtn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AccountPage;
