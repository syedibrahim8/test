import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColumnDefModel, PokemonRow } from "@/types/pokemon";

type StoreState = {
  // data
  rowIds: number[];
  rowsById: Record<number, PokemonRow>;

  // columns
  columns: ColumnDefModel[];

  // ui/meta
  source: "empty" | "api" | "csv";
  lastUpdatedAt?: number;

  // actions
  setRows: (rows: PokemonRow[], source: StoreState["source"]) => void;
  updateCell: (id: number, key: string, value: unknown) => void;
  deleteWhere: (predicate: (row: PokemonRow) => boolean) => void;

  addColumn: (col: Omit<ColumnDefModel, "isBase">) => void;
  reset: () => void;
};

const baseColumns: ColumnDefModel[] = [
  { key: "id", label: "ID", type: "number", isBase: true, sticky: "left", width: 80 },
  { key: "sprite", label: "Sprite", type: "text", isBase: true, width: 90 },
  { key: "name", label: "Name", type: "text", isBase: true, width: 200 },
  { key: "types", label: "Type(s)", type: "text", isBase: true, width: 200 },
  { key: "hp", label: "HP", type: "number", isBase: true, width: 100 },
  { key: "attack", label: "Attack", type: "number", isBase: true, width: 110 },
  { key: "defense", label: "Defense", type: "number", isBase: true, width: 120 },
  { key: "specialAttack", label: "Sp. Atk", type: "number", isBase: true, width: 120 },
  { key: "specialDefense", label: "Sp. Def", type: "number", isBase: true, width: 120 },
  { key: "speed", label: "Speed", type: "number", isBase: true, width: 110 },
  // sticky right action column placeholder (rendered via table)
];

function indexRows(rows: PokemonRow[]) {
  const rowsById: Record<number, PokemonRow> = {};
  const rowIds: number[] = [];
  for (const r of rows) {
    rowsById[r.id] = r;
    rowIds.push(r.id);
  }
  return { rowsById, rowIds };
}

export const usePokemonStore = create<StoreState>()(
  persist(
    (set, get) => ({
      rowIds: [],
      rowsById: {},
      columns: baseColumns,
      source: "empty",
      lastUpdatedAt: undefined,

      setRows: (rows, source) => {
        const indexed = indexRows(rows);
        set({
          ...indexed,
          source,
          lastUpdatedAt: Date.now(),
        });
      },

      updateCell: (id, key, value) => {
        const row = get().rowsById[id];
        if (!row) return;
        // immutable update (fast enough for single-cell edit)
        set({
          rowsById: {
            ...get().rowsById,
            [id]: { ...row, [key]: value },
          },
          lastUpdatedAt: Date.now(),
        });
      },

      deleteWhere: (predicate) => {
        const { rowIds, rowsById } = get();
        const nextIds: number[] = [];
        const nextMap: Record<number, PokemonRow> = {};
        for (const id of rowIds) {
          const row = rowsById[id];
          if (!row) continue;
          if (!predicate(row)) {
            nextIds.push(id);
            nextMap[id] = row;
          }
        }
        set({ rowIds: nextIds, rowsById: nextMap, lastUpdatedAt: Date.now() });
      },

      addColumn: (col) => {
        const safeKey = col.key.trim().replace(/\s+/g, "_");
        const cols = get().columns;
        if (cols.some((c) => c.key === safeKey)) return;

        // update all rows with default value
        const defaultValue =
          col.type === "number" ? 0 : col.type === "boolean" ? false : "";

        const { rowsById } = get();
        const nextMap: Record<number, PokemonRow> = {};
        for (const [idStr, row] of Object.entries(rowsById)) {
          const id = Number(idStr);
          nextMap[id] = row[safeKey] === undefined ? { ...row, [safeKey]: defaultValue } : row;
        }

        set({
          columns: [...cols, { ...col, key: safeKey }],
          rowsById: nextMap,
          lastUpdatedAt: Date.now(),
        });
      },

      reset: () => set({ rowIds: [], rowsById: {}, columns: baseColumns, source: "empty" }),
    }),
    {
      name: "pokemon-research-lab",
      version: 1,
      partialize: (s) => ({
        rowIds: s.rowIds,
        rowsById: s.rowsById,
        columns: s.columns,
        source: s.source,
        lastUpdatedAt: s.lastUpdatedAt,
      }),
    }
  )
);