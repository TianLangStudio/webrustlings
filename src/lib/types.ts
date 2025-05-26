
// Shared types for exercises

// Interface for what the /exercises list API returns for each exercise item
export interface ApiExercise {
  name: string;
  path: string; // Used as ID, e.g., "00_intro/intro1"
  directory: string; // e.g., "00_intro"
  hint?: string; // Used as initial guide
  code?: string; // Initial code from list, might be placeholder
  hints?: string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

export interface ApiChapter {
  name:string;
  exercises: ApiExercise[];
}

// Internal Exercise representation used throughout the app
export interface Exercise {
  id: string; // e.g., "00_intro/intro1"
  name: string;
  category: string; // Chapter name
  directory: string; // e.g., "00_intro" (used for API calls)
  code: string; // Full code, fetched from detail API
  guide: string; // Guide/description, initially from list API's hint, potentially updated
  hints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  solutionCode?: string;
  solutionFetched?: boolean;
}
