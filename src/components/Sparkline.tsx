"use client";
import React from "react";

export default function Sparkline({ values, width = 120, height = 36 }: { values: number[]; width?: number; height?: number }) {
  if (!values?.length) return <div className="text-xs opacity-40">—</div>;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1, step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / span) * height}`).join(" ");
  const up = values.at(-1)! >= values[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={up ? "#4ADE80" : "#F87171"} strokeWidth="2" />
    </svg>
  );
}
