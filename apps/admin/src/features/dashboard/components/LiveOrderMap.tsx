import { useState } from 'react';
import { ORDER_CLUSTERS } from '../mockData';

// HCMC simplified district outline as SVG path segments
// Approximate bounding box normalized to 0-1 space
const DISTRICT_PATHS = [
  // Outer metro boundary (simplified polygon)
  'M 0.22,0.18 L 0.78,0.18 L 0.88,0.32 L 0.82,0.55 L 0.75,0.72 L 0.62,0.88 L 0.42,0.88 L 0.28,0.78 L 0.18,0.62 L 0.15,0.42 L 0.18,0.28 Z',
  // Thu Duc / eastern area
  'M 0.68,0.18 L 0.88,0.18 L 0.88,0.32 L 0.82,0.48 L 0.72,0.42 L 0.68,0.28 Z',
  // Southern districts
  'M 0.42,0.72 L 0.62,0.72 L 0.65,0.88 L 0.42,0.88 Z',
];

export function LiveOrderMap() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-[#0f1a14] border border-white/5">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4ade80" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)" />
      </svg>

      {/* District outlines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="xMidYMid meet"
      >
        {DISTRICT_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="rgba(13,99,27,0.06)"
            stroke="rgba(13,99,27,0.25)"
            strokeWidth="0.005"
          />
        ))}

        {/* River (simplified Saigon river path) */}
        <path
          d="M 0.60,0.18 Q 0.58,0.34 0.56,0.44 Q 0.54,0.54 0.55,0.65 Q 0.56,0.75 0.58,0.88"
          fill="none"
          stroke="rgba(56,189,248,0.25)"
          strokeWidth="0.012"
          strokeLinecap="round"
        />

        {/* Order density clusters */}
        {ORDER_CLUSTERS.map((cluster) => {
          const isHovered = hovered === cluster.id;
          const baseR = 0.015 + cluster.density * 0.03;
          return (
            <g key={cluster.id}>
              {/* Pulse ring */}
              <circle
                cx={cluster.x}
                cy={cluster.y}
                r={baseR * 1.8}
                fill="rgba(13,99,27,0.08)"
                className="animate-ping"
                style={{ animationDuration: `${2 + cluster.density}s` }}
              />
              {/* Main dot */}
              <circle
                cx={cluster.x}
                cy={cluster.y}
                r={baseR}
                fill={`rgba(13,99,27,${0.4 + cluster.density * 0.5})`}
                stroke={isHovered ? '#88d982' : 'rgba(138,215,130,0.4)'}
                strokeWidth={isHovered ? 0.006 : 0.003}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHovered(cluster.id)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (() => {
        const c = ORDER_CLUSTERS.find((cl) => cl.id === hovered);
        if (!c) return null;
        return (
          <div
            className="absolute pointer-events-none z-10 px-2.5 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-lg text-xs"
            style={{
              left: `calc(${c.x * 100}% + 12px)`,
              top: `calc(${c.y * 100}% - 20px)`,
            }}
          >
            <p className="font-semibold text-on-surface">{c.label}</p>
            <p className="font-mono text-on-surface-variant">{c.orders} orders</p>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
          <span className="w-2 h-2 rounded-full bg-primary/80 inline-block" />
          High density
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
          <span className="w-2 h-2 rounded-full bg-primary/30 inline-block" />
          Low density
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
          <span className="w-2 h-2 rounded-full bg-sky-400/30 inline-block" />
          River
        </span>
      </div>

      {/* City label */}
      <div className="absolute top-3 right-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        Ho Chi Minh City
      </div>
    </div>
  );
}
