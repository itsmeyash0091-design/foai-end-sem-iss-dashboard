import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { calculateSpeed } from '../utils/helpers';

// API Configuration
const ISS_PROXY = '/api/iss/iss-now.json';
const ISS_DIRECT = 'https://api.wheretheiss.at/v1/satellites/25544';
const ASTROS_PROXY = '/api/iss/astros.json';
const ASTROS_DIRECT = 'https://corsproxy.io/?' + encodeURIComponent('http://api.open-notify.org/astros.json');

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
      // Try proxy first, then direct
      let res;
      try {
        res = await axios.get(ASTROS_PROXY, { timeout: 5000 });
      } catch {
        res = await axios.get(ASTROS_DIRECT, { timeout: 5000 });
      }
      if (res.data && res.data.people) {
        setAstronauts(res.data.people);
      }
    } catch (err) {
      console.warn('All astronaut sources failed');
    }
  }, []);

  const fetchISS = useCallback(async () => {
    let data = null;
    let isWhereTheIss = false;

    try {
      // Try 1: OpenNotify via Proxy (User's request)
      try {
        const res = await axios.get(ISS_PROXY, { timeout: 8000 });
        data = res.data;
      } catch (err) {
        console.warn('Proxy failed, falling back to direct WhereTheISS.at...');
        // Try 2: WhereTheISS.at Direct (Fallback for reliability)
        const res = await axios.get(ISS_DIRECT, { timeout: 8000 });
        data = res.data;
        isWhereTheIss = true;
      }

      if (!data) throw new Error('No data received');

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
    } catch (err) {
      console.error('ISS Fetch Failure:', err.message);
      if (!position) setError('Failed to connect to Mission Control. Please check your internet.');
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    fetchAstronauts();
    fetchISS();
    
    // Safety: ensure loading state is cleared even if network hangs
    const safetyTimer = setTimeout(() => setLoading(false), 10000);
    
    const interval = setInterval(fetchISS, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, [fetchISS, fetchAstronauts]);

  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    const geocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lon}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (cancelled) return;
        if (res.ok) {
          const d = await res.json();
          const addr = d.address;
          const city = addr.city || addr.town || addr.village || addr.county || addr.state || addr.country;
          setLocation(city ? `Near ${city}` : 'Over Ocean');
        }
      } catch {
        if (!cancelled) setLocation('Over Ocean');
      }
    };
    geocode();
    return () => { cancelled = true; };
  }, [position]);

  return { position, positions, speed, speedHistory, astronauts, location, loading, error };
}
