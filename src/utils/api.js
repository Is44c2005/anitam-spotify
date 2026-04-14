import { getValidToken } from './spotify';

const BASE = 'https://api.spotify.com/v1';

async function fetchSpotify(endpoint, options = {}) {
  const token = await getValidToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Spotify API error ${res.status}`);
  }
  return res.json();
}

export async function getCurrentUser() {
  return fetchSpotify('/me');
}

export async function getUserPlaylists(limit = 50) {
  return fetchSpotify(`/me/playlists?limit=${limit}`);
}

export async function getPlaylist(id) {
  return fetchSpotify(`/playlists/${id}`);
}

export async function getPlaylistTracks(id, limit = 100) {
  return fetchSpotify(`/playlists/${id}/tracks?limit=${parseInt(limit, 10)}`);
}

export async function searchTracks(query, limit = 10) {
  return fetchSpotify(`/search?q=${encodeURIComponent(query)}&type=track&limit=${parseInt(limit, 10)}`);
}

export async function searchArtistTrack(artist, track) {
  return fetchSpotify(
    `/search?q=${encodeURIComponent(`artist:${artist} track:${track}`)}&type=track&limit=1`
  );
}

export async function getUserTopTracks(limit = 10) {
  return fetchSpotify(`/me/top/tracks?limit=${limit}&time_range=short_term`);
}

export async function createPlaylist(userId, name, description = '') {
  return fetchSpotify(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name, description, public: false }),
  });
}

export async function addTracksToPlaylist(playlistId, uris) {
  return fetchSpotify(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ uris }),
  });
}

export async function removeTracksFromPlaylist(playlistId, uris) {
  return fetchSpotify(`/playlists/${playlistId}/tracks`, {
    method: 'DELETE',
    body: JSON.stringify({ tracks: uris.map((uri) => ({ uri })) }),
  });
}
