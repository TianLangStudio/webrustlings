
'use client';

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "./exercise-selector"; // Import Exercise type

interface EditorPanelProps {
  currentExercise: Exercise;
  value: string;
  onChange: (value: string) => void;
}

export function EditorPanel({ currentExercise, value, onChange }: EditorPanelProps) {
  return (
    <Card className="h-full flex flex-col bg-card border-none shadow-none">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-lg">{currentExercise.name}: Code Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          key={currentExercise.id} // Ensure textarea remounts or updates defaultValue on exercise change
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full resize-none rounded-none border-0 border-t border-border bg-card p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Write your Rust code here..."
          aria-label={`Code editor for ${currentExercise.name}`}
        />
      </CardContent>
    </Card>
  );
}
