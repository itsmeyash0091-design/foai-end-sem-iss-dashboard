import { Users, Rocket } from 'lucide-react';

const CRAFT_COLORS = {
  ISS: 'bg-space-500/10 text-space-400 border-space-500/20',
  Shenzhou: 'bg-red-500/10 text-red-400 border-red-500/20',
  Tiangong: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const AVATAR_COLORS = [
  'from-space-500 to-space-700',
  'from-emerald-500 to-emerald-700',
  'from-pink-500 to-pink-700',
  'from-amber-500 to-amber-700',
  'from-sky-500 to-sky-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
];

export default function AstronautPanel({ astronauts, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!astronauts.length) {
    return (
      <div className="text-center py-6 text-[var(--text-secondary)] text-sm">
        No astronaut data available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--text-secondary)] font-medium">
          {astronauts.length} humans currently in space
        </span>
      </div>
      {astronauts.map((astro, i) => {
        const initials = astro.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const gradClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const craftColor = CRAFT_COLORS[astro.craft] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

        return (
          <div
            key={astro.name}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/3 transition-colors animate-fade-in group"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{astro.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Rocket size={9} className="text-[var(--text-secondary)]" />
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${craftColor}`}>
                  {astro.craft}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
