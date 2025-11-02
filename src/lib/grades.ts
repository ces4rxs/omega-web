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
      return { color: "text-emerald-300", label: "Quantum Grade A", hint: "📈 Estrategia muy consistente y eficiente." };
    case "B":
      return { color: "text-amber-300", label: "Strategic Grade B", hint: "🧪 Estrategia sólida; vigila drawdown y filtros adaptativos." };
    default:
      return { color: "text-rose-300", label: "Experimental Grade C", hint: "⚠️ Inestabilidad detectada; revisar parámetros." };
  }
}
