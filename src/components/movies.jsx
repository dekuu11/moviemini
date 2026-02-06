import { useMemo, useState, useEffect } from "react";
import "../App.css";

const PAGE_SIZE = 6;
const MAX_PAGE_BUTTONS = 3;

function MoviesPage({ movies = [], onBack, onMovieClick, searchQuery, onSearchChange, onSearchKeyDown}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(movies.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageMovies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return movies.slice(start, start + PAGE_SIZE);
  }, [movies, page]);

  const goToPage = (p) => setPage(Math.min(totalPages, Math.max(1, p)));
  const prevPage = () => goToPage(page - 1);
  const nextPage = () => goToPage(page + 1);

  const { btns, showDots, showLast } = useMemo(() => {
    const visible = Math.min(totalPages, MAX_PAGE_BUTTONS);
    const b = Array.from({ length: visible }, (_, i) => i + 1);
    const dots = totalPages > visible;
    return { btns: b, showDots: dots, showLast: dots }; // show last page when dots shown
  }, [totalPages]);

  return (
    <div className="screen moviesPage">
      {/* Header */}
      <div className="moviesHeader">
        <button className="backBtn" onClick={onBack}>
          ❮ Back
        </button>

        <div className="moviesTitle">All Movies</div>

        <div className="moviesHeaderSpacer" />
      </div>

      <div className="searchWrap">
        <div className="search">
          <span className="icon">⌕</span>
          <input 
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>
      </div>

      <div className="chips">
        <button className="chip chipActive">
          <span className="chipIcon">▦</span> Movies
        </button>
        <button className="chip">
          <span className="chipIcon">🌐</span> TV Shows
        </button>
      </div>

      <div className="sectionHeader">
          <div className="sectionTitle">MOVIES</div>
    </div>

      {/* Grid */}
      <div className="moviesGrid">
        {pageMovies.map((movie) => (
          <div 
            key={`${movie.data ?? movie.id}-${movie.title}`}  
            className="movieCard"
            onClick={() => onMovieClick && onMovieClick(movie.data, movie.mediaType)}
          >
            <img src={movie.poster} alt={movie.title} className="moviePoster" />
            <div className="movieName">{movie.title}</div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="paginationBar">
        <button
          className="pageChevron"
          onClick={prevPage}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        <div className="pagePill">
          {btns.map((n) => (
            <button
              key={n}
              className={`pageBtn ${n === page ? "pageBtnActive" : ""}`}
              onClick={() => goToPage(n)}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </button>
          ))}

          {showDots && <span className="pageDots">…</span>}

          {showLast && (
            <button
              className={`pageBtn ${totalPages === page ? "pageBtnActive" : ""}`}
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          className="pageChevron"
          onClick={nextPage}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <div className="bottomSafe" />
    </div>
  );
}

export default MoviesPage;
