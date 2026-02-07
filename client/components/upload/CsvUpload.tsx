"use client";

import * as React from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SchemaMapper } from "./SchemaMapper";

export function CsvUpload() {
  const [headers, setHeaders] = React.useState<string[] | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function onPick(f: File | null) {
    setError("");
    setHeaders(null);
    setFile(f);

    if (!f) return;

    // stream-parse just to extract headers
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      preview: 1,
      complete: (res) => {
        const fields = res.meta.fields ?? [];
        if (!fields.length) setError("Could not detect CSV headers");
        else setHeaders(fields);
      },
      error: (err) => setError(err.message),
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Manual CSV Upload</div>
          <Button
            className = "cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload CSV
          </Button>
        </div>

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        {!file && (
          <p className="text-sm text-muted-foreground">
            Upload large CSV files (10MB–100MB). Parsing is done using streaming
            to avoid browser crashes.
          </p>
        )}

        {file && (
          <p className="text-xs text-muted-foreground">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Schema mapping appears after header detection */}
        {file && headers && (
          <SchemaMapper file={file} headers={headers} />
        )}
      </CardContent>
    </Card>
  );
}