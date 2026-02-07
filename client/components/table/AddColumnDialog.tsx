"use client";

import * as React from "react";
import { usePokemonStore } from "@/stores/pokemon.store";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ColumnDataType } from "@/types/pokemon";

export function AddColumnDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addColumn = usePokemonStore((s) => s.addColumn);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<ColumnDataType>("text");

  function submit() {
    const key = name.trim();
    if (!key) return;
    addColumn({ key, label: name.trim(), type });
    setName("");
    setType("text");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Column name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ability, notes, isLegendary" />
          </div>

          <div className="grid gap-2">
            <Label>Data type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ColumnDataType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}