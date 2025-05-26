
import { redirect } from 'next/navigation';
import { fetchAllExercisesFromServer } from '@/lib/server-utils';

// This is the root page. It will fetch all exercises
// and redirect to the first available exercise's dynamic page.
export default async function RootPage() {
  try {
    const allExercises = await fetchAllExercisesFromServer();

    if (allExercises.length > 0) {
      // Construct the path for the first exercise.
      // The exercise.id is already in "category/name" format.
      const firstExercisePath = allExercises[0].id;
      redirect(`/exercise/${firstExercisePath}`);
    } else {
      // Handle case where no exercises are found
      return (
        <div className="flex flex-col h-screen items-center justify-center text-foreground p-4">
          <h1 className="text-2xl font-bold mb-4">No Exercises Available</h1>
          <p>Could not find any exercises. Please check the API or configuration.</p>
        </div>
      );
    }
  } catch (error) {
    console.error("Error in RootPage:", error);
    return (
      <div className="flex flex-col h-screen items-center justify-center text-destructive-foreground p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading RustlingsWeb</h1>
        <p>There was an issue initializing the application.</p>
        <pre className="mt-2 text-xs bg-muted p-2 rounded max-w-xl overflow-auto">{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
}
