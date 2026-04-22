import { getValidToken, refreshAccessToken, logout } from './spotify';

const BASE = 'https://api.spotify.com/v1';

export class SpotifyApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'SpotifyApiError';
    this.status = status;
  }
}

async function fetchSpotify(endpoint, options = {}, retry = true) {
  const token = await getValidToken();
  if (!token) {
    window.location.href = '/';
    throw new SpotifyApiError('No token', 401);
  }

  const hasBody = options.body !== undefined;
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(hasBody && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed?.access_token) {
      return fetchSpotify(endpoint, options, false);
    }
    logout();
    window.location.href = '/';
    throw new SpotifyApiError('Session expired', 401);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new SpotifyApiError(
      err.error?.message || `Spotify API error ${res.status}`,
      res.status
    );
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

export async function getPlaylistTracks(id, limit = 100, offset = 0) {
  return fetchSpotify(
    `/playlists/${id}/tracks?limit=${parseInt(limit, 10)}&offset=${parseInt(offset, 10)}`
  );
}

export async function getAllPlaylistTracks(id) {
  const PAGE = 100;
  const first = await getPlaylistTracks(id, PAGE, 0);
  let allItems = first?.items || [];
  let offset = PAGE;

  try {
    while (first?.next && allItems.length === offset) {
      const page = await getPlaylistTracks(id, PAGE, offset);
      const items = page?.items || [];
      allItems = allItems.concat(items);
      if (!page?.next || items.length < PAGE) break;
      offset += PAGE;
    }
  } catch {
    return allItems;
  }

  return allItems;
}

export async function searchTracks(query, limit = 10) {
  return fetchSpotify(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=${parseInt(limit, 10)}`
  );
}

export async function searchArtistTrack(artist, track) {
  return fetchSpotify(
    `/search?q=${encodeURIComponent(`artist:${artist} track:${track}`)}&type=track&limit=1`
  );
}

export async function getUserTopTracks(limit = 10) {
  return fetchSpotify(`/me/top/tracks?limit=${parseInt(limit, 10)}&time_range=short_term`);
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
