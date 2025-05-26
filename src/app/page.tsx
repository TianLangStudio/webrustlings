
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/editor-panel";
import { ExerciseSelector, exercises as allExercises, type Exercise } from "@/components/exercise-selector";
import { GuidePanel, type RunOutput } from "@/components/guide-panel";
import { RustlingsLogo } from "@/components/rustlings-logo";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, RefreshCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function RustlingsPage() {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(allExercises[0]);
  const [editorCode, setEditorCode] = useState<string>(allExercises[0].code);
  const [isClient, setIsClient] = useState(false);
  const [runOutput, setRunOutput] = useState<RunOutput | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    setIsClient(true);
    setEditorCode(currentExercise.code); // Reset editor code when exercise changes
    setRunOutput(null); // Clear previous run output
    setRunError(null); // Clear previous run error
  }, [currentExercise]);

  const handleExerciseSelect = (exercise: Exercise) => {
    setCurrentExercise(exercise);
  };

  const currentExerciseIndex = allExercises.findIndex(ex => ex.id === currentExercise.id);
  const progressPercentage = allExercises.length > 0 && isClient ? ((currentExerciseIndex + 1) / allExercises.length) * 100 : 0;

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
    setEditorCode(currentExercise.code);
    setRunOutput(null);
    setRunError(null);
    toast({
      title: "Code Reset",
      description: `Code for ${currentExercise.name} has been reset to its initial state.`,
    });
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setRunOutput(null);
    setRunError(null);

    const payload = {
      channel: "stable",
      mode: "debug",
      edition: "2021", // You might want to make this dynamic or match Rust Playground options
      crateType: "bin",
      tests: false,
      code: editorCode,
      backtrace: false,
    };

    try {
      // Call the external backend
      const response = await fetch('http://192.168.0.101:5001/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to parse error from backend, otherwise use generic message
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // If response.json() fails, it means the body wasn't valid JSON
            errorData = { error: `HTTP error! Status: ${response.status}. Response was not valid JSON.` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
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
      
      // Check for "Failed to fetch" specifically
      if (error.message && error.message.toLowerCase().includes("failed to fetch")) {
        userFriendlyErrorMessage = "Could not connect to the backend at http://192.168.0.101:5001. Please ensure the backend server is running, accessible from your network, and that CORS is configured correctly to allow requests from this application's origin.";
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
  };


  if (!isClient) {
    return null; 
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
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Previous Exercise" onClick={goToPreviousExercise} disabled={currentExerciseIndex === 0 || isRunningCode}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next Exercise" onClick={goToNextExercise} disabled={currentExerciseIndex === allExercises.length - 1 || isRunningCode}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResetCode} disabled={isRunningCode}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
            onClick={handleRunCode}
            disabled={isRunningCode}
          >
            {isRunningCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningCode ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card">
        <Progress value={progressPercentage} className="w-full h-2" />
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel: Code Editor */}
        <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          <EditorPanel 
            currentExercise={currentExercise}
            value={editorCode}
            onChange={setEditorCode}
          />
        </div>
        {/* Right Panel: Guide/Output/AI Help */}
        <div className="w-full md:w-2/5 overflow-y-auto">
          <GuidePanel 
            currentExercise={currentExercise}
            runOutput={runOutput}
            isRunningCode={isRunningCode}
            runError={runError}
          />
        </div>
      </main>
    </div>
  );
}
