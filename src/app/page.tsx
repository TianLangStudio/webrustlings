
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/editor-panel";
import { ExerciseSelector } from "@/components/exercise-selector";
import { GuidePanel, type RunOutput } from "@/components/guide-panel";
import { RustlingsLogo } from "@/components/rustlings-logo";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, RefreshCcw, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_BACKEND_URL = "https://rustlingsweb.tianlang.tech/execute";
const LOCAL_STORAGE_BACKEND_URL_KEY = "userBackendUrl";
const RUN_MARKER = "// I AM NOT DONE";
const EXERCISES_API_URL = "https://rustlingsweb.tianlang.tech/exercises";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  code: string;
  guide: string;
  hints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface ApiChapter {
  name: string;
  exercises: ApiExercise[];
}

interface ApiExercise {
  name: string;
  path: string;
  hint: string; // This is the main guide
  code: string;
  hints?: string[]; // Optional: actual hints array
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
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

  useEffect(() => {
    setIsClient(true);

    const fetchExercises = async () => {
      setIsLoadingExercises(true);
      setExerciseLoadError(null);
      try {
        const response = await fetch(EXERCISES_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
        }
        const chapters: ApiChapter[] = await response.json();
        
        const exercises: Exercise[] = [];
        chapters.forEach(chapter => {
          chapter.exercises.forEach(apiEx => {
            exercises.push({
              id: apiEx.path, // Use path as a unique ID
              name: apiEx.name,
              category: chapter.name,
              code: apiEx.code,
              guide: apiEx.hint, // API 'hint' is our 'guide'
              hints: apiEx.hints || [],
              difficulty: apiEx.difficulty || 'Easy',
              tags: apiEx.tags || [],
            });
          });
        });

        setAllExercises(exercises);
        if (exercises.length > 0) {
          setCurrentExercise(exercises[0]);
          setEditorCode(exercises[0].code);
        } else {
          setExerciseLoadError("No exercises found.");
        }
      } catch (error: any) {
        console.error("Failed to load exercises:", error);
        setExerciseLoadError(error.message || "An unknown error occurred while loading exercises.");
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    if (isClient && currentExercise) {
        setEditorCode(currentExercise.code);
        setRunOutput(null);
        setRunError(null);
    }
  }, [currentExercise, isClient]);

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
    if (!currentExercise) return;

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
        setShowSettingsDialog(true); 
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
  }, [editorCode, toast, currentExercise]);

  useEffect(() => {
    const previousCode = prevEditorCodeRef.current;
    prevEditorCodeRef.current = editorCode; 

    if (isClient && typeof previousCode === 'string' && 
        previousCode.includes(RUN_MARKER) && 
        !editorCode.includes(RUN_MARKER)) {
      if (!isRunningCode && currentExercise) { // Ensure currentExercise exists
        handleRunCode();
      }
    }
  }, [editorCode, isRunningCode, handleRunCode, isClient, currentExercise]);

  const currentExerciseIndex = currentExercise ? allExercises.findIndex(ex => ex.id === currentExercise.id) : -1;
  const progressPercentage = allExercises.length > 0 && currentExerciseIndex !== -1 && isClient ? ((currentExerciseIndex + 1) / allExercises.length) * 100 : 0;

  const handleExerciseSelect = (exercise: Exercise) => {
    setCurrentExercise(exercise);
  };

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExercise(allExercises[currentExerciseIndex - 1]);
    }
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < allExercises.length - 1) {
      setCurrentExercise(allExercises[currentExerciseIndex + 1]);
    }
  };

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
    // Render nothing or a very basic SSR placeholder if desired
    return null; 
  }
  
  if (isLoadingExercises && isClient) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Rustlings exercises...</p>
        <p className="text-sm text-muted-foreground">This might take a moment.</p>
      </div>
    );
  }

  if (exerciseLoadError && isClient) {
    return (
      <div className="flex flex-col h-screen bg-background text-destructive-foreground items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Exercises</h2>
        <p className="mb-4">{exerciseLoadError}</p>
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
            onExerciseSelect={handleExerciseSelect}
            exercises={allExercises}
            disabled={isLoadingExercises || !currentExercise}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous Exercise" onClick={goToPreviousExercise} disabled={isLoadingExercises || currentExerciseIndex <= 0 || isRunningCode}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise" onClick={goToNextExercise} disabled={isLoadingExercises || currentExerciseIndex === -1 || currentExerciseIndex >= allExercises.length - 1 || isRunningCode}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResetCode} disabled={isLoadingExercises || !currentExercise || isRunningCode}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
            onClick={handleRunCode}
            disabled={isLoadingExercises || !currentExercise || isRunningCode}
          >
            {isRunningCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningCode ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
         {isLoadingExercises ? <Skeleton className="h-2 w-full" /> : <Progress value={progressPercentage} className="w-full h-2" />}
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel: Code Editor */}
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          {isLoadingExercises || !currentExercise ? (
            <div className="p-4 h-full">
              <Skeleton className="h-8 w-1/4 mb-4" />
              <Skeleton className="h-full w-full" />
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
                <Skeleton className="h-10 w-full mb-4" /> {/* Tabs skeleton */}
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-20 w-full" />
             </div>
          ) : (
            <GuidePanel 
                currentExercise={currentExercise}
                runOutput={runOutput}
                isRunningCode={isRunningCode}
                runError={runError}
                showSettingsDialog={showSettingsDialog}
                onShowSettingsDialogChange={setShowSettingsDialog}
            />
          )}
        </div>
      </main>
    </div>
  );
}
