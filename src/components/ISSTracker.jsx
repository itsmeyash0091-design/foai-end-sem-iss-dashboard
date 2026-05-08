import { Satellite, Zap, MapPin, Users, Clock } from 'lucide-react';
import { formatTime } from '../utils/helpers';

function SkeletonStat() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-8 w-32 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, live }) {
  return (
    <div className="card p-5 flex flex-col gap-2 hover:border-space-500/40 transition-all duration-300 group hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon size={18} className={color} />
        </div>
        {live && (
          <div className="flex items-center gap-1.5">
            <div className="live-dot" />
            <span className="text-xs text-emerald-500 font-semibold">LIVE</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold font-mono text-[var(--text-primary)] group-hover:text-space-400 transition-colors">
        {value}
      </div>
      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-[var(--text-secondary)] truncate">{sub}</div>}
    </div>
  );
}

export default function ISSTracker({ position, speed, location, astronauts, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
      </div>
    );
  }

  const issAstronauts = astronauts.filter(a => a.craft === 'ISS');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Satellite}
        label="ISS Position"
        value={position ? `${position.lat.toFixed(2)}°, ${position.lon.toFixed(2)}°` : '—'}
        sub={location}
        color="text-space-400"
        live={!!position}
      />
      <StatCard
        icon={Zap}
        label="Speed"
        value={`${speed.toLocaleString()} km/h`}
        sub="~7.66 km/s orbital"
        color="text-amber-400"
      />
      <StatCard
        icon={MapPin}
        label="Over"
        value={location || '—'}
        sub={`Updated: ${position ? formatTime(position.timestamp) : '—'}`}
        color="text-emerald-400"
      />
      <StatCard
        icon={Users}
        label="Crew on ISS"
        value={issAstronauts.length || astronauts.length}
        sub={issAstronauts.slice(0, 2).map(a => a.name).join(', ') || 'Loading crew…'}
        color="text-pink-400"
      />
    </div>
  );
}
