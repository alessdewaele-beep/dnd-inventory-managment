// Standaard-icoon (emoji) per itemtype, getoond wanneer een item (nog) geen
// eigen foto heeft. PrimeIcons bevat geen fantasy-glyphs (zwaard, drankje, ...),
// daarom een emoji: dekt alle types zonder extra assets. Robuust tegen de
// samengestelde types ("weapon melee", "armor heavy", ...).
export function typeIcon(type) {
  if (!type) return "📦";
  const t = String(type).toLowerCase();
  if (t.startsWith("weapon")) return t.includes("ranged") ? "🏹" : "⚔️";
  if (t.startsWith("armor")) return "🛡️";
  if (t === "potion") return "🧪";
  if (t === "jewelry") return "💍";
  return "📦"; // misc / onbekend
}
