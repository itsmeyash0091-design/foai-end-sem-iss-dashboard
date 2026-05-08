import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp as IconTrendingUp, PieChart as IconPieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
);

function SkeletonChart() {
  return <div className="skeleton h-48 w-full rounded-xl" />;
}

export function SpeedChart({ speedHistory, loading }) {
  if (loading) return <SkeletonChart />;
  if (speedHistory.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center text-[var(--text-secondary)] text-xs border border-dashed border-[var(--border-color)] rounded-xl">
        <IconTrendingUp size={24} className="mb-2 opacity-20" />
        Waiting for telemetry data...
      </div>
    );
  }

  const data = {
    labels: speedHistory.map(s => s.time),
    datasets: [
      {
        label: 'Speed (km/h)',
        data: speedHistory.map(s => s.speed),
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99,102,241,0.12)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#312e81',
        pointBorderWidth: 1.5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f1629',
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        borderColor: '#1e2d4a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 6 },
        grid: { color: 'rgba(30,45,74,0.3)' },
      },
      y: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: 'rgba(30,45,74,0.3)' },
        min: 25000,
        max: 30000,
      },
    },
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <IconTrendingUp size={16} className="text-space-400" />
        <span className="text-sm font-semibold text-[var(--text-secondary)]">Live Speed Analytics</span>
      </div>
      <div style={{ height: '200px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export function NewsChart({ articles, loading }) {
  if (loading) return <SkeletonChart />;
  if (articles.length === 0) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center text-[var(--text-secondary)] text-xs border border-dashed border-[var(--border-color)] rounded-xl">
        <IconPieChart size={24} className="mb-2 opacity-20" />
        No news data for analysis
      </div>
    );
  }

  const categoryCount = articles.reduce((acc, a) => {
    // Normalize category name
    let cat = (a.category || 'other').toLowerCase();
    cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(categoryCount);
  const values = Object.values(categoryCount);

  const colorMap = {
    Science: '#818cf8',
    Technology: '#34d399',
    Space: '#f472b6',
    General: '#fb923c',
    Business: '#60a5fa',
    Sports: '#f87171',
    Other: '#94a3b8',
  };

  const backgroundColors = labels.map(l => colorMap[l] || colorMap.Other);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors.map(c => c + '33'),
        borderColor: backgroundColors,
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: '#0f1629',
        borderWidth: 1,
        borderColor: '#1e2d4a',
      }
    },
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <IconPieChart size={16} className="text-emerald-400" />
        <span className="text-sm font-semibold text-[var(--text-secondary)]">News Content Mix</span>
      </div>
      <div style={{ height: '220px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
