import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setCached, getCached } from '../utils/helpers';

const NEWS_TTL = 15 * 60 * 1000;
const CACHE_KEY = 'iss_news_cache';
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const fetchNews = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached(CACHE_KEY);
      if (cached) {
        setArticles(cached);
        setLoading(false);
        setLastUpdated(new Date());
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Primary: TheNewsAPI.com (Valid key found!)
      const { data } = await axios.get('https://api.thenewsapi.com/v1/news/all', {
        params: {
          api_token: API_KEY,
          search: 'space NASA ISS astronomy',
          language: 'en',
          limit: 10,
        },
        timeout: 8000
      });

      if (data.data && data.data.length > 0) {
        const mapped = data.data.map(a => ({
          title: a.title,
          description: a.description,
          url: a.url,
          urlToImage: a.image_url,
          author: a.source,
          publishedAt: a.published_at,
          source: { name: a.source },
          category: (a.categories && a.categories[0]) || 'science',
        }));
        
        setArticles(mapped);
        setCached(CACHE_KEY, mapped, NEWS_TTL);
        setError(null);
      } else {
        throw new Error('No news data returned from TheNewsAPI');
      }
    } catch (err) {
      console.warn('TheNewsAPI failed, trying fallbacks...', err.message);
      
      // Fallback 1: NewsAPI.org
      try {
        const res = await axios.get('https://newsapi.org/v2/everything', {
          params: { apiKey: API_KEY, q: 'space NASA', language: 'en', pageSize: 10 },
          timeout: 5000
        });
        if (res.data.articles) {
          const mapped = res.data.articles.map(a => ({ ...a, category: 'science' }));
          setArticles(mapped);
          setCached(CACHE_KEY, mapped, NEWS_TTL);
          setError(null);
        }
      } catch (err2) {
        // Fallback 2: Currents
        try {
          const res = await axios.get('https://api.currentsapi.services/v1/search', {
            params: { apiKey: API_KEY, keywords: 'space NASA', language: 'en' },
            timeout: 5000
          });
          if (res.data.news) {
            const mapped = res.data.news.map(a => ({
              title: a.title,
              description: a.description,
              url: a.url,
              urlToImage: a.image !== 'None' ? a.image : null,
              author: a.author,
              publishedAt: a.published,
              source: { name: 'Currents' },
              category: 'science'
            }));
            setArticles(mapped);
            setCached(CACHE_KEY, mapped, NEWS_TTL);
            setError(null);
          }
        } catch (err3) {
          setError('Live news currently unavailable. Verify API keys or check network.');
        }
      }
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filtered = articles
    .filter(a => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sortBy === 'source') return (a.source?.name || '').localeCompare(b.source?.name || '');
      return 0;
    });

  return {
    articles: filtered,
    allArticles: articles,
    loading,
    error,
    lastUpdated,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    refresh: () => fetchNews(true),
  };
}
