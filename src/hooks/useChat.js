import { useState, useCallback } from 'react';
import axios from 'axios';

const CHAT_KEY = 'iss_chat_history';
const MAX_MESSAGES = 30;
const HF_TOKEN = import.meta.env.VITE_AI_TOKEN;
const MODEL_NAME = 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai';
const MODEL_URL = '/api/chat/v1/chat/completions';

const SYSTEM_PROMPT = `You are the ISS Mission Control AI Assistant. Your goal is to provide accurate, real-time information about the International Space Station and space news.
GUIDELINES:
1. Use the provided LIVE DASHBOARD DATA for all telemetry questions (position, speed, location).
2. Use the provided LATEST SPACE NEWS for current events.
3. If data is unavailable, state: "I am currently re-establishing a data link for that information."
4. Be professional, concise, and space-themed.
5. Do NOT hallucinate data or use external knowledge beyond the provided context.`;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(msgs) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-MAX_MESSAGES)));
}

export function useChat() {
  const [messages, setMessages] = useState(loadHistory);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = useCallback(async (userText, context) => {
    const userMsg = { role: 'user', content: userText, ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(updated);
    setLoading(true);

    const contextStr = `
LIVE DASHBOARD DATA:
ISS Position: Lat ${context.position?.lat?.toFixed(4) || 'N/A'}, Lon ${context.position?.lon?.toFixed(4) || 'N/A'}
Current Location: ${context.location || 'Over Ocean'}
Velocity: ${context.speed || '27600'} km/h
Astronauts on ISS: ${(context.astronauts || []).map(a => a.name).join(', ') || 'No data'}

LATEST SPACE NEWS:
${(context.articles || []).slice(0, 5).map((a, i) => `${i + 1}. ${a.title}`).join('\n')}
`;

    try {
      // Using axios for more robust requests and better error reporting
      const { data } = await axios.post(MODEL_URL, {
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `Current Dashboard Context: ${contextStr}` },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userText }
        ],
        max_tokens: 250,
        temperature: 0.7,
      }, {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });

      const aiText = data.choices?.[0]?.message?.content || "I'm sorry, I am currently unable to process your request.";

      const aiMsg = { 
        role: 'assistant', 
        content: aiText.trim(),
        ts: Date.now() 
      };
      
      const final = [...updated, aiMsg];
      setMessages(final);
      saveHistory(final);
    } catch (err) {
      console.error('Chat AI Error:', err);
      const errMsg = err.response?.data?.error?.message || err.message;
      const aiMsg = { 
        role: 'assistant', 
        content: `⚠️ Mission Control Error: ${errMsg}.`,
        ts: Date.now(),
        isError: true
      };
      const final = [...updated, aiMsg];
      setMessages(final);
      saveHistory(final);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_KEY);
  }, []);

  return { messages, loading, isOpen, setIsOpen, sendMessage, clearChat };
}
