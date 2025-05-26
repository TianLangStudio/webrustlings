
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchAllExercisesFromServer, fetchExerciseCodeFromServer, fetchExerciseSolutionFromServer } from '@/lib/server-utils';
import type { Exercise } from '@/lib/types';
import ExerciseViewClient from '@/components/exercise-view-client';

interface ExercisePageProps {
  params: { exercisePathParts: string[] };
}

export async function generateStaticParams() {
  try {
    const exercises = await fetchAllExercisesFromServer();
    return exercises.map(exercise => ({
      exercisePathParts: exercise.id.split('/'),
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: ExercisePageProps): Promise<Metadata> {
  const exerciseId = params.exercisePathParts.join('/');
  try {
    const allExercises = await fetchAllExercisesFromServer(); // Fetch fresh list to find the specific one
    const exercise = allExercises.find(ex => ex.id === exerciseId);

    if (!exercise) {
      return {
        title: 'Exercise Not Found - RustlingsWeb',
      };
    }
    return {
      title: `${exercise.name} - RustlingsWeb`,
      description: `Learn Rust by solving the ${exercise.name} exercise. Interactive guide and AI help available. Guide: ${exercise.guide.substring(0, 150)}...`,
    };
  } catch (error) {
    console.error("Failed to generate metadata for exercise:", exerciseId, error);
    return {
      title: 'Error Loading Exercise - RustlingsWeb',
    }
  }
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const exerciseId = params.exercisePathParts.join('/');
  let allExercises: Exercise[] = [];
  let targetExercise: Exercise | undefined;

  try {
    allExercises = await fetchAllExercisesFromServer();
    targetExercise = allExercises.find(ex => ex.id === exerciseId);

    if (!targetExercise) {
      notFound();
    }

    // Fetch detailed code and solution for the target exercise
    const [code, solutionCode] = await Promise.all([
      fetchExerciseCodeFromServer(targetExercise.directory, targetExercise.name),
      fetchExerciseSolutionFromServer(targetExercise.directory, targetExercise.name)
    ]);

    const initialExerciseData: Exercise = {
      ...targetExercise,
      code: code, // Overwrite with fetched detailed code
      solutionCode: solutionCode ?? undefined,
      solutionFetched: true, // We've attempted to fetch it
    };
    
    // Update this specific exercise in allExercises with the fetched details for consistency if passed to client
    allExercises = allExercises.map(ex => ex.id === initialExerciseData.id ? initialExerciseData : ex);


    return (
      <ExerciseViewClient 
        initialExercise={initialExerciseData} 
        allExercises={allExercises} 
      />
    );
  } catch (error) {
    console.error(`Error loading exercise page for ${exerciseId}:`, error);
    // You could render a specific error component here too
    return (
      <div className="flex flex-col h-screen items-center justify-center text-destructive-foreground p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Exercise</h1>
        <p>Could not load the exercise: {exerciseId}. The exercise might not exist or there was a server error.</p>
        <pre className="mt-2 text-xs bg-muted p-2 rounded max-w-xl overflow-auto">{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
}
