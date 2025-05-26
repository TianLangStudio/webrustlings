
// Server-side utility functions for fetching exercise data
import type { Exercise, ApiExercise, ApiChapter } from './types';

const EXERCISES_API_URL = "https://rustlingsweb.tianlang.tech/exercises";
const EXERCISE_DETAIL_API_URL_BASE = "https://rustlingsweb.tianlang.tech/exercises";
const EXERCISE_SOLUTION_API_URL_BASE = "https://rustlingsweb.tianlang.tech/solutions";
const RUN_MARKER = "// I AM NOT DONE";

export async function fetchAllExercisesFromServer(): Promise<Exercise[]> {
  try {
    const response = await fetch(EXERCISES_API_URL, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch exercises list: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch exercises list: ${response.status} ${response.statusText}`);
    }
    const chapters: ApiChapter[] = await response.json();
    
    const exercises: Exercise[] = [];
    chapters.forEach(chapter => {
      if (!chapter || !chapter.exercises || !Array.isArray(chapter.exercises)) {
        console.warn('Skipping invalid chapter data:', chapter);
        return;
      }
      chapter.exercises.forEach(apiEx => {
        if (!apiEx) {
          console.warn('Skipping invalid exercise data in chapter:', chapter.name);
          return;
        }

        // Corrected filter: Check apiEx.path for "00_intro/intro1"
        if (typeof apiEx.path === 'string' && apiEx.path.trim() === "00_intro/intro1") {
          return; // Skip this exercise
        }

        const exerciseId = typeof apiEx.path === 'string' && apiEx.path.trim() !== '' ? apiEx.path.trim() : 
          `${(typeof chapter.name === 'string' ? chapter.name : 'unknown_chapter').toLowerCase().replace(/\s+/g, '-')}-${(typeof apiEx.name === 'string' ? apiEx.name : 'unknown_exercise').toLowerCase().replace(/\s+/g, '-')}`;
        
        exercises.push({
          id: exerciseId,
          name: (typeof apiEx.name === 'string' ? apiEx.name : "Unnamed Exercise"),
          category: (typeof chapter.name === 'string' ? chapter.name : "Uncategorized"),
          directory: (typeof apiEx.directory === 'string' ? apiEx.directory : ""),
          code: (typeof apiEx.code === 'string' ? apiEx.code : `// Code for ${(typeof apiEx.name === 'string' ? apiEx.name : "this exercise")} will be loaded...\n\n\n\n\n\n\n// ${RUN_MARKER}`),
          guide: (typeof apiEx.hint === 'string' ? apiEx.hint : `Guide for ${(typeof apiEx.name === 'string' ? apiEx.name : "this exercise")} not available from initial list.`),
          hints: Array.isArray(apiEx.hints) ? apiEx.hints : [],
          difficulty: ['Easy', 'Medium', 'Hard'].includes(apiEx.difficulty as string) ? apiEx.difficulty as 'Easy' | 'Medium' | 'Hard' : 'Easy',
          tags: Array.isArray(apiEx.tags) ? apiEx.tags : [],
          solutionFetched: false,
        });
      });
    });
    return exercises;
  } catch (error: any) {
    console.error("Error in fetchAllExercisesFromServer:", error);
    throw new Error(error.message || "An unknown error occurred while fetching exercises list on server.");
  }
}

export async function fetchExerciseCodeFromServer(directory: string, name: string): Promise<string> {
  if (!directory || !name) {
    // console.error("Exercise directory or name is invalid. Cannot fetch details."); // Already handled by throwing
    throw new Error(`Exercise directory or name is invalid. Cannot fetch details.`);
  }
  const detailUrl = `${EXERCISE_DETAIL_API_URL_BASE}/${directory}/${name}`;
  try {
    const response = await fetch(detailUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch exercise code for ${directory}/${name}: ${response.status} ${response.statusText}`);
    }
    // Assuming the response is plain text for the code
    return response.text();
  } catch (error: any) {
     console.error(`Error fetching code for ${directory}/${name}:`, error);
    // Re-throw the error to be caught by the calling server component
    throw error;
  }
}

export async function fetchExerciseSolutionFromServer(directory: string, name: string): Promise<string | null> {
  if (!directory || !name) {
    console.warn(`Exercise directory or name is invalid. Cannot fetch solution.`);
    return null; // Or throw, depending on desired strictness. Returning null allows graceful fallback.
  }
  const solutionUrl = `${EXERCISE_SOLUTION_API_URL_BASE}/${directory}/${name}`;
  try {
    const response = await fetch(solutionUrl, { cache: 'no-store' });
    if (response.status === 404) {
      return null; // Solution not found is not an error, just unavailable.
    }
    if (!response.ok) {
      // For other errors (500, etc.), treat it as a failure to load.
      throw new Error(`Failed to fetch exercise solution for ${directory}/${name}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  } catch (error) {
    // Log the error but return null to indicate solution loading failed, allowing UI to handle it.
    // Or re-throw if solution loading failure should break the page. For now, let's be graceful.
    console.error(`Error fetching solution for ${directory}/${name}:`, error);
    // throw error; // If you want page to error out
    return null; // Allows the page to still render, GuidePanel will show "solution not available" or error.
  }
}
