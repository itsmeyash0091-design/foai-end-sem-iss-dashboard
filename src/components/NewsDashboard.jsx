import { ExternalLink, Calendar, User, Tag } from 'lucide-react';
import { formatDate, truncate } from '../utils/helpers';

const CATEGORY_COLORS = {
  science: 'bg-space-500/10 text-space-400 border-space-500/20',
  technology: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  space: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  other: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function SkeletonCard() {
  return (
    <div className="card p-4 flex gap-4">
      <div className="skeleton w-24 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

function NewsCard({ article }) {
  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.other;

  return (
    <div className="card p-4 flex gap-4 hover:border-space-500/40 transition-all duration-300 hover:-translate-y-0.5 group animate-fade-in">
      {/* Image */}
      <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-cosmic-border">
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🚀</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`stat-badge border ${catColor} text-[10px]`}>
            <Tag size={9} />
            {article.category?.toUpperCase()}
          </span>
          {article.source?.name && (
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">
              {article.source.name}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-space-400 transition-colors">
          {article.title}
        </h3>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 hidden sm:block">
          {truncate(article.description, 100)}
        </p>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
            {article.author && (
              <span className="flex items-center gap-1">
                <User size={9} /> {truncate(article.author, 25)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={9} /> {formatDate(article.publishedAt)}
            </span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-semibold text-space-400 hover:text-space-300 transition-colors"
          >
            Read More <ExternalLink size={9} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function NewsDashboard({ articles, loading, error }) {
  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-3">📡</div>
        <div className="text-[var(--text-secondary)] text-sm">{error}</div>
        <div className="text-xs text-[var(--text-secondary)] mt-1">Check your NewsAPI key in .env</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <div className="text-[var(--text-secondary)] text-sm">No articles found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article, i) => (
        <NewsCard key={`${article.url}-${i}`} article={article} />
      ))}
    </div>
  );
}
