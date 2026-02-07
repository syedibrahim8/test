"use client";

import * as React from "react";
import Papa from "papaparse";
import { usePokemonStore } from "@/stores/pokemon.store";
import type { ColumnDefModel, ColumnDataType, PokemonRow } from "@/types/pokemon";
import { coerceValue } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TARGET_FIELDS: { key: keyof PokemonRow; label: string; type: ColumnDataType }[] = [
  { key: "id", label: "ID", type: "number" },
  { key: "sprite", label: "Sprite", type: "text" },
  { key: "name", label: "Name", type: "text" },
  { key: "types", label: "Type(s)", type: "text" },
  { key: "hp", label: "HP", type: "number" },
  { key: "attack", label: "Attack", type: "number" },
  { key: "defense", label: "Defense", type: "number" },
  { key: "specialAttack", label: "Special Attack", type: "number" },
  { key: "specialDefense", label: "Special Defense", type: "number" },
  { key: "speed", label: "Speed", type: "number" },
  { key: "generation", label: "Generation", type: "number" },
  { key: "ability", label: "Ability", type: "text" },
];

export function SchemaMapper({ file, headers }: { file: File; headers: string[] }) {
  const setRows = usePokemonStore((s) => s.setRows);
  const columns = usePokemonStore((s) => s.columns);
  const addColumn = usePokemonStore((s) => s.addColumn);

  // mapping: targetKey -> csvHeader
  const [map, setMap] = React.useState<Record<string, string>>({});
  const [parsing, setParsing] = React.useState(false);
  const [progress, setProgress] = React.useState<{ rows: number } | null>(null);
  const [err, setErr] = React.useState("");

  function setMapping(targetKey: string, csvHeader: string) {
    setMap((m) => ({ ...m, [targetKey]: csvHeader }));
  }

  async function runParse() {
    setErr("");
    setParsing(true);
    setProgress({ rows: 0 });

    // ensure mapped fields exist as columns (including dynamic ones if user maps to them later)
    // For simplicity: if user maps something like "ability" and it's not in columns, add it.
    for (const tf of TARGET_FIELDS) {
      if (tf.key === "id") continue;
      if (!columns.some((c) => c.key === tf.key)) {
        // only add if user mapped it
        if (map[tf.key]) addColumn({ key: String(tf.key), label: tf.label, type: tf.type });
      }
    }

    const out: PokemonRow[] = [];
    let rowCount = 0;

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      step: (results) => {
        const src = results.data;
        // Must have an ID; if not mapped, we generate a stable incremental id (not ideal but safe)
        const mappedIdHeader = map["id"];
        const idRaw = mappedIdHeader ? src[mappedIdHeader] : rowCount + 1;

        const row: PokemonRow = {
          id: coerceValue("number", idRaw) as number,
          sprite: "",
          name: "",
          types: "",
          hp: 0,
          attack: 0,
          defense: 0,
          specialAttack: 0,
          specialDefense: 0,
          speed: 0,
        };

        for (const tf of TARGET_FIELDS) {
          const csvKey = map[String(tf.key)];
          if (!csvKey) continue;
          (row as any)[tf.key] = coerceValue(tf.type, src[csvKey]);
        }

        out.push(row);
        rowCount += 1;

        if (rowCount % 1000 === 0) setProgress({ rows: rowCount });
      },
      complete: () => {
        out.sort((a, b) => a.id - b.id);
        setRows(out, "csv");
        setParsing(false);
      },
      error: (e) => {
        setErr(e.message);
        setParsing(false);
      },
    });
  }

  return (
    <div className="space-y-3 border rounded-lg p-3">
      <div className="font-semibold">Schema Mapping</div>

      <div className="grid gap-2">
        {TARGET_FIELDS.map((f) => (
          <div key={String(f.key)} className="flex items-center gap-3">
            <div className="w-44 text-sm">{f.label}</div>
            <Select value={map[String(f.key)] ?? ""} onValueChange={(v) => setMapping(String(f.key), v)}>
              <SelectTrigger className="w-65">
                <SelectValue placeholder="Select CSV column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">{f.type}</div>
          </div>
        ))}
      </div>

      {err ? <div className="text-sm text-destructive">{err}</div> : null}

      <div className="flex items-center gap-2">
        <Button disabled={parsing} onClick={runParse}>
          {parsing ? "Parsing…" : "Import CSV"}
        </Button>
        {progress ? <div className="text-sm text-muted-foreground">Rows parsed: {progress.rows.toLocaleString()}</div> : null}
      </div>

      <div className="text-xs text-muted-foreground">
        Parsing uses streaming + worker to avoid crashing on 10MB–100MB CSV files.
      </div>
    </div>
  );
}