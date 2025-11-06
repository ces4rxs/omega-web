export type NeuralGrade = "A" | "B" | "C";

export function gradeFrom(sharpe?: number, winRate?: number): NeuralGrade {
  if (!sharpe || !winRate) return "C";
  if (sharpe >= 1.5 && winRate >= 0.6) return "A";
  if (sharpe >= 1.0) return "B";
  return "C";
}

export function gradeInfo(grade: NeuralGrade) {
  switch (grade) {
    case "A":
      return {
        color: "text-emerald-300",
        label: "Quantum Grade A",
        hint: "📈 Estrategia muy consistente y eficiente.",
        bg: "from-emerald-950/40 to-cyan-950/30",
        ring: "ring-emerald-400/20",
        text: "text-emerald-400",
      };
    case "B":
      return {
        color: "text-amber-300",
        label: "Strategic Grade B",
        hint: "🧪 Estrategia sólida; vigila drawdown y filtros adaptativos.",
        bg: "from-amber-950/40 to-orange-950/30",
        ring: "ring-amber-400/20",
        text: "text-amber-400",
      };
    default:
      return {
        color: "text-rose-300",
        label: "Experimental Grade C",
        hint: "⚠️ Inestabilidad detectada; revisar parámetros.",
        bg: "from-rose-950/40 to-fuchsia-950/30",
        ring: "ring-rose-400/20",
        text: "text-rose-400",
      };
  }
}
