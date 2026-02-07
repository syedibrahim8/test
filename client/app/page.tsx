"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { usePokedexAggregation } from "@/hooks/usePokedexAggregation";
import { PokemonTable } from "@/components/table/PokemonTable";
import { CsvUpload } from "@/components/upload/CsvUpload";
import { ChatOverlay } from "@/components/table/ChatOverlay";
import { ExportButton } from "@/components/table/ExportButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const { run, cancel, isRunning, error, progressText } = usePokedexAggregation();

  const uploadRef = React.useRef<HTMLDivElement>(null);
  const [pulseUpload, setPulseUpload] = React.useState(false);

  function focusUpload() {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPulseUpload(true);
    window.setTimeout(() => setPulseUpload(false), 900);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/40">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-375 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center border shadow-sm">
              🧪
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold leading-tight">
                The Pokémon Research Lab
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Virtualized dataset table • Inline edits • Dynamic columns • CSV import/export
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExportButton />

            {/* NEW: Manual CSV Upload button */}
            <Button className="cursor-pointer border" variant="outline" onClick={focusUpload}>
              Manual CSV Upload
            </Button>

            <Button onClick={run} disabled={isRunning} className="shadow-sm cursor-pointer">
              {isRunning ? "Fetching…" : "Fetch Full Pokédex Dataset"}
            </Button>

            {isRunning ? (
              <Button className="cursor-pointer border" variant="outline" onClick={cancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-375 px-4 py-6 space-y-4">
        {/* Status / hints */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Performance-first
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  TanStack Virtual
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  Zustand
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  Next.js + TS
                </Badge>
              </div>

              {progressText ? (
                <p className="text-sm text-muted-foreground">{progressText}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Load data from PokeAPI or import a large CSV (streaming).
                </p>
              )}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: use the <span className="font-medium">+</span> column to add custom fields.
            </div>
          </CardContent>
        </Card>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <ChatOverlay />
            <PokemonTable />
          </div>

          <div className="space-y-4">
            {/* Upload section with pulse highlight (UI only) */}
            <div
              ref={uploadRef}
              className={[
                "rounded-2xl transition-all",
                pulseUpload ? "ring-2 ring-primary/60 shadow-md" : "",
              ].join(" ")}
            >
              <CsvUpload />
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="font-semibold">Command Examples</div>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li className="rounded-lg bg-muted/50 p-2 font-mono text-xs">
                    set hp to 100 for all pokemon of type &quot;grass&quot;
                  </li>
                  <li className="rounded-lg bg-muted/50 p-2 font-mono text-xs">
                    delete rows where generation is 1
                  </li>
                  <li className="rounded-lg bg-muted/50 p-2 font-mono text-xs">
                    update ability to &quot;levitate&quot; where name is &quot;gengar&quot;
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="pt-2 text-xs text-muted-foreground">
          Built with ❤️ Next.js • TypeScript • TanStack • Zustand • shadcn/ui @ Copy rights reserved 2026
        </footer>
      </main>
    </div>
  );
}