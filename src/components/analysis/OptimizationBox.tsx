"use client";

interface OptimizationBoxProps {
  startPercent?: number;
  endPercent?: number;
  ftOptimal?: string;
}

export function OptimizationBox({
  startPercent = 20,
  endPercent = 70,
  ftOptimal = "0/3",
}: OptimizationBoxProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <svg className="h-full w-full" style={{ overflow: "visible" }}>
        <defs>
          <pattern
            id="optimizationPattern"
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="transparent" />
          </pattern>
        </defs>

        <rect
          x={`${startPercent}%`}
          y="20%"
          width={`${endPercent - startPercent}%`}
          height="60%"
          fill="rgba(251, 191, 36, 0.1)"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeDasharray="8 4"
          rx="8"
        />

        <text
          x={`${startPercent + (endPercent - startPercent) / 2}%`}
          y="18%"
          textAnchor="middle"
          className="text-xs font-semibold"
          fill="#fbbf24"
        >
          FT Óptimo: {ftOptimal}
        </text>
      </svg>
    </div>
  );
}
