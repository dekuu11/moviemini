import { useEffect, useState, useMemo } from "react"; 
import HorizontalRow from "./components/HorizontalRow";
import MovieDetails from './components/movies';
import Info from "./components/info";
import AccountPage from "./components/AccountPage";
import "./App.css";
const API_BASE = import.meta.env.VITE_API_URL;

const DEMO_USER = { id: 1, username: "demo" };

const popular = [
  "movie",
  "tv" 
]


const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/";
const HERO_SIZE = "w1280"; 

export default function App() {
  const [view, setView] = useState("home");
  const [demoMovies, setDemoMovies] = useState([]);
  const [demoShows, setDemoShows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState("movie");
  const [user, setUser] = useState(DEMO_USER);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchResults, setSearchResults] = useState([]);
  const [heroItems, setHeroItems] = useState([]); 
  const [heroIndex, setHeroIndex] = useState(0);

  // If not logged in, show login page
  

  const openInfo = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
    setView("movieInfo")
  }

  

  function movies_load(types) {
    for (const type of types) {

    fetch(`${API_BASE}/${type === 'movie' ? 'movies' : 'tv'}/popular`)
      .then(res => res.json())
      .then(res => {
        const trending_mv = res.results;
        const list = [];
        for (let i = 0; i < trending_mv.length; i++) {
          if(trending_mv[i]){
            let poster = "https://image.tmdb.org/t/p/original" + trending_mv[i]["poster_path"];
            let mv = {
              id: i,
              data: trending_mv[i]["id"],
              mediaType: type,
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

    fetch(`${API_BASE}/trending`)
      .then((res) => res.json())
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : [];

        const items = results
          .filter((x) => x?.backdrop_path)
          .map((x) => {
            const title = 
              x?.media_type === "tv"
                ? (x?.name || x?.original_name || "Untitled")
                : (x?.title || x?.original_title || "Untitled");

            return {
              id: x.id,
              mediaType: x.media_type,
              title,
              backdropUrl: `${TMDB_IMG_BASE}${HERO_SIZE}${x.backdrop_path}`,
            };
          })
        setHeroItems(items);
        setHeroIndex(0);
      })
      .catch((err) => console.error(err));
  }

  const handleSearch = async (e) => {
    // Only search if user presses Enter and box is not empty
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {

      try {
        // We use 'multi' to search for both movies and tv shows
        const response = await fetch(`${API_BASE}/search?q=${searchQuery}`);
        const data = await response.json();
        
        // Format the data exactly like your other movies
        const formattedResults = data.results
          .filter(item => item.poster_path) // Only keep items with images
          .map((item, index) => ({
             data: item.id,
             mediaType: item.media_type,
             title: item.title || item.name, // Handle Movie vs TV titles
             rank: null, // Search results don't need a rank number
             poster: "https://image.tmdb.org/t/p/original" + item.poster_path
          }));

        setSearchResults(formattedResults);
        setView("search"); 
      } catch (error) {
        console.error("Search failed:", error);
      }
    }
  }



  useEffect(() => {
    if (!user) return;
    const tg = window?.Telegram?.WebApp;
    movies_load(popular);
    hero_load(); 
    if (!tg) return;
    tg.ready();      // Telegram WebApp API
    tg.expand?.();
  }, [user]);

  useEffect(() => {
    if (heroItems.length < 2) return;

    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 8000);

    return () => clearInterval(id);
  }, [heroItems]);


  const currentHero = useMemo(() => {
    const item = heroItems[heroIndex] || {};

    return {
      src: item.backdropUrl || "https://picsum.photos/seed/hero/900/520",
      title: item.title || "",
      id: item.id || "",
      type: item.mediaType || "",
    };
  }, [heroItems, heroIndex]);

  if (view === "movieInfo" && selectedId) {
    return (
      <Info
        id={selectedId}
        type={selectedType}
        user={user}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "movies") {
    return (
      <MovieDetails 
        movies={demoMovies} 
        onBack={() => setView("home")} 
        onMovieClick={(id, type) => openInfo(id, type)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchKeyDown={handleSearch}
      />
    );
  }

  if (view === "tvshows") {
    return (
      <MovieDetails 
        movies={demoShows} 
        onBack={() => setView("home")} 
        onMovieClick={(id, type) => openInfo(id, type)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchKeyDown={handleSearch}
      />
    );
  }

  // If view is 'search', show the search results (reusing the same component!)
  if (view === "search") {
    return (
      <MovieDetails 
        movies={searchResults} 
        onMovieClick={(id, type) => openInfo(id, type)}
        onBack={() => {
            setView("home"); 
            setSearchQuery("");
        }} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchKeyDown={handleSearch} 
      />
    );
  }

  // Account page with favorites and logout
  if (view === "account") {
    return (
      <AccountPage 
        user={user}
        onBack={() => setView("home")}
        onLogout={() => {
          setView("home");
          setUser(DEMO_USER);
        }}
        onMovieClick={(id, type) => openInfo(id, type)}
      />
    );
  }

  return (
    <div className="screen">
      <header className="topbar">
        <span className="appTitle">MovieMini</span>
        <button className="accountBtn" onClick={() => setView("account")}>👤</button>
      </header>

      <div className="searchWrap">
        <div className="search">
          <span className="icon">⌕</span>
          <input 
            placeholder="Search movies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch} 
          />
        </div>
      </div>

      <div className="chips">
        <button className="chip" onClick={() => setView("movies")}>
          Movies
        </button>
        <button className="chip" onClick={() => setView("tvshows")}>
          TV Shows
        </button>
      </div>

      <div className="hero" onClick={() => openInfo(currentHero.id, currentHero.type)}>
        <img alt="Featured" src={currentHero.src} />
        {currentHero.title && <div className="heroTitle">{currentHero.title}</div>}
      </div>


      <section className="section">
        <div className="sectionHeader">
          <div className="sectionTitle">MOVIES</div>
          <button className="seeAll" onClick={() => setView("movies")}>
            See all
          </button>
        </div>
        <HorizontalRow 
          items={demoMovies}
          onItemClick={(item) => openInfo(item.data, item.mediaType)} 
        />
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div className="sectionTitle">TV SHOWS</div>
          <button className="seeAll" onClick={() => setView("tvshows")}>
            See all
          </button>
        </div>
        <HorizontalRow 
          items={demoShows} 
          onItemClick={(item) => openInfo(item.data, item.mediaType)} 
        />
      </section>

      <div className="bottomSafe" />
    </div>
  );
}
