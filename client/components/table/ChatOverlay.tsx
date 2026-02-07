"use client";

import * as React from "react";
import { usePokemonStore } from "@/stores/pokemon.store";
import { parseCommand, applyCommand } from "@/lib/commands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatOverlay() {
  const rowIds = usePokemonStore((s) => s.rowIds);
  const rowsById = usePokemonStore((s) => s.rowsById);
  const setRows = usePokemonStore((s) => s.setRows);

  const [text, setText] = React.useState("");
  const [msg, setMsg] = React.useState<string>("");

  function run() {
    setMsg("");
    const cmd = parseCommand(text);
    if (!cmd) {
      setMsg("Couldn’t understand command. Try: set hp to 100 for all pokemon of type 'grass'");
      return;
    }

    const rows = rowIds.map((id) => rowsById[id]).filter(Boolean);
    const next = applyCommand(rows, cmd);
    setRows(next, "api"); // or preserve current source; store keeps it anyway
    setText("");
    setMsg("✅ Command applied.");
  }

  return (
    <div className="rounded-xl border bg-card p-3 space-y-2">
      <div className="font-semibold">AI Editing Assistant (Parser)</div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. set hp to 100 for all pokemon of type 'grass'"
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <Button className="cursor-pointer" onClick={run}>Run</Button>
      </div>
      {msg ? <div className="text-sm text-muted-foreground">{msg}</div> : null}
    </div>
  );
}