
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
import { ChevronDown, ListChecks, Loader2 } from "lucide-react";
import type { Exercise } from "@/lib/types"; // Using shared type

interface ExerciseSelectorProps {
  selectedExercise: Exercise | null;
  onExerciseSelect: (exercise: Exercise) => void; 
  exercises: Exercise[];
  disabled?: boolean; 
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
    if (!selectedExercise && exercises.length > 0) return "Select an Exercise"; 
    if (selectedExercise) return selectedExercise.name;
    return "No Exercises Loaded";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[280px] justify-between text-sm" disabled={disabled || exercises.length === 0}>
          <div className="flex items-center gap-2">
            {(disabled && !selectedExercise && exercises.length === 0) ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
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
                onSelect={() => onExerciseSelect(exercise)} // This will now trigger navigation
                disabled={disabled} 
                className={selectedExercise?.id === exercise.id ? "bg-accent/50" : ""}
              >
                {exercise.name}
              </DropdownMenuItem>
            ))}
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
