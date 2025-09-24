// Simple in-memory cache for all TVmaze shows
// WARNING: This cache is cleared on server restart. For production, use Redis or a DB.
let cachedShows = null;
let lastFetched = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchAllTvmazeShows() {
  let allShows = [];
  for (let page = 0; page < 16; page++) {
    const response = await fetch(`https://api.tvmaze.com/shows?page=${page}`);
    const shows = await response.json();
    if (!Array.isArray(shows) || shows.length === 0) break;
    allShows = allShows.concat(shows);
  }
  return allShows;
}

async function getCachedTvmazeShows(fetch) {
  const now = Date.now();
  if (!cachedShows || now - lastFetched > CACHE_TTL) {
    cachedShows = await fetchAllTvmazeShows(fetch);
    lastFetched = now;
  }
  return cachedShows;
}

module.exports = { getCachedTvmazeShows };
