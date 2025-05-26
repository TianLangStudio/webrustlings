
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

// Define Exercise type
export interface Exercise {
  id: string;
  name: string;
  category: string;
  code: string; // Initial code for the exercise
  guide: string; // Markdown or text for the guide panel
  hints: string[]; // Array of hints
  difficulty: 'Easy' | 'Medium' | 'Hard'; // Difficulty level
  tags: string[]; // e.g., 'basics', 'comments'
}

// Export exercises array
export const exercises: Exercise[] = [
  {
    id: "intro1",
    name: "Intro 1: Remove 'I AM NOT DONE'",
    category: "Introduction",
    code: `// intro1.rs
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
}`,
    guide: "Welcome to RustlingsWeb! This is a very simple first exercise. The main goal is to get you familiar with the \"I AM NOT DONE\" problem we use in Rustlings to track your progress. Remove the '// I AM NOT DONE' comment from the code to make the program print its message.",
    hints: [
      "Simply delete the line that says `// I AM NOT DONE`.",
      "Ensure the `main` function and its `println!` macro remain."
    ],
    difficulty: "Easy",
    tags: ["basics", "comments"],
  },
  {
    id: "variables1",
    name: "Variables 1: Declare a variable",
    category: "Variables",
    code: `// variables1.rs
//
// Make me compile!
//
// Execute \`rustlings hint variables1\` or use the \`hint\` watch subcommand
// for a hint.

// I AM NOT DONE

fn main() {
    x = 5;
    println!("x has the value {}", x);
}`,
    guide: "In Rust, variables are immutable by default. To make them mutable, you need to use the `mut` keyword. Also, variables must be declared using the `let` keyword before they can be used.",
    hints: [
      "Use `let` to declare a variable.",
      "If you want to change a variable's value later, you'll need the `mut` keyword."
    ],
    difficulty: "Easy",
    tags: ["variables", "let", "mutability"],
  },
  {
    id: "functions1",
    name: "Functions 1: Define a function",
    category: "Functions",
    code: `// functions1.rs
//
// Execute \`rustlings hint functions1\` or use the \`hint\` watch subcommand
// for a hint.

// I AM NOT DONE

fn main() {
    call_me();
}
`,
    guide: "Functions in Rust are declared using the `fn` keyword. You need to define the `call_me` function so that it can be called from `main`.",
    hints: [
      "Define a new function named `call_me` using `fn call_me() { ... }`.",
      "You can put a `println!` inside `call_me` to see it work."
    ],
    difficulty: "Easy",
    tags: ["functions", "fn"],
  },
  {
    id: "if1",
    name: "If 1: Conditional logic",
    category: "Control Flow",
    code: `// if1.rs
//
// Execute \`rustlings hint if1\` or use the \`hint\` watch subcommand for a
// hint.

// I AM NOT DONE

pub fn bigger(a: i32, b: i32) -> i32 {
    // Complete this function to return the bigger number!
    // Do not use:
    // - another function call
    // - additional variables
    // Scroll down for hints.
}

// Don't mind this for now :)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ten_is_bigger_than_eight() {
        assert_eq!(10, bigger(10, 8));
    }

    #[test]
    fn fortytwo_is_bigger_than_thirtytwo() {
        assert_eq!(42, bigger(32, 42));
    }
}
`,
    guide: "This exercise introduces `if` expressions. You need to complete the `bigger` function to return the larger of the two input numbers using an `if` statement.",
    hints: [
      "Use an `if` statement to compare `a` and `b`.",
      "Rust's `if` is an expression, meaning it can return a value."
    ],
    difficulty: "Easy",
    tags: ["if", "control flow", "expressions"],
  },
  {
    id: "quiz1",
    name: "Quiz 1",
    category: "Primitives",
    code: `// quiz1.rs
//
// This is a quiz for the following sections:
// - Variables
// - Functions
// - If
//
// Mary is buying apples. One apple usually costs 2 Rustbucks, but if you buy
// more than 40 apples, each apple only costs 1 Rustbuck! Write a function that
// calculates the price of an order of apples given the quantity bought. No
// hints this time!

// I AM NOT DONE

// Put your function here!
// fn calculate_price_of_apples {

// Don't modify this function!
#[test]
fn verify_test() {
    let price1 = calculate_price_of_apples(35);
    let price2 = calculate_price_of_apples(40);
    let price3 = calculate_price_of_apples(41);
    let price4 = calculate_price_of_apples(65);

    assert_eq!(70, price1);
    assert_eq!(80, price2);
    assert_eq!(41, price3);
    assert_eq!(65, price4);
}
`,
    guide: "This is a quiz combining concepts from variables, functions, and if statements. You need to write the `calculate_price_of_apples` function based on the given pricing rules.",
    hints: [
      "Define a function `calculate_price_of_apples` that takes the quantity of apples (e.g., an `i32`) and returns the total price (e.g., an `i32`).",
      "Use an `if` statement to check if the quantity is greater than 40.",
      "Calculate the price based on the condition."
    ],
    difficulty: "Medium",
    tags: ["quiz", "variables", "functions", "if"],
  },
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

    