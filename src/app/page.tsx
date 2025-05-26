'use client';

import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/editor-panel";
import { ExerciseSelector } from "@/components/exercise-selector";
import { GuidePanel } from "@/components/guide-panel";
import { RustlingsLogo } from "@/components/rustlings-logo";
import { ChevronLeft, ChevronRight, Play, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function RustlingsPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <RustlingsLogo />
          <ExerciseSelector />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs px-3 py-1 h-auto hidden md:inline-flex">
             Select Exercise
          </Button>
          <span className="text-xs text-muted-foreground hidden lg:inline">
            Based on work by <Link href="https://github.com/rust-lang/rustlings" target="_blank" className="text-primary hover:underline">mini</Link> and <Link href="https://github.com/ गौरी" target="_blank" className="text-primary hover:underline">FusionZhu</Link>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous Exercise">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5">
            <Play className="h-4 w-4" />
            Run
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel: Code Editor */}
        <div className="w-3/5 border-r border-border overflow-y-auto">
          <EditorPanel />
        </div>
        {/* Right Panel: Guide/Output/AI Help */}
        <div className="w-2/5 overflow-y-auto">
          <GuidePanel />
        </div>
      </main>
    </div>
  );
}
