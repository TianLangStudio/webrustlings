
'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ListChecks, Loader2 } from "lucide-react"; // Added Loader2
import type { Exercise } from "@/app/page";

interface ExerciseSelectorProps {
  selectedExercise: Exercise | null;
  onExerciseSelect: (exercise: Exercise) => void; // Changed parameter to Exercise
  exercises: Exercise[];
  disabled?: boolean; // To disable while list or details are loading
}

export function ExerciseSelector({ selectedExercise, onExerciseSelect, exercises, disabled }: ExerciseSelectorProps) {
  const exercisesByCategory: Record<string, Exercise[]> = exercises.reduce((acc, exercise) => {
    const category = exercise.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const triggerButtonText = () => {
    if (disabled && !selectedExercise && exercises.length === 0) return "Loading Exercises...";
    if (!selectedExercise && exercises.length > 0) return "Select an Exercise"; // Happens if first exercise detail load failed
    if (selectedExercise) return selectedExercise.name;
    return "No Exercises Loaded";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[280px] justify-between text-sm" disabled={disabled}>
          <div className="flex items-center gap-2">
            {disabled && !selectedExercise ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
            <span className="truncate">{triggerButtonText()}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] max-h-[70vh] overflow-y-auto">
        {Object.entries(exercisesByCategory).map(([category, categoryExercises]) => (
          <React.Fragment key={category}>
            <DropdownMenuLabel>{category}</DropdownMenuLabel>
            {categoryExercises.map((exercise) => (
              <DropdownMenuItem
                key={exercise.id}
                onSelect={() => onExerciseSelect(exercise)}
                disabled={disabled} // Individual items also disabled if main selector is
                className={selectedExercise?.id === exercise.id ? "bg-accent/50" : ""}
              >
                {exercise.name}
              </DropdownMenuItem>
            ))}
            {/* Add separator only if it's not the last category */}
            {Object.keys(exercisesByCategory)[Object.keys(exercisesByCategory).length - 1] !== category && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
        {Object.keys(exercisesByCategory).length === 0 && !disabled && (
            <DropdownMenuItem disabled>No exercises found.</DropdownMenuItem>
        )}
         {disabled && Object.keys(exercisesByCategory).length === 0 && (
             <DropdownMenuItem disabled>Loading exercises...</DropdownMenuItem>
         )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
