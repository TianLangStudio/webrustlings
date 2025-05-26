
import { redirect } from 'next/navigation';
import { fetchAllExercisesFromServer } from '@/lib/server-utils';

// This is the root page. It will fetch all exercises
// and redirect to the first available exercise's dynamic page.
export default async function RootPage() {
  let allExercises;
  try {
    allExercises = await fetchAllExercisesFromServer();
  } catch (error) {
    console.error("Error fetching exercises in RootPage:", error);
    // Render an error page specific to fetching failures
    return (
      <div className="flex flex-col h-screen items-center justify-center text-destructive-foreground p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading RustlingsWeb</h1>
        <p>There was an issue fetching the list of exercises.</p>
        <pre className="mt-2 text-xs bg-muted p-2 rounded max-w-xl overflow-auto">{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }

  // At this point, allExercises is populated, or the function has returned an error page due to fetch failure.
  if (allExercises.length > 0 && allExercises[0]?.id) {
    // Construct the path for the first exercise.
    // The exercise.id is already in "category/name" format.
    const firstExercisePath = allExercises[0].id;
    redirect(`/exercise/${firstExercisePath}`); // This will throw NEXT_REDIRECT, which Next.js will handle.
  } else {
    // Handle case where no exercises are found (but fetching was successful)
    // or if the first exercise somehow has no id.
    return (
      <div className="flex flex-col h-screen items-center justify-center text-foreground p-4">
        <h1 className="text-2xl font-bold mb-4">No Exercises Available</h1>
        <p>Could not find any exercises or the first exercise is invalid. Please check the API or configuration.</p>
      </div>
    );
  }
}
