
'use client';

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "./exercise-selector"; // Import Exercise type (if needed for title, or remove if not)

interface EditorPanelProps {
  // currentExercise prop is removed as title is static and code is managed by value/onChange
  value: string;
  onChange: (value: string) => void;
}

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <Card className="h-full flex flex-col bg-card border-none shadow-none">
      <CardHeader className="py-3 px-4">
        {/* CardTitle can be static or removed if not showing exercise name here */}
        <CardTitle className="text-lg">Code Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          // key might not be needed if value/onChange correctly re-render
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full resize-none rounded-none border-0 border-t border-border bg-card p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Write your Rust code here..."
          aria-label="Code editor for current exercise"
        />
      </CardContent>
    </Card>
  );
}
