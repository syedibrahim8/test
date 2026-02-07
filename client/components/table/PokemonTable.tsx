"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { usePokemonStore } from "@/stores/pokemon.store";
import type { PokemonRow } from "@/types/pokemon";
import { EditableCell } from "./EditableCell";
import { Button } from "@/components/ui/button";
import { AddColumnDialog } from "./AddColumnDialog";

export function PokemonTable() {
  const rowIds = usePokemonStore((s) => s.rowIds);
  const rowsById = usePokemonStore((s) => s.rowsById);
  const columnsModel = usePokemonStore((s) => s.columns);
  const updateCell = usePokemonStore((s) => s.updateCell);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [addOpen, setAddOpen] = React.useState(false);

  // build row array lazily (virtualization will render only visible)
  const data = React.useMemo(() => rowIds.map((id) => rowsById[id]).filter(Boolean), [rowIds, rowsById]);

  const columns = React.useMemo<ColumnDef<PokemonRow>[]>(() => {
    const defs: ColumnDef<PokemonRow>[] = columnsModel.map((c) => ({
      accessorKey: c.key,
      header: () => <span className="text-xs font-semibold">{c.label}</span>,
      cell: ({ row, getValue }) => {
        const v = getValue();
        if (c.key === "sprite") {
          const src = typeof v === "string" ? v : "";
          return (
            <div className="h-8 w-10 flex items-center justify-center">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={src} className="h-8 w-8" />
              ) : (
                <div className="h-8 w-8 rounded bg-muted" />
              )}
            </div>
          );
        }

        return (
          <EditableCell
            value={v}
            type={c.type}
            onCommit={(next) => updateCell(row.original.id, c.key, next)}
          />
        );
      },
      size: c.width ?? 140,
      meta: { sticky: c.sticky },
    }));

    // sticky right "add column" action column
    defs.push({
      id: "__actions",
      header: () => <span className="text-xs font-semibold">+</span>,
      cell: () => (
        <Button className="cursor-pointer" variant="ghost" size="icon" onClick={() => setAddOpen(true)} aria-label="Add column">
          +
        </Button>
      ),
      size: 60,
      meta: { sticky: "right" as const },
    });

    return defs;
  }, [columnsModel, updateCell]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className="w-full">
      <AddColumnDialog open={addOpen} onOpenChange={setAddOpen} />

      <div className="rounded-xl border bg-card">
        {/* header */}
        <div className="border-b px-3 py-2 flex items-center justify-between gap-3">
          <div className="font-semibold">Dataset Table</div>
          <div className="flex items-center gap-2">
            <Button className="cursor-pointer" variant="outline" onClick={() => setAddOpen(true)}>
              Add Column
            </Button>
          </div>
        </div>

        {/* table */}
        <div ref={parentRef} className="h-[70vh] overflow-auto relative">
          {/* sticky header row */}
          <div className="sticky top-0 z-20 bg-card border-b">
            <div className="flex w-max">
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => {
                  const sticky = (header.column.columnDef.meta as any)?.sticky as "left" | "right" | undefined;
                  return (
                    <div
                      key={header.id}
                      className={[
                        "px-2 py-2 text-left border-r last:border-r-0 select-none",
                        sticky === "left" ? "sticky left-0 z-30 bg-card" : "",
                        sticky === "right" ? "sticky right-0 z-30 bg-card" : "",
                      ].join(" ")}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                      role="button"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? "▲" : header.column.getIsSorted() === "desc" ? "▼" : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* virtual body */}
          <div style={{ height: totalSize }} className="relative">
            {virtualItems.map((vi) => {
              const r = rows[vi.index];
              return (
                <div
                  key={r.id}
                  className="absolute left-0 right-0"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  <div className="flex w-max border-b">
                    {r.getVisibleCells().map((cell) => {
                      const sticky = (cell.column.columnDef.meta as any)?.sticky as "left" | "right" | undefined;
                      return (
                        <div
                          key={cell.id}
                          className={[
                            "px-2 py-1 border-r last:border-r-0 bg-card",
                            sticky === "left" ? "sticky left-0 z-10" : "",
                            sticky === "right" ? "sticky right-0 z-10" : "",
                          ].join(" ")}
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Rows: {rows.length.toLocaleString()} • Columns: {table.getAllLeafColumns().length}
        </div>
      </div>
    </div>
  );
}