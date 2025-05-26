
// Server-side utility functions for fetching exercise data
import type { Exercise, ApiExercise, ApiChapter } from './types';

const EXERCISES_API_URL = "https://rustlingsweb.tianlang.tech/exercises";
const EXERCISE_DETAIL_API_URL_BASE = "https://rustlingsweb.tianlang.tech/exercises";
const EXERCISE_SOLUTION_API_URL_BASE = "https://rustlingsweb.tianlang.tech/solutions";
const RUN_MARKER = "// I AM NOT DONE";

export async function fetchAllExercisesFromServer(): Promise<Exercise[]> {
  try {
    const response = await fetch(EXERCISES_API_URL, { cache: 'no-store' }); // Revalidate often for dynamic content
    if (!response.ok) {
      console.error(`Failed to fetch exercises list: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch exercises list: ${response.status} ${response.statusText}`);
    }
    const chapters: ApiChapter[] = await response.json();
    
    const exercises: Exercise[] = [];
    chapters.forEach(chapter => {
      chapter.exercises.forEach(apiEx => {
        if (apiEx.path && apiEx.path.trim() === "00_intro/intro1") {
          return; // Skip this exercise
        }

        const exerciseId = apiEx.path || `${chapter.name.toLowerCase().replace(/\s+/g, '-')}-${apiEx.name.toLowerCase().replace(/\s+/g, '-')}`;
        exercises.push({
          id: exerciseId,
          name: apiEx.name || "Unnamed Exercise",
          category: chapter.name || "Uncategorized",
          directory: apiEx.directory || "", // Essential for detail/solution API calls
          code: apiEx.code || `// Code for ${apiEx.name || "this exercise"} will be loaded...\n\n\n\n\n\n\n// ${RUN_MARKER}`, // Initial code
          guide: apiEx.hint || `Guide for ${apiEx.name || "this exercise"} not available from initial list.`, // Initial guide
          hints: apiEx.hints || [],
          difficulty: apiEx.difficulty || 'Easy',
          tags: apiEx.tags || [],
          solutionFetched: false,
        });
      });
    });
    return exercises;
  } catch (error: any) {
    console.error("Error in fetchAllExercisesFromServer:", error);
    // Depending on how critical this is, you might throw or return empty/handle error
    throw new Error(error.message || "An unknown error occurred while fetching exercises list on server.");
  }
}

export async function fetchExerciseCodeFromServer(directory: string, name: string): Promise<string> {
  if (!directory || !name) {
    throw new Error(`Exercise directory or name is invalid. Cannot fetch details.`);
  }
  const detailUrl = `${EXERCISE_DETAIL_API_URL_BASE}/${directory}/${name}`;
  try {
    const response = await fetch(detailUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch exercise code for ${directory}/${name}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  } catch (error: any) {
     console.error(`Error fetching code for ${directory}/${name}:`, error);
    throw error;
  }
}

export async function fetchExerciseSolutionFromServer(directory: string, name: string): Promise<string | null> {
  if (!directory || !name) {
    console.warn(`Exercise directory or name is invalid. Cannot fetch solution.`);
    return null;
  }
  const solutionUrl = `${EXERCISE_SOLUTION_API_URL_BASE}/${directory}/${name}`;
  try {
    const response = await fetch(solutionUrl, { cache: 'no-store' });
    if (response.status === 404) {
      return null; 
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch exercise solution for ${directory}/${name}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  } catch (error) {
    console.error(`Error fetching solution for ${directory}/${name}:`, error);
    throw error;
  }
}
