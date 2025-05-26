'use client';

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialRustCode = `// intro1.rs
//
// About this \`I AM NOT DONE\` thing:
// We use this to track your progress through the exercises.
// Whenever you see this line, it means you haven't yet solved the exercise.
//
// Once you have solved the exercise, delete this line to signal to the watcher
// that you are done.
//
// Execute \`rustlings hint intro1\` or use the \`hint\` watch subcommand for a
// hint.

// I AM NOT DONE

fn main() {
    println!("Hello and welcome to Rust!");
}`;

export function EditorPanel() {
  return (
    <Card className="h-full flex flex-col bg-card border-none shadow-none">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-lg">Intro 1: Remove 'I AM NOT DONE': Code Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          defaultValue={initialRustCode}
          className="h-full w-full resize-none rounded-none border-0 border-t border-border bg-card p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Write your Rust code here..."
        />
      </CardContent>
    </Card>
  );
}
