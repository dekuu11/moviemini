import { useEffect, useState, useMemo } from "react"; 
import HorizontalRow from "./components/HorizontalRow";
import MovieDetails from './components/movies';
import "./App.css";
const TMDB_BEARER = import.meta.env.VITE_API_KEY;

const popular = [
  "movie",
  "tv" 
]

const series = [];

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/";
const HERO_SIZE = "w1280"; // can be w780, w1280, original etc. [web:78]

export default function App() {
  const [demoMovies, setDemoMovies] = useState([]);
  const [demoShows, setDemoShows] = useState([]);

  const [view, setView] = useState("home");

  const [heroItems, setHeroItems] = useState([]); // [{ backdropUrl, title }]
  const [heroIndex, setHeroIndex] = useState(0);

  function movies_load(types) {
    for (const type of types) {
      const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_BEARER}`
      }
    };

    fetch(`https://api.themoviedb.org/3/${type}/popular?language=en-US&page=1`, options)
      .then(res => res.json())
      .then(res => {
        const trending_mv = res.results;
        const list = [];
        for (let i = 0; i < trending_mv.length; i++) {
          if(trending_mv[i]){
            let poster = "https://image.tmdb.org/t/p/original" + trending_mv[i]["poster_path"];
            let mv = {
              id: i,
              title: type === "movie" ? trending_mv[i]["title"] : trending_mv[i]["original_name"],
              rank: i+1, 
              poster: poster }
            list.push(mv)
          }
          
        }
        if (type == "movie"){
          setDemoMovies(list);
        }
        else {
          setDemoShows(list);
        }
      })
      .catch(err => console.error(err));
    }
  }

   function hero_load() {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_BEARER}`,
      },
    };

    // You can switch to movie/day or tv/day if you want. [web:98]
    fetch("https://api.themoviedb.org/3/trending/all/day?language=en-US", options)
      .then((res) => res.json())
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : [];

        // Keep only items with a backdrop_path, build full URLs. [web:78]
        const items = results
          .filter((x) => x?.backdrop_path)
          .map((x) => {
            const title = 
              x?.media_type === "tv"
                ? (x?.name || x?.original_name || "Untitled")
                : (x?.title || x?.original_title || "Untitled");

            return {
              title,
              backdropUrl: `${TMDB_IMG_BASE}${HERO_SIZE}${x.backdrop_path}`,
            };
          })
        setHeroItems(items);
        setHeroIndex(0);
      })
      .catch((err) => console.error(err));
  }



  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    movies_load(popular);
    hero_load(); 
    if (!tg) return;
    tg.ready();      // Telegram WebApp API
    tg.expand?.();
  }, []);

  useEffect(() => {
    if (heroItems.length < 2) return;

    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 12000);

    return () => clearInterval(id);
  }, [heroItems]);

  const heroSrc = useMemo(() => {
    return heroItems[heroIndex]?.backdropUrl || "https://picsum.photos/seed/hero/900/520";
  }, [heroItems, heroIndex]);

  const heroTitle = useMemo(() => {
    return heroItems[heroIndex]?.title || "";
  }, [heroItems, heroIndex]);


  if (view === "movies") {
    return (
      <MovieDetails 
        movies={demoMovies} 
        onBack={() => setView("home")} 
      />
    );
  }

  return (
    <div className="screen">
      <header className="topbar">
      </header>

      <div className="searchWrap">
        <div className="search">
          <span className="icon">⌕</span>
          <input placeholder="Search movies..." />
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

      <div className="hero">
        <img alt="Featured" src={heroSrc} />
        {heroTitle && <div className="heroTitle">{heroTitle}</div>}
      </div>


      <section className="section">
        <div className="sectionTitle"> TRENDING</div>
        <div className="sectionHeader">
          <div className="sectionTitle">MOVIES</div>
          <button className="seeAll" onClick={() => setView("movies")}>
            See all
          </button>
        </div>
        <HorizontalRow items={demoMovies} />
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div className="sectionTitle">TV SHOWS</div>
          <button className="seeAll">See all</button>
        </div>
        <HorizontalRow items={demoShows} />
      </section>

      <div className="bottomSafe" />
    </div>
  );
}
