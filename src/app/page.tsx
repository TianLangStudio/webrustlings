
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/editor-panel";
import { ExerciseSelector, exercises as allExercises, type Exercise } from "@/components/exercise-selector";
import { GuidePanel } from "@/components/guide-panel";
import { RustlingsLogo } from "@/components/rustlings-logo";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function RustlingsPage() {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(allExercises[0]);

  const handleExerciseSelect = (exercise: Exercise) => {
    setCurrentExercise(exercise);
  };

  const currentExerciseIndex = allExercises.findIndex(ex => ex.id === currentExercise.id);
  const progressPercentage = allExercises.length > 0 ? ((currentExerciseIndex + 1) / allExercises.length) * 100 : 0;

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExercise(allExercises[currentExerciseIndex - 1]);
    }
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < allExercises.length - 1) {
      setCurrentExercise(allExercises[currentExerciseIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <RustlingsLogo />
            <span className="text-xs text-muted-foreground mt-1">
              Developed by Gemini and <Link href="https://www.tianlang.tech" target="_blank" className="text-primary hover:underline">FusionZhu</Link>
            </span>
          </div>
          <ExerciseSelector 
            selectedExercise={currentExercise}
            onExerciseSelect={handleExerciseSelect}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous Exercise" onClick={goToPreviousExercise} disabled={currentExerciseIndex === 0}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise" onClick={goToNextExercise} disabled={currentExerciseIndex === allExercises.length - 1}>
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

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
        <Progress value={progressPercentage} className="w-full h-2" />
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel: Code Editor */}
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          <EditorPanel />
        </div>
        {/* Right Panel: Guide/Output/AI Help */}
        <div className="w-full md:w-2/5 overflow-y-auto">
          <GuidePanel />
        </div>
      </main>
    </div>
  );
}
