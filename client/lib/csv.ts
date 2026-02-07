import type { ColumnDefModel, ColumnDataType, PokemonRow } from "@/types/pokemon";

export function coerceValue(type: ColumnDataType, raw: unknown) {
  const v = raw ?? "";
  if (type === "number") return Number.isFinite(Number(v)) ? Number(v) : 0;
  if (type === "boolean") {
    const s = String(v).toLowerCase().trim();
    return s === "true" || s === "1" || s === "yes";
  }
  return String(v);
}

export function exportRowsToCSV(rows: PokemonRow[], columns: ColumnDefModel[]) {
  const headers = columns.map((c) => c.key);
  const lines: string[] = [];
  lines.push(headers.join(","));

  for (const r of rows) {
    const row = headers.map((k) => {
      const cell = r[k];
      const s = cell === null || cell === undefined ? "" : String(cell);
      // CSV escape
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replaceAll('"', '""')}"`;
      }
      return s;
    });
    lines.push(row.join(","));
  }

  return lines.join("\n");
}