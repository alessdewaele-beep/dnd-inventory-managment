// Default icon (emoji) per item type, shown when an item does not (yet) have
// its own photo. PrimeIcons has no fantasy glyphs (sword, potion, ...),
// hence an emoji: covers all types without extra assets. Robust against the
// compound types ("weapon melee", "armor heavy", ...).
export function typeIcon(type) {
  if (!type) return "📦";
  const t = String(type).toLowerCase();
  if (t.startsWith("weapon")) return t.includes("ranged") ? "🏹" : "⚔️";
  if (t.startsWith("armor")) return "🛡️";
  if (t === "potion") return "🧪";
  if (t === "jewelry") return "💍";
  return "📦"; // misc / unknown
}
