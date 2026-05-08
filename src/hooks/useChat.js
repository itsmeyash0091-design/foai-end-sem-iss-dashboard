import { useState, useCallback } from 'react';

const CHAT_KEY = 'iss_chat_history';
const MAX_MESSAGES = 30;
const HF_TOKEN = import.meta.env.VITE_AI_TOKEN;
const MODEL_URL = '/api/chat/completions';
const MODEL_NAME = 'mistralai/Mistral-7B-Instruct-v0.2';

const SYSTEM_PROMPT = `You are a professional ISS Mission Control AI Assistant. 
Use the following context to answer questions. 
CONTEXT:
- Use only provided ISS coordinates, speed, and astronaut lists.
- Use only the provided space news summaries.
- If information is missing, say "I don't have that live data yet."
- Do NOT use external knowledge.
- Keep answers professional and concise.`;

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
      // Using OpenAI-compatible endpoint as requested
      const res = await fetch(MODEL_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: `Current Dashboard Context: ${contextStr}` },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userText }
          ],
          max_tokens: 250,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Service Error: ${res.status}`);
      }

      const data = await res.json();
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
      const aiMsg = { 
        role: 'assistant', 
        content: `⚠️ Mission Control Error: ${err.message}.`,
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
