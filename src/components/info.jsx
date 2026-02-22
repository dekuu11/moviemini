// src/components/info.jsx
import { useEffect, useState } from "react";
import "../App.css";

//const API_BASE = 'http://localhost:3000/api';
const API_BASE = 'http://192.168.0.4:3000/api';

function Info({ id, type = "movie", user, onBack }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setError(null);

    fetch(`${API_BASE}/${type}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load details", err);
        setError("Could not load movie details. Please try again.");
        setLoading(false);
      });
  }, [id, type]);

  useEffect(() => {
    if (!user || !id) return;
    
    fetch(`${API_BASE}/favorites/${user.id}`)
      .then(res => res.json())
      .then(favs => {
        const found = favs.some(f => f.tmdb_id === Number(id) && f.media_type === type);
        setIsFavorited(found);
      })
      .catch(() => {});
  }, [user, id, type]);

  if (!id) return null;
  
  if (loading) return <div className="screen">Loading…</div>;
  
  if (error) {
    return (
      <div className="screen errorScreen">
        <div className="errorMessage">{error}</div>
        <button className="errorRetryBtn" onClick={onBack}>Go Back</button>
      </div>
    );
  }
  
  if (!data) return null;

  const poster = data.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${data.backdrop_path}`  
    : data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`    
    : "";

  const label = type === "tv" ? "TV Show" : "Movie";

  const title = data.title || data.name || "Untitled";
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const rating = data.vote_average ? data.vote_average.toFixed(1) : "-";
  const genres = (data.genres || []).map((g) => g.name).join(", ");
  const overview = data.overview || "No overview available.";

  const runtime = type === "movie" && data.runtime 
    ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` 
    : type === "tv" && data.number_of_seasons 
      ? `${data.number_of_seasons} season${data.number_of_seasons > 1 ? "s" : ""}` 
      : null;

  const voteCount = data.vote_count ? data.vote_count.toLocaleString() : null;

  return (
    <div className="screen infoPage">
      {/* Header */}
      <div className="infoHeader">
        <button className="backBtn" onClick={onBack}>❮ Back</button>
        <div className="infoTitleTop">{label}</div>
        <div className="infoHeaderSpacer" />
      </div>

      {/* Poster */}
      {poster && (
        <div className="infoPosterWrap">
          <img src={poster} alt={title} className="infoPoster" />
        </div>
      )}

      {/* Title */}
      <div className="infoMainTitle">
        {title} {year && `(${year})`}
      </div>

      {/* Meta line */}
      <div className="infoMeta">
        {rating}{runtime && ` · ${runtime}`}{genres && ` · ${genres}`}
      </div>
      {voteCount && <div className="infoVoteCount">({voteCount} votes)</div>}

      {/* Favorites Toggle */}
      <div className="infoButtonsRow">
        <button 
          className={`infoPillBtn ${isFavorited ? "infoPillBtnActive" : ""}`}
          disabled={favLoading || !user}
          onClick={async () => {
            if (!user) return;
            setFavLoading(true);
            try {
              if (isFavorited) {
                const res = await fetch(`${API_BASE}/favorites/user/${user.id}/tmdb/${id}`, {
                  method: "DELETE"
                });
                if (!res.ok) throw new Error("Failed to remove");
                setIsFavorited(false);
              } else {
                const res = await fetch(`${API_BASE}/favorites`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: user.id,
                    tmdbId: id,
                    mediaType: type
                  })
                });
                if (!res.ok) throw new Error("Failed to add");
                setIsFavorited(true);
              }
            } catch (err) {
              console.error(err);
              alert(isFavorited ? "Failed to remove from favorites" : "Failed to add to favorites");
            }
            setFavLoading(false);
          }}
        >
          <span>{isFavorited ? "❤️" : "🤍"}</span> {isFavorited ? "In Favorites" : "Add to Favorites"}
        </button>
      </div>

      {/* About card */}
      <div className="infoCard">
        <div className="infoSectionLabel">ABOUT</div>

        <div className="infoRow">
          <div className="infoRowLabel">Genre :</div>
          <div className="infoRowValue">{genres || "Unknown"}</div>
        </div>

        <div className="infoOverview">{overview}</div>

        {data.tagline && (
          <div className="infoTagline">"{data.tagline}"</div>
        )}
      </div>
    </div>
  );
}

export default Info;
