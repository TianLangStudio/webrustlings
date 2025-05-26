
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter }from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/editor-panel";
import { ExerciseSelector } from "@/components/exercise-selector";
import { GuidePanel, type RunOutput } from "@/components/guide-panel";
import { RustlingsLogo } from "@/components/rustlings-logo";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, RefreshCcw, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsDialog } from "@/components/settings-dialog";
import type { Exercise } from "@/lib/types";

const DEFAULT_BACKEND_URL = "https://rustlingsweb.tianlang.tech/execute";
const LOCAL_STORAGE_BACKEND_URL_KEY = "userBackendUrl";
const RUN_MARKER = "// I AM NOT DONE";

interface ExerciseViewClientProps {
  initialExercise: Exercise;
  allExercises: Exercise[];
}

export default function ExerciseViewClient({ initialExercise, allExercises }: ExerciseViewClientProps) {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(initialExercise);
  const [editorCode, setEditorCode] = useState<string>(initialExercise.code);
  const [isClient, setIsClient] = useState(false);
  const [runOutput, setRunOutput] = useState<RunOutput | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const { toast } = useToast();
  const prevEditorCodeRef = useRef<string>();
  const router = useRouter();

  // This effect updates the local state when the initialExercise prop changes (e.g., due to navigation)
  useEffect(() => {
    setCurrentExercise(initialExercise);
    setEditorCode(initialExercise.code);
    setRunOutput(null); // Clear previous run output
    setRunError(null);  // Clear previous run error
    // AI Help state in GuidePanel will reset based on currentExercise change internally
  }, [initialExercise]);

  useEffect(() => {
    setIsClient(true);
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
    if (!currentExercise || isRunningCode) return;

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
  }, [editorCode, toast, currentExercise, isRunningCode]); // Added isRunningCode

  useEffect(() => {
    const previousCode = prevEditorCodeRef.current;
    if (editorCode !== previousCode) {
        prevEditorCodeRef.current = editorCode;
    }

    if (isClient && typeof previousCode === 'string' && 
        currentExercise &&
        previousCode.includes(RUN_MARKER) && 
        !editorCode.includes(RUN_MARKER)) {
      if (!isRunningCode) { // Check if not already running
        handleRunCode();
      }
    }
  }, [editorCode, isRunningCode, handleRunCode, isClient, currentExercise]);

  const currentExerciseIndex = currentExercise ? allExercises.findIndex(ex => ex.id === currentExercise.id) : -1;
  const progressPercentage = allExercises.length > 0 && currentExerciseIndex !== -1 && isClient ? ((currentExerciseIndex + 1) / allExercises.length) * 100 : 0;

  const handleExerciseNavigation = (targetExercise: Exercise | undefined) => {
    if (targetExercise) {
      router.push(`/exercise/${targetExercise.id}`);
    }
  };
  
  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      handleExerciseNavigation(allExercises[currentExerciseIndex - 1]);
    }
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < allExercises.length - 1) {
      handleExerciseNavigation(allExercises[currentExerciseIndex + 1]);
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
    // Render skeleton or null on the server/first client render pass
    // This helps avoid hydration mismatches if some state is client-only initially
    return (
      <div className="flex flex-col h-screen bg-background text-foreground items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading exercise interface...</p>
      </div>
    ); 
  }


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <a 
              href="https://rustlingsweb.tianlang.tech/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="RustlingsWeb Homepage"
            >
              <RustlingsLogo />
            </a>
            <span className="text-xs text-muted-foreground mt-1">
              Developed by Gemini and <Link href="https://www.tianlang.tech" target="_blank" className="text-primary hover:underline">FusionZhu</Link>
            </span>
          </div>
          <ExerciseSelector 
            selectedExercise={currentExercise}
            onExerciseSelect={(exercise) => handleExerciseNavigation(exercise)} 
            exercises={allExercises}
            disabled={allExercises.length === 0 || isRunningCode}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Previous Exercise" onClick={goToPreviousExercise} disabled={currentExerciseIndex <= 0 || isRunningCode}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise" onClick={goToNextExercise} disabled={currentExerciseIndex === -1 || currentExerciseIndex >= allExercises.length - 1 || isRunningCode}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResetCode} disabled={!currentExercise || isRunningCode}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
            onClick={handleRunCode}
            disabled={!currentExercise || (currentExercise && !currentExercise.code) || isRunningCode}
          >
            {isRunningCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningCode ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
         {allExercises.length === 0 ? <Skeleton className="h-2 w-full" /> : <Progress value={progressPercentage} className="w-full h-2" />}
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel: Code Editor */}
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          {!currentExercise ? ( // Should not happen if initialExercise is always passed, but good fallback
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
          {!currentExercise ? ( 
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
                currentExercise={currentExercise} // This should always be the fully resolved exercise
                runOutput={runOutput}
                isRunningCode={isRunningCode}
                runError={runError}
                showSettingsDialog={showSettingsDialog} 
                onShowSettingsDialogChange={setShowSettingsDialog} 
                // These loading states are now handled by the server component or initial prop loading
                isLoadingExerciseDetails={false} 
                exerciseDetailLoadError={null}
                isLoadingSolution={false} // Solution is pre-fetched by server component
                solutionLoadError={null} // Solution error handled by server component
            />
            </>
          )}
        </div>
      </main>
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </div>
  );
}
