// Haversine formula to calculate speed between two positions
export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  if (!pos1 || !pos2 || timeDiffSeconds <= 0) return 27600; // ISS avg speed fallback
  
  const R = 6371; // Earth's radius in km 
  const toRad = (deg) => deg * (Math.PI / 180);
  
  // Handling both 'lng' and 'lon' for flexibility
  const lon1 = pos1.lng !== undefined ? pos1.lng : pos1.lon;
  const lon2 = pos2.lng !== undefined ? pos2.lng : pos2.lon;
  
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(lon2 - lon1); 
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // distance in km 
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  
  return Math.round(speedKmh);
}

// Format timestamp
export function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Format date
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Truncate text
export function truncate(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// Reverse geocode using Open-Meteo / nominatim free API
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return 'Unknown Location';
    const data = await res.json();
    if (data.error) return 'Over Ocean';
    const addr = data.address;
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state ||
      addr.country;
    return city ? `Near ${city}` : 'Over Ocean';
  } catch {
    return 'Over Ocean';
  }
}

// LocalStorage helpers with expiry
export function setCached(key, value, ttlMs) {
  const entry = { value, expiry: Date.now() + ttlMs };
  localStorage.setItem(key, JSON.stringify(entry));
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}
