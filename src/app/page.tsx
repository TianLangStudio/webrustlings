
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
const EXERCISE_DETAIL_API_URL_BASE = "https://rustlingsweb.tianlang.tech/exercises"; // Base for single exercise code
const EXERCISE_SOLUTION_API_URL_BASE = "https://rustlingsweb.tianlang.tech/solutions"; // Base for single exercise solution


// Interface for what the /exercises list API returns for each exercise
interface ApiExercise {
  name: string;
  path: string; // Used as ID
  directory: string;
  hint?: string; // Used as guide
  code?: string; // Initial code from list
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
  id: string;
  name: string;
  category: string;
  directory: string;
  code: string; // Can be placeholder initially, then fetched
  guide: string; // Can be placeholder initially
  hints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  solutionCode?: string;
  solutionFetched?: boolean;
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

  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseLoadError, setExerciseLoadError] = useState<string | null>(null);

  const [isLoadingExerciseDetails, setIsLoadingExerciseDetails] = useState(false);
  const [exerciseDetailLoadError, setExerciseDetailLoadError] = useState<string | null>(null);

  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [solutionLoadError, setSolutionLoadError] = useState<string | null>(null);


  const fetchSingleExerciseDetails = useCallback(async (directory: string, name: string): Promise<string> => {
    if (!directory || !name) {
      throw new Error(`Exercise directory or name is invalid. Cannot fetch details.`);
    }
    const detailUrl = `${EXERCISE_DETAIL_API_URL_BASE}/${directory}/${name}`;
    const response = await fetch(detailUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch exercise details for ${directory}/${name}: ${response.status} ${response.statusText}`);
    }
    return response.text(); // Expecting plain text code
  }, []);

  const fetchExerciseSolution = useCallback(async (directory: string, name: string): Promise<string | null> => {
    if (!directory || !name) {
      console.warn(`Exercise directory or name is invalid. Cannot fetch solution.`);
      return null;
    }
    const solutionUrl = `${EXERCISE_SOLUTION_API_URL_BASE}/${directory}/${name}`;
    try {
      const response = await fetch(solutionUrl);
      if (response.status === 404) {
        return null; // Solution not found, not an error for the user here
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch exercise solution for ${directory}/${name}: ${response.status} ${response.statusText}`);
      }
      return response.text();
    } catch (error) {
      console.error(`Error fetching solution for ${directory}/${name}:`, error);
      throw error; 
    }
  }, []);

  const selectExercise = useCallback(async (exerciseToSelect: Exercise | null) => {
    if (!exerciseToSelect || !exerciseToSelect.id) { // Ensure exerciseToSelect and its id are valid
        setCurrentExercise(null);
        setEditorCode("");
        setRunOutput(null);
        setRunError(null);
        return;
    }

    // Preserve solution if switching to the same exercise, otherwise reset.
    setCurrentExercise(prev => ({
        ...exerciseToSelect, 
        solutionCode: (prev && prev.id === exerciseToSelect.id) ? prev.solutionCode : undefined, 
        solutionFetched: (prev && prev.id === exerciseToSelect.id) ? prev.solutionFetched : false 
    }));
    setEditorCode(exerciseToSelect.code); 
    setRunOutput(null);
    setRunError(null);
    
    setIsLoadingExerciseDetails(true);
    setExerciseDetailLoadError(null);
    // Reset solution loading state for the new exercise unless it was already fetched
    if (!exerciseToSelect.solutionFetched) {
      setIsLoadingSolution(false);
      setSolutionLoadError(null);
    }


    let fetchedCode = exerciseToSelect.code;
    let updatedExerciseWithCode = { ...exerciseToSelect };

    try {
      fetchedCode = await fetchSingleExerciseDetails(exerciseToSelect.directory, exerciseToSelect.name);
      updatedExerciseWithCode = {
        ...exerciseToSelect,
        code: fetchedCode,
      };
      // Preserve solution details from the current state if they exist for this exercise
      setCurrentExercise(prev => ({
        ...updatedExerciseWithCode, 
        solutionCode: prev?.id === updatedExerciseWithCode.id ? prev.solutionCode : undefined, 
        solutionFetched: prev?.id === updatedExerciseWithCode.id ? prev.solutionFetched : false
      }));
      setAllExercises(prevExercises => 
        prevExercises.map(ex => ex.id === updatedExerciseWithCode.id ? updatedExerciseWithCode : ex)
      );
      setEditorCode(updatedExerciseWithCode.code);
    } catch (error: any) {
      console.error("Failed to load exercise details:", error);
      setExerciseDetailLoadError(error.message || "An unknown error occurred while loading exercise details.");
    } finally {
      setIsLoadingExerciseDetails(false);
    }

    // Fetch solution for the (potentially updated) exercise
    // Only fetch if it hasn't been fetched before or if a previous attempt for this exercise had an error.
    const currentExerciseForSolution = allExercises.find(ex => ex.id === updatedExerciseWithCode.id) || updatedExerciseWithCode;

    if (currentExerciseForSolution && (!currentExerciseForSolution.solutionFetched || (currentExerciseForSolution.solutionFetched && solutionLoadError && currentExercise?.id === currentExerciseForSolution.id))) {
      setIsLoadingSolution(true);
      setSolutionLoadError(null); // Clear previous solution error for this attempt
      try {
        const fetchedSolutionCode = await fetchExerciseSolution(currentExerciseForSolution.directory, currentExerciseForSolution.name);
        
        const finalExerciseState = { 
          ...currentExerciseForSolution, 
          code: updatedExerciseWithCode.code, 
          solutionCode: fetchedSolutionCode ?? undefined,
          solutionFetched: true 
        };
        setCurrentExercise(finalExerciseState);
        setAllExercises(prevExercises => 
          prevExercises.map(ex => ex.id === finalExerciseState.id ? finalExerciseState : ex)
        );

      } catch (error: any) {
        console.error("Failed to load exercise solution:", error);
        setSolutionLoadError(error.message || "An unknown error occurred while loading the solution.");
        setCurrentExercise(prev => prev && prev.id === currentExerciseForSolution.id ? {...prev, solutionFetched: true, code: updatedExerciseWithCode.code } : prev);
        setAllExercises(prevExercises => 
          prevExercises.map(ex => ex.id === currentExerciseForSolution.id ? {...ex, solutionFetched: true, code: updatedExerciseWithCode.code } : ex)
        );
      } finally {
        setIsLoadingSolution(false);
      }
    } else if (currentExerciseForSolution && currentExerciseForSolution.solutionFetched) {
        setCurrentExercise(prev => ({
            ...currentExerciseForSolution,
            code: updatedExerciseWithCode.code, 
            solutionCode: currentExerciseForSolution.solutionCode,
            solutionFetched: currentExerciseForSolution.solutionFetched,
        }));
    }


  }, [fetchSingleExerciseDetails, fetchExerciseSolution, solutionLoadError, currentExercise, allExercises]); 


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
            // Filter out "00_intro/intro2"
            if (apiEx.path === "00_intro/intro2") {
              return; // Skip this exercise
            }

            const exerciseId = apiEx.path || `${chapter.name.toLowerCase().replace(/\s+/g, '-')}-${apiEx.name.toLowerCase().replace(/\s+/g, '-')}`;
            exercises.push({
              id: exerciseId,
              name: apiEx.name || "Unnamed Exercise",
              category: chapter.name || "Uncategorized",
              directory: apiEx.directory || "",
              code: apiEx.code || `// Code for ${apiEx.name || "this exercise"} will be loaded...\n\n\n\n\n\n\n// ${RUN_MARKER}`,
              guide: apiEx.hint || `Guide for ${apiEx.name || "this exercise"} not available from initial list.`,
              hints: apiEx.hints || [],
              difficulty: apiEx.difficulty || 'Easy',
              tags: apiEx.tags || [],
              solutionFetched: false, 
            });
          });
        });

        setAllExercises(exercises);
        if (exercises.length > 0) {
          await selectExercise(exercises[0]);
        } else {
          setExerciseLoadError("No exercises found in the list.");
          setCurrentExercise(null);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const getBackendUrl = (): string => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem(LOCAL_STORAGE_BACKEND_URL_KEY);
      if (savedUrl && savedUrl.trim() !== "") {
        return savedUrl;
      }
    }
    return DEFAULT_BACKEND_URL;
  };

  const handleRunCode = useCallback(async () => {
    if (!currentExercise || isLoadingExerciseDetails || isRunningCode) return;

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
        userFriendlyErrorMessage = `Could not connect to the backend at ${backendUrl}. Please ensure it's running, accessible, and CORS is configured. You can change the URL in Settings.`;
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
  }, [editorCode, toast, currentExercise, isLoadingExerciseDetails, isRunningCode]);

  useEffect(() => {
    const previousCode = prevEditorCodeRef.current;
    if (editorCode !== previousCode) {
        prevEditorCodeRef.current = editorCode;
    }

    if (isClient && typeof previousCode === 'string' && 
        currentExercise && !isLoadingExerciseDetails && !isLoadingSolution &&
        previousCode.includes(RUN_MARKER) && 
        !editorCode.includes(RUN_MARKER)) {
      if (!isRunningCode) {
        handleRunCode();
      }
    }
  }, [editorCode, isRunningCode, handleRunCode, isClient, currentExercise, isLoadingExerciseDetails, isLoadingSolution]);

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
    if (currentExercise) { 
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
  
  if (isLoadingExercises && isClient) { 
    return (
      <div className="flex flex-col h-screen bg-background text-foreground items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Rustlings exercises list...</p>
      </div>
    );
  }

  if (exerciseLoadError && isClient) { 
    return (
      <div className="flex flex-col h-screen bg-background text-destructive-foreground items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Exercises List</h2>
        <p className="mb-4">{exerciseLoadError}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!isLoadingExercises && allExercises.length === 0 && isClient) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Exercises Available</h2>
        <p className="mb-4">The exercise list is empty. Please check the data source or API.</p>
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
            onExerciseSelect={selectExercise} 
            exercises={allExercises}
            disabled={isLoadingExercises || allExercises.length === 0 || isLoadingExerciseDetails || isLoadingSolution}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Previous Exercise" onClick={goToPreviousExercise} disabled={isLoadingExercises || isLoadingExerciseDetails || isLoadingSolution || currentExerciseIndex <= 0 || isRunningCode}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise" onClick={goToNextExercise} disabled={isLoadingExercises || isLoadingExerciseDetails || isLoadingSolution || currentExerciseIndex === -1 || currentExerciseIndex >= allExercises.length - 1 || isRunningCode}>
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
            disabled={isLoadingExercises || isLoadingExerciseDetails || !currentExercise || (currentExercise && !currentExercise.code) || isRunningCode}
          >
            {isRunningCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningCode ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
         {(isLoadingExercises || (currentExercise && (isLoadingExerciseDetails || isLoadingSolution))) ? <Skeleton className="h-2 w-full" /> : <Progress value={progressPercentage} className="w-full h-2" />}
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel: Code Editor */}
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          {isLoadingExercises || !currentExercise || isLoadingExerciseDetails ? (
            <div className="p-4 h-full flex flex-col">
              <Skeleton className="h-8 w-1/4 mb-4" /> 
              <div className="flex-grow">
                <Skeleton className="h-full w-full" /> 
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
          {isLoadingExercises || !currentExercise ? ( 
             <div className="p-4 h-full space-y-4">
                <Skeleton className="h-10 w-full mb-4" /> 
                <Skeleton className="h-8 w-1/3 mb-2" /> 
                <Skeleton className="h-4 w-1/2 mb-1" /> 
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-20 w-full" /> 
             </div>
          ) : (
            <>
            <GuidePanel 
                currentExercise={currentExercise}
                runOutput={runOutput}
                isRunningCode={isRunningCode}
                runError={runError}
                showSettingsDialog={showSettingsDialog} 
                onShowSettingsDialogChange={setShowSettingsDialog} 
                isLoadingExerciseDetails={isLoadingExerciseDetails}
                exerciseDetailLoadError={exerciseDetailLoadError}
                isLoadingSolution={isLoadingSolution}
                solutionLoadError={solutionLoadError}
            />
            </>
          )}
        </div>
      </main>
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </div>
  );
}
    

    

    