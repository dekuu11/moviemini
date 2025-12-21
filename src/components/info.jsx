// src/components/info.jsx
import { useEffect, useState } from "react";
import "../App.css";

const TMDB_BEARER = import.meta.env.VITE_API_KEY; // ✅ uses same key as App

function Info({ id, type = "movie", onBack }) {       // ✅ props from App
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_BEARER}`,
      },
    };

    // /movie/{id} or /tv/{id}
    fetch(`https://api.themoviedb.org/3/${type}/${id}?language=en-US`, options) // [web:147]
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load details", err);
        setLoading(false);
      });
  }, [id, type]);

  if (!id) return null;
  if (loading || !data) return <div className="screen">Loading…</div>;

  const poster = data.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${data.backdrop_path}`  // [web:78]
    : data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`    // [web:78]
    : "";

  const label = type === "tv" ? "TV Show" : "Movie";

  const title = data.title || data.name || "Untitled";
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const rating = data.vote_average ? data.vote_average.toFixed(1) : "-";
  const genres = (data.genres || []).map((g) => g.name).join(", ");
  const overview = data.overview || "No overview available.";

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

      {/* Buttons row */}
      <div className="infoButtonsRow">
        <button className="infoPillBtn">
          <span>📅</span> PLAY
        </button>
        <button className="infoPillBtn">
          <span>🌐</span> Search on web
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

        <div className="infoRow">
          <div className="infoRowLabel">Director, Writer</div>
          <div className="infoRowValue">
            {/* TMDB gives credits from a different endpoint; for now just show the name field if present. [web:81] */}
            {data.tagline || "—"}
          </div>
        </div>

        <div className="infoRow">
          <div className="infoRowLabel">Rating</div>
          <div className="infoRowValue">{rating}</div>
        </div>
      </div>
    </div>
  );
}

export default Info;
