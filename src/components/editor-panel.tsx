
'use client';

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Exercise type is not needed here as title is static and code is managed by value/onChange from parent
// import type { Exercise } from "./exercise-selector"; 

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  // title prop can be added if dynamic titles are needed again, but for now it's static
}

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <Card className="h-full flex flex-col bg-card border-none shadow-none">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-lg">Code Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full resize-none rounded-none border-0 border-t border-border bg-card p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Loading code..."
          aria-label="Code editor for current exercise"
          // Disable textarea while code is loading or if no exercise selected.
          // Parent (page.tsx) will handle if value is empty string during load.
        />
      </CardContent>
    </Card>
  );
}
