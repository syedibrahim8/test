import type { PokemonRow } from "@/types/pokemon";

type Cmd =
  | { kind: "set"; field: string; value: string; type: string }
  | { kind: "deleteWhere"; field: string; op: "is"; value: string }
  | { kind: "updateWhere"; field: string; value: string; whereField: string; whereValue: string };

export function parseCommand(input: string): Cmd | null {
  const s = input.trim().toLowerCase();

  // set hp to 100 for all pokemon of type grass
  const setMatch = s.match(/^set\s+(\w+)\s+to\s+(.+?)\s+for\s+all\s+pokemon\s+of\s+type\s+['"]?(.+?)['"]?$/);
  if (setMatch) return { kind: "set", field: setMatch[1], value: setMatch[2], type: setMatch[3] };

  // delete rows where generation is 1
  const delMatch = s.match(/^delete\s+rows\s+where\s+(\w+)\s+is\s+(.+)$/);
  if (delMatch) return { kind: "deleteWhere", field: delMatch[1], op: "is", value: delMatch[2] };

  // update ability to levitate where name is gengar
  const updMatch = s.match(/^update\s+(\w+)\s+to\s+(.+?)\s+where\s+(\w+)\s+is\s+(.+)$/);
  if (updMatch)
    return {
      kind: "updateWhere",
      field: updMatch[1],
      value: updMatch[2],
      whereField: updMatch[3],
      whereValue: updMatch[4],
    };

  return null;
}

export function applyCommand(rows: PokemonRow[], cmd: Cmd): PokemonRow[] {
  if (cmd.kind === "set") {
    const field = cmd.field;
    const value = cmd.value;
    const typeName = cmd.type;
    return rows.map((r) => {
      const types = String(r.types ?? "").toLowerCase();
      if (types.includes(typeName)) return { ...r, [field]: smartValue(value) };
      return r;
    });
  }

  if (cmd.kind === "deleteWhere") {
    const f = cmd.field;
    const v = cmd.value.replaceAll('"', "").replaceAll("'", "").trim();
    return rows.filter((r) => String((r as any)[f] ?? "").toLowerCase() !== v.toLowerCase());
  }

  if (cmd.kind === "updateWhere") {
    const { field, value, whereField, whereValue } = cmd;
    const wv = whereValue.replaceAll('"', "").replaceAll("'", "").trim().toLowerCase();
    return rows.map((r) => {
      if (String((r as any)[whereField] ?? "").toLowerCase() === wv) {
        return { ...r, [field]: smartValue(value) };
      }
      return r;
    });
  }

  return rows;
}

function smartValue(v: string): string | number | boolean {
  const s = v.trim().replaceAll('"', "").replaceAll("'", "");
  if (s === "true") return true;
  if (s === "false") return false;
  const n = Number(s);
  if (Number.isFinite(n) && s !== "") return n;
  return s;
}