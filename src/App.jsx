import { Suspense, lazy } from 'react';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';

import Header from './components/Header';
import ISSTracker from './components/ISSTracker';
import AstronautPanel from './components/AstronautPanel';
import NewsDashboard from './components/NewsDashboard';
import Chatbot from './components/Chatbot';
import ToastContainer from './components/ToastContainer';
import { SpeedChart, NewsChart } from './components/Charts';
import ISSMap from './components/ISSMap';

import { Satellite, Newspaper, BarChart2, Users, Globe2, AlertTriangle } from 'lucide-react';

function SectionHeader({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-space-500/10 border border-space-500/20 flex items-center justify-center">
          <Icon size={16} className="text-space-400" />
        </div>
        <h2 className="section-title">{title}</h2>
      </div>
      {badge && (
        <div className="flex items-center gap-1.5">
          <div className="live-dot" />
          <span className="text-xs text-emerald-500 font-semibold">{badge}</span>
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
      <AlertTriangle size={15} />
      <span>{message}</span>
    </div>
  );
}

export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  const iss = useISS();
  const news = useNews();
  const chat = useChat();

  const handleRefreshNews = async () => {
    await news.refresh();
    addToast('News refreshed successfully!', 'success');
  };

  const handleSendChat = (text) => {
    chat.sendMessage(text, {
      position: iss.position,
      location: iss.location,
      speed: iss.speed,
      astronauts: iss.astronauts,
      articles: news.allArticles,
    });
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] transition-colors duration-300`}>
      {/* Cosmic background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-space-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        searchTerm={news.searchTerm}
        onSearch={news.setSearchTerm}
        sortBy={news.sortBy}
        onSortBy={news.setSortBy}
        onRefreshNews={handleRefreshNews}
        newsLoading={news.loading}
        issError={!!iss.error}
      />

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ISS Error banner */}
        {iss.error && <ErrorBanner message={iss.error} />}

        {/* Hero Stats */}
        <section>
          <SectionHeader icon={Satellite} title="ISS Live Tracker" badge="15s refresh" />
          <ISSTracker
            position={iss.position}
            speed={iss.speed}
            location={iss.location}
            astronauts={iss.astronauts}
            loading={iss.loading}
          />
        </section>

        {/* Map + Astronauts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <SectionHeader icon={Globe2} title="Live Orbit Map" badge="Tracking" />
            <div className="card p-3 h-[400px]">
              {iss.loading ? (
                <div className="skeleton w-full h-full rounded-xl" />
              ) : (
                <ISSMap position={iss.position} positions={iss.positions} />
              )}
            </div>
          </div>

          {/* Astronauts */}
          <div>
            <SectionHeader icon={Users} title="Crew in Space" />
            <div className="card p-4 h-[400px] overflow-y-auto scrollbar-thin">
              <AstronautPanel astronauts={iss.astronauts} loading={iss.loading} />
            </div>
          </div>
        </section>

        {/* Charts */}
        <section>
          <SectionHeader icon={BarChart2} title="Mission Analytics" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5">
              <SpeedChart speedHistory={iss.speedHistory} loading={iss.loading && iss.speedHistory.length === 0} />
            </div>
            <div className="card p-5">
              <NewsChart articles={news.allArticles} loading={news.loading} />
            </div>
          </div>
        </section>

        {/* News */}
        <section>
          <SectionHeader icon={Newspaper} title="Space & Science News" />
          {news.lastUpdated && (
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Last updated: {news.lastUpdated.toLocaleTimeString()} · Cached for 15 min
            </p>
          )}
          <NewsDashboard
            articles={news.articles}
            loading={news.loading}
            error={news.error}
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)]">
          <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">🛸 ISS Mission Control Dashboard</p>
          <p>Real-time ISS tracking · Space news · AI assistant powered by Mistral-7B</p>
          <p className="mt-1 opacity-60">Data: Open Notify API · NewsAPI.org · HuggingFace</p>
        </footer>
      </main>

      {/* Floating Chatbot */}
      <Chatbot
        messages={chat.messages}
        loading={chat.loading}
        isOpen={chat.isOpen}
        setIsOpen={chat.setIsOpen}
        onSend={handleSendChat}
        onClear={chat.clearChat}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
