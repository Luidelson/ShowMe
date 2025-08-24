import React, { useEffect, useState } from "react";
import "./Content.css";
import Preloader from "../Preloader/Preloader";

function Content() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const pages = Array.from({ length: 100 }, (_, i) => i + 1); // Pages 1 to 200
    Promise.all(
      pages.map((page) =>
        fetch(`https://www.episodate.com/api/most-popular?page=${page}`)
          .then((res) => res.json())
          .then((data) => data.tv_shows || [])
      )
    )
      .then((results) => {
        // Remove duplicates by show.id
        const allShows = results.flat();
        const uniqueShowsMap = {};
        allShows.forEach((show) => {
          uniqueShowsMap[show.id] = show;
        });
        const uniqueShows = Object.values(uniqueShowsMap);
        setShows(uniqueShows);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch shows.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="content-wrapper">
        <Preloader />
      </div>
    );
  if (error) return <div className="content-wrapper">{error}</div>;

  // Filter shows by search
  const filteredShows = shows.filter((show) =>
    show.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-wrapper">
      <input
        type="text"
        placeholder="Search shows..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      <div className="shows-grid">
        {filteredShows.map((show) => (
          <div className="show-card" key={show.id}>
            <img
              src={show.image_thumbnail_path}
              alt={show.name}
              className="show-image-placeholder"
              style={{
                width: "120px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "6px",
                background: "#eee",
              }}
            />
            <div className="show-info">
              <div>{show.name}</div>
              <div>Start: {show.start_date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Content;
