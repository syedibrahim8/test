"use client";

import { usePokemonStore } from "@/stores/pokemon.store";
import { exportRowsToCSV } from "@/lib/csv";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  const rowIds = usePokemonStore((s) => s.rowIds);
  const rowsById = usePokemonStore((s) => s.rowsById);
  const columns = usePokemonStore((s) => s.columns);

  function exportNow() {
    const rows = rowIds.map((id) => rowsById[id]).filter(Boolean);
    const csv = exportRowsToCSV(rows, columns);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pokemon-research-lab-export.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <Button className="cursor-pointer" variant="outline" onClick={exportNow}>
      Export CSV
    </Button>
  );
}