"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ColumnDataType } from "@/types/pokemon";

export function EditableCell({
  value,
  type,
  onCommit,
  className,
}: {
  value: unknown;
  type: ColumnDataType;
  onCommit: (next: unknown) => void;
  className?: string;
}) {
  const [local, setLocal] = React.useState<string>(() => {
    if (type === "boolean") return String(Boolean(value));
    return value === null || value === undefined ? "" : String(value);
  });

  React.useEffect(() => {
    if (type === "boolean") setLocal(String(Boolean(value)));
    else setLocal(value === null || value === undefined ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function coerce(v: string) {
    if (type === "number") return Number.isFinite(Number(v)) ? Number(v) : 0;
    if (type === "boolean") return v === "true";
    return v;
  }

  return (
    <Input
      className={cn("h-8", className)}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(coerce(local))}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          // revert
          if (type === "boolean") setLocal(String(Boolean(value)));
          else setLocal(value === null || value === undefined ? "" : String(value));
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}