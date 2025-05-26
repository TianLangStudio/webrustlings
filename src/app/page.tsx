
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/editor-panel";
import { ExerciseSelector } from "@/components/exercise-selector";
import { GuidePanel, type RunOutput } from "@/components/guide-panel";
import { RustlingsLogo } from "@/components/rustlings-logo";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, RefreshCcw, Loader2, AlertTriangle, Settings } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsDialog } from "@/components/settings-dialog";

const DEFAULT_BACKEND_URL = "https://rustlingsweb.tianlang.tech/execute";
const LOCAL_STORAGE_BACKEND_URL_KEY = "userBackendUrl";
const RUN_MARKER = "// I AM NOT DONE";
const EXERCISES_API_URL = "https://rustlingsweb.tianlang.tech/exercises"; // For the list
const EXERCISE_DETAIL_API_URL_BASE = "https://rustlingsweb.tianlang.tech/exercises"; // Base for single exercise

// Interface for what the /exercises list API returns for each exercise
interface ApiExercise {
  name: string; // Exercise name, also used as {name} in detail URL segment
  path: string; // Unique ID, e.g., "intro/intro1.rs"
  directory: string; // Directory name, used as {directory} in detail URL segment
  hint?: string; // Initial guide/hint from the list API
  code?: string; // Initial code from the list API
  hints?: string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

interface ApiChapter {
  name: string;
  exercises: ApiExercise[];
}

// Internal Exercise representation
export interface Exercise {
  id: string; // Unique ID, from apiEx.path
  name: string; // Exercise name, from apiEx.name
  category: string; // Chapter name
  directory: string; // Directory for detail API call
  code: string; // Full code, fetched from detail API
  guide: string; // Full guide, fetched from detail API
  hints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface ExerciseDetailResponse {
  code: string;
  guide: string;
  // Potentially other fields like name, hints, etc. if the detail API returns them
  // For now, assuming at least code and guide
}


export default function RustlingsPage() {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [editorCode, setEditorCode] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [runOutput, setRunOutput] = useState<RunOutput | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const { toast } = useToast();
  const prevEditorCodeRef = useRef<string>();

  const [isLoadingExercises, setIsLoadingExercises] = useState(true); // For initial list
  const [exerciseLoadError, setExerciseLoadError] = useState<string | null>(null); // For initial list

  const [isLoadingExerciseDetails, setIsLoadingExerciseDetails] = useState(false); // For selected exercise details
  const [exerciseDetailLoadError, setExerciseDetailLoadError] = useState<string | null>(null);


  const fetchSingleExerciseDetails = useCallback(async (directory: string, name: string): Promise<ExerciseDetailResponse> => {
    const detailUrl = `${EXERCISE_DETAIL_API_URL_BASE}/${directory}/${name}`;
    const response = await fetch(detailUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch exercise details for ${directory}/${name}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }, []);

  const selectExercise = useCallback(async (exerciseToSelect: Exercise | null) => {
    if (!exerciseToSelect) {
        setCurrentExercise(null);
        setEditorCode("");
        return;
    }

    // Set current exercise immediately for UI responsiveness (e.g., selector update)
    // It might have stale code/guide until details are fetched
    setCurrentExercise(exerciseToSelect);
    setEditorCode(exerciseToSelect.code); // Display initial code from list, or empty if not available
    setRunOutput(null);
    setRunError(null);
    // setAiHelp(null); // Assuming aiHelp is managed in GuidePanel

    setIsLoadingExerciseDetails(true);
    setExerciseDetailLoadError(null);

    try {
      // Fetch the full code and guide
      const detailedData = await fetchSingleExerciseDetails(exerciseToSelect.directory, exerciseToSelect.name);
      
      const updatedExercise: Exercise = {
        ...exerciseToSelect,
        code: detailedData.code,
        guide: detailedData.guide,
        // If detail API returns more (e.g. updated hints, difficulty), merge them here
      };

      setCurrentExercise(updatedExercise);
      setAllExercises(prevExercises => 
        prevExercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex)
      );
      setEditorCode(updatedExercise.code);

    } catch (error: any) {
      console.error("Failed to load exercise details:", error);
      setExerciseDetailLoadError(error.message || "An unknown error occurred while loading exercise details.");
      // Keep currentExercise as is (with potentially old data), or clear editor if preferred
      // setEditorCode(""); // Or keep stale code: editorCode is already exerciseToSelect.code
    } finally {
      setIsLoadingExerciseDetails(false);
    }
  }, [fetchSingleExerciseDetails]);


  useEffect(() => {
    setIsClient(true);

    const fetchExercisesList = async () => {
      setIsLoadingExercises(true);
      setExerciseLoadError(null);
      try {
        const response = await fetch(EXERCISES_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch exercises list: ${response.status} ${response.statusText}`);
        }
        const chapters: ApiChapter[] = await response.json();
        
        const exercises: Exercise[] = [];
        chapters.forEach(chapter => {
          chapter.exercises.forEach(apiEx => {
            exercises.push({
              id: apiEx.path,
              name: apiEx.name,
              category: chapter.name,
              directory: apiEx.directory,
              code: apiEx.code || "", // Initial code from list, might be placeholder
              guide: apiEx.hint || "", // Initial guide from list, might be placeholder
              hints: apiEx.hints || [],
              difficulty: apiEx.difficulty || 'Easy',
              tags: apiEx.tags || [],
            });
          });
        });

        setAllExercises(exercises);
        if (exercises.length > 0) {
          // Automatically select and load details for the first exercise
          await selectExercise(exercises[0]);
        } else {
          setExerciseLoadError("No exercises found in the list.");
          setCurrentExercise(null); // Ensure currentExercise is null if list is empty
        }
      } catch (error: any) {
        console.error("Failed to load exercises list:", error);
        setExerciseLoadError(error.message || "An unknown error occurred while loading exercises list.");
        setCurrentExercise(null);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercisesList();
  }, [selectExercise]);


  const getBackendUrl = (): string => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem(LOCAL_STORAGE_BACKEND_URL_KEY);
      if (savedUrl) {
        return savedUrl;
      }
    }
    return DEFAULT_BACKEND_URL;
  };

  const handleRunCode = useCallback(async () => {
    if (!currentExercise || isLoadingExerciseDetails) return;

    setIsRunningCode(true);
    setRunOutput(null);
    setRunError(null);

    const backendUrl = getBackendUrl();

    const payload = {
      channel: "stable",
      mode: "debug",
      edition: "2021",
      crateType: "bin",
      tests: false,
      code: editorCode,
      backtrace: false,
    };

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: `HTTP error! Status: ${response.status}. Response body was not valid JSON.` };
        }
        const message = errorData.message || errorData.error || `HTTP error! Status: ${response.status}`;
        throw new Error(message);
      }

      const result: RunOutput = await response.json();
      setRunOutput(result);
      if (result.success) {
         toast({
          title: "Run Successful",
          description: "Your code compiled and ran successfully.",
        });
      } else {
        toast({
          title: "Run Failed",
          description: result.stderr || "There were issues with your code. Check the output tab.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Failed to run code:", error);
      let userFriendlyErrorMessage = "An unexpected error occurred while contacting the backend.";
      
      if (error.message && error.message.toLowerCase().includes("failed to fetch")) {
        userFriendlyErrorMessage = `Could not connect to the backend at ${backendUrl}. Please ensure the backend server is running, accessible, and CORS is configured. You can change the backend URL in Settings.`;
      } else if (error.message) {
        userFriendlyErrorMessage = error.message;
      }

      setRunError(userFriendlyErrorMessage);
      toast({
        title: "Error Running Code",
        description: userFriendlyErrorMessage,
        variant: "destructive"
      });
    } finally {
      setIsRunningCode(false);
    }
  }, [editorCode, toast, currentExercise, isLoadingExerciseDetails]); // Added isLoadingExerciseDetails

  useEffect(() => {
    const previousCode = prevEditorCodeRef.current;
    prevEditorCodeRef.current = editorCode; 

    if (isClient && typeof previousCode === 'string' && 
        currentExercise && !isLoadingExerciseDetails && // Ensure details are loaded
        previousCode.includes(RUN_MARKER) && 
        !editorCode.includes(RUN_MARKER)) {
      if (!isRunningCode) {
        handleRunCode();
      }
    }
  }, [editorCode, isRunningCode, handleRunCode, isClient, currentExercise, isLoadingExerciseDetails]);

  const currentExerciseIndex = currentExercise ? allExercises.findIndex(ex => ex.id === currentExercise.id) : -1;
  const progressPercentage = allExercises.length > 0 && currentExerciseIndex !== -1 && isClient ? ((currentExerciseIndex + 1) / allExercises.length) * 100 : 0;

  const goToPreviousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      selectExercise(allExercises[currentExerciseIndex - 1]);
    }
  }, [currentExerciseIndex, allExercises, selectExercise]);

  const goToNextExercise = useCallback(() => {
    if (currentExerciseIndex < allExercises.length - 1) {
      selectExercise(allExercises[currentExerciseIndex + 1]);
    }
  },[currentExerciseIndex, allExercises, selectExercise]);

  const handleResetCode = () => {
    if (currentExercise) { // currentExercise here should have the authoritative code
      setEditorCode(currentExercise.code);
      setRunOutput(null);
      setRunError(null);
      toast({
        title: "Code Reset",
        description: `Code for ${currentExercise.name} has been reset to its initial state.`,
      });
    }
  };

  if (!isClient) {
    return null; 
  }
  
  if (isLoadingExercises && isClient) { // Loading initial list
    return (
      <div className="flex flex-col h-screen bg-background text-foreground items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Rustlings exercises list...</p>
      </div>
    );
  }

  if (exerciseLoadError && isClient) { // Error loading initial list
    return (
      <div className="flex flex-col h-screen bg-background text-destructive-foreground items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Exercises List</h2>
        <p className="mb-4">{exerciseLoadError}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // If list is loaded, but no exercises exist (e.g. API returned empty)
  if (!isLoadingExercises && allExercises.length === 0 && isClient) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Exercises Available</h2>
        <p className="mb-4">The exercise list is empty. Please check the data source.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <RustlingsLogo />
            <span className="text-xs text-muted-foreground mt-1">
              Developed by Gemini and <Link href="https://www.tianlang.tech" target="_blank" className="text-primary hover:underline">FusionZhu</Link>
            </span>
          </div>
          <ExerciseSelector 
            selectedExercise={currentExercise}
            onExerciseSelect={selectExercise} // Use the new selectExercise function
            exercises={allExercises}
            disabled={isLoadingExercises || allExercises.length === 0 || isLoadingExerciseDetails}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Previous Exercise" onClick={goToPreviousExercise} disabled={isLoadingExercises || isLoadingExerciseDetails || currentExerciseIndex <= 0 || isRunningCode}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise" onClick={goToNextExercise} disabled={isLoadingExercises || isLoadingExerciseDetails || currentExerciseIndex === -1 || currentExerciseIndex >= allExercises.length - 1 || isRunningCode}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResetCode} disabled={isLoadingExercises || isLoadingExerciseDetails || !currentExercise || isRunningCode}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
            onClick={handleRunCode}
            disabled={isLoadingExercises || isLoadingExerciseDetails || !currentExercise || !currentExercise.code || isRunningCode}
          >
            {isRunningCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningCode ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
         {(isLoadingExercises || (currentExercise && isLoadingExerciseDetails)) ? <Skeleton className="h-2 w-full" /> : <Progress value={progressPercentage} className="w-full h-2" />}
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel: Code Editor */}
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          {isLoadingExercises || !currentExercise || isLoadingExerciseDetails ? (
            <div className="p-4 h-full flex flex-col">
              <Skeleton className="h-8 w-1/4 mb-4" /> {/* Title skeleton */}
              <div className="flex-grow">
                <Skeleton className="h-full w-full" /> {/* Editor content skeleton */}
              </div>
            </div>
           ) : (
            <EditorPanel 
                value={editorCode} 
                onChange={setEditorCode}
            />
           )}
        </div>
        {/* Right Panel: Guide/Output/AI Help */}
        <div className="w-full md:w-2/5 overflow-y-auto">
          {isLoadingExercises || !currentExercise || isLoadingExerciseDetails ? (
             <div className="p-4 h-full space-y-4">
                <Skeleton className="h-10 w-full mb-4" /> {/* Tabs skeleton */}
                <Skeleton className="h-8 w-1/3 mb-2" /> {/* Exercise title skeleton */}
                <Skeleton className="h-4 w-1/2 mb-1" /> {/* Badges skeleton */}
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-20 w-full" /> {/* Guide text/hints skeleton */}
             </div>
          ) : (
            <>
            <GuidePanel 
                currentExercise={currentExercise}
                runOutput={runOutput}
                isRunningCode={isRunningCode}
                runError={runError}
                showSettingsDialog={showSettingsDialog} // Pass state for settings dialog
                onShowSettingsDialogChange={setShowSettingsDialog} // Pass handler for settings dialog
                isLoadingExerciseDetails={isLoadingExerciseDetails}
                exerciseDetailLoadError={exerciseDetailLoadError}
            />
            {/* Moved SettingsDialog to be conditionally rendered by GuidePanel or here if global */}
            </>
          )}
        </div>
      </main>
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </div>
  );
}
