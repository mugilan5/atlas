export function formatSimulationTime(startTime: string, minute: number) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const total = hours * 60 + minutes + minute;
  const hour24 = Math.floor(total / 60) % 24;
  const min = total % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${suffix}`;
}

export function riskLabel(score: number) {
  if (score >= 75) return "HIGH RISK";
  if (score >= 50) return "ELEVATED";
  return "CONTROLLED";
}

export function metricClass(value: number, warning: number, danger: number) {
  if (value >= danger) return "danger";
  if (value >= warning) return "warning";
  return "safe";
}
