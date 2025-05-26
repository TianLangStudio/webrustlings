
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
import type { Dispatch, SetStateAction } from "react";

// Define Exercise type
export interface Exercise {
  id: string;
  name: string;
  category: string;
}

// Export exercises array
export const exercises: Exercise[] = [
  {
    id: "intro1",
    name: "Intro 1: Remove 'I AM NOT DONE'",
    category: "Introduction",
  },
  { id: "variables1", name: "Variables 1", category: "Variables" },
  { id: "functions1", name: "Functions 1", category: "Functions" },
  // Add more exercises here
  { id: "if1", name: "If 1", category: "Control Flow"},
  { id: "quiz1", name: "Quiz 1", category: "Primitives"},
  { id: "move_semantics1", name: "Move Semantics 1", category: "Ownership"},
];

interface ExerciseSelectorProps {
  selectedExercise: Exercise;
  onExerciseSelect: (exercise: Exercise) => void;
}

export function ExerciseSelector({ selectedExercise, onExerciseSelect }: ExerciseSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[280px] justify-between text-sm">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="truncate">{selectedExercise.name}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]">
        <DropdownMenuLabel>Select an Exercise</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* This could be grouped by category in a more complex scenario */}
        {exercises.map((exercise) => (
          <DropdownMenuItem
            key={exercise.id}
            onSelect={() => onExerciseSelect(exercise)}
          >
            {exercise.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
