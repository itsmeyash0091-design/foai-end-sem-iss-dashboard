import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { calculateSpeed } from '../utils/helpers';

// Production-ready API endpoints
const ISS_PROXY = '/api/iss/iss-now.json';
const ISS_BACKUP = 'https://api.wheretheiss.at/v1/satellites/25544';
// AllOrigins is generally more reliable for Vercel production than corsproxy.io
const ASTROS_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent('http://api.open-notify.org/astros.json')}`;

const POLL_INTERVAL = 15000;

export function useISS() {
  const [position, setPosition] = useState(null);
  const [positions, setPositions] = useState([]);
  const [speed, setSpeed] = useState(27600);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astronauts, setAstronauts] = useState([]);
  const [location, setLocation] = useState('Calculating…');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevPosition = useRef(null);
  const prevTimestamp = useRef(null);

  const fetchAstronauts = useCallback(async () => {
    try {
      const { data } = await axios.get(ASTROS_URL, { timeout: 10000 });
      if (data && data.people) {
        setAstronauts(data.people);
      }
    } catch (err) {
      console.warn('Astronauts fetch failed:', err.message);
    }
  }, []);

  const fetchISS = useCallback(async () => {
    let success = false;
    let data = null;
    let isWhereTheIss = false;

    // Strategy 1: Try requested OpenNotify via Proxy (Works in Dev and via vercel.json)
    try {
      const res = await axios.get(ISS_PROXY, { timeout: 8000 });
      data = res.data;
      success = true;
    } catch (err) {
      console.warn('ISS Proxy failed, attempting direct backup...');
      // Strategy 2: Direct WhereTheISS.at (Most reliable for production HTTPS)
      try {
        const res = await axios.get(ISS_BACKUP, { timeout: 8000 });
        data = res.data;
        isWhereTheIss = true;
        success = true;
      } catch (err2) {
        console.error('All ISS sources failed');
      }
    }

    if (success && data) {
      let lat, lon, ts, vel;
      if (isWhereTheIss) {
        lat = parseFloat(data.latitude);
        lon = parseFloat(data.longitude);
        ts = data.timestamp;
        vel = Math.round(data.velocity || 27600);
      } else {
        lat = parseFloat(data.iss_position.latitude);
        lon = parseFloat(data.iss_position.longitude);
        ts = data.timestamp;
        vel = 27600;
      }

      const newPos = { lat, lon, timestamp: ts };

      if (prevPosition.current && prevTimestamp.current) {
        const timeDelta = ts - prevTimestamp.current;
        if (timeDelta > 0) {
          const calculatedSpd = calculateSpeed(prevPosition.current, newPos, timeDelta);
          setSpeed(calculatedSpd);
          setSpeedHistory(prev => [...prev, { 
            time: new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            speed: calculatedSpd 
          }].slice(-30));
        }
      } else {
        setSpeed(vel);
        setSpeedHistory([{ 
          time: new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          speed: vel 
        }]);
      }

      prevPosition.current = newPos;
      prevTimestamp.current = ts;
      setPosition(newPos);
      setPositions(prev => [...prev, newPos].slice(-15));
      setError(null);
    } else if (!position) {
      setError('Mission telemetry delayed. Check your internet connection.');
    }
    
    setLoading(false);
  }, [position]);

  useEffect(() => {
    fetchAstronauts();
    fetchISS();
    const interval = setInterval(fetchISS, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchISS, fetchAstronauts]);

  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    const geocode = async () => {
      try {
        // Use BigDataCloud's free client-side API - more reliable for CORS and rate limits than Nominatim
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.lat}&longitude=${position.lon}&localityLanguage=en`
        );
        if (cancelled) return;
        
        if (res.ok) {
          const d = await res.json();
          // Extract city or most relevant locality info
          const city = d.city || d.locality || d.principalSubdivision || d.countryName;
          setLocation(city ? `Near ${city}` : 'Over Ocean');
        } else if (res.status === 429) {
          console.warn('Geocoding rate limited, skipping update');
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Geocoding failed:', err.message);
          setLocation('Over Ocean');
        }
      }
    };
    geocode();
    return () => { cancelled = true; };
  }, [position]);

  return { position, positions, speed, speedHistory, astronauts, location, loading, error };
}
