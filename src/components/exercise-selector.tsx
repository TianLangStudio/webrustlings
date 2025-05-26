
'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ListChecks } from "lucide-react";
import type { Exercise } from "@/app/page"; // Import Exercise type from page.tsx

interface ExerciseSelectorProps {
  selectedExercise: Exercise | null; // Can be null initially
  onExerciseSelect: (exercise: Exercise) => void;
  exercises: Exercise[]; // Exercises will be passed as a prop
  disabled?: boolean;
}

export function ExerciseSelector({ selectedExercise, onExerciseSelect, exercises, disabled }: ExerciseSelectorProps) {
  // Group exercises by category for the dropdown
  const exercisesByCategory: Record<string, Exercise[]> = exercises.reduce((acc, exercise) => {
    const category = exercise.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[280px] justify-between text-sm" disabled={disabled || !selectedExercise}>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="truncate">{selectedExercise ? selectedExercise.name : "Loading Exercises..."}</span>
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
                disabled={disabled}
              >
                {exercise.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
        {Object.keys(exercisesByCategory).length === 0 && !disabled && (
            <DropdownMenuItem disabled>No exercises loaded.</DropdownMenuItem>
        )}
         {disabled && Object.keys(exercisesByCategory).length === 0 && (
             <DropdownMenuItem disabled>Loading exercises...</DropdownMenuItem>
         )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
