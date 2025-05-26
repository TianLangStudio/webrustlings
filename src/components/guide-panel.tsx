
'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent as TabContentPrimitive } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, Sparkles, Terminal, AlertTriangle, Loader2, Lightbulb } from "lucide-react";
import type { Exercise } from "@/app/page";
import { explainExercise, type ExplainExerciseOutput, type ExplainExerciseInput } from "@/ai/flows/explain-exercise-flow";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea"; // For displaying solution code

export interface RunOutput {
  success: boolean;
  stdout: string;
  stderr: string;
}

interface GuidePanelProps {
  currentExercise: Exercise | null;
  runOutput: RunOutput | null;
  isRunningCode: boolean;
  runError: string | null;
  showSettingsDialog: boolean;
  onShowSettingsDialogChange: (open: boolean) => void;
  isLoadingExerciseDetails: boolean;
  exerciseDetailLoadError: string | null;
  isLoadingSolution: boolean;
  solutionLoadError: string | null;
}

const LOCAL_STORAGE_API_KEY_NAME = "userLocalGeminiApiKey";

export function GuidePanel({ 
  currentExercise, 
  runOutput, 
  isRunningCode, 
  runError, 
  showSettingsDialog, 
  onShowSettingsDialogChange,
  isLoadingExerciseDetails,
  exerciseDetailLoadError,
  isLoadingSolution,
  solutionLoadError
}: GuidePanelProps) {
  const [aiHelp, setAiHelp] = useState<ExplainExerciseOutput | null>(null);
  const [isLoadingAiHelp, setIsLoadingAiHelp] = useState(false);
  const [aiHelpError, setAiHelpError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("guide");

  useEffect(() => {
    setAiHelp(null);
    setAiHelpError(null);
    
    // Determine default tab based on states
    if (activeTab !== 'ai-help') { // Don't switch away from AI help if user explicitly selected it
        if (isRunningCode || runOutput || runError) {
            setActiveTab("output");
        } else if (currentExercise && !isLoadingExerciseDetails && !exerciseDetailLoadError && activeTab === "output") {
            // If output tab was active but there's no longer output/run info, switch to guide (or solution if available)
            if (currentExercise.solutionCode && currentExercise.solutionFetched && !isLoadingSolution && !solutionLoadError) {
                // setActiveTab("solution"); // Or keep guide as primary default
                setActiveTab("guide");
            } else {
                setActiveTab("guide");
            }
        } else if (currentExercise && activeTab !== "guide" && activeTab !== "solution") {
             setActiveTab("guide"); // Fallback to guide if no other condition met
        }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise, isRunningCode, runOutput, runError, isLoadingExerciseDetails, exerciseDetailLoadError, isLoadingSolution, solutionLoadError ]); // Removed activeTab from deps here to stop it from overriding user choice
  

  useEffect(() => {
    // This effect ensures that if a run is triggered, the output tab becomes active.
    if ((runOutput || runError || isRunningCode) && activeTab !== "output" && activeTab !== "ai-help") {
      setActiveTab("output");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runOutput, runError, isRunningCode]);


  const handleGetAiHelp = async () => {
    if (!currentExercise || !currentExercise.code || !currentExercise.guide) {
      setAiHelpError("Exercise details are not fully loaded. Please wait or try reselecting the exercise.");
      return;
    }
    setIsLoadingAiHelp(true);
    setAiHelp(null);
    setAiHelpError(null);

    const userApiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY_NAME);
    const flowInput: ExplainExerciseInput = {
      exercise: currentExercise,
    };

    if (userApiKey) {
      flowInput.userApiKey = userApiKey;
    }

    try {
      const response = await explainExercise(flowInput);
      setAiHelp(response);
    } catch (error: any) {
      console.error("Error fetching AI help:", error);
      let errorMessage = "An unknown error occurred while fetching AI help.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      const upperErrorMessage = errorMessage.toUpperCase();
      const isMissingGlobalKeyError = (
        upperErrorMessage.includes("GEMINI_API_KEY") ||
        upperErrorMessage.includes("GOOGLE_API_KEY") ||
        (upperErrorMessage.includes("API KEY") && (upperErrorMessage.includes("PASS IN") || upperErrorMessage.includes("SET THE")))
      );
      
      const isInvalidUserKeyError = userApiKey && upperErrorMessage.includes("API_KEY_INVALID");

      if (isInvalidUserKeyError) {
        setAiHelpError("Your saved API key appears to be invalid. Please check it or try generating a new one in Settings.");
        onShowSettingsDialogChange(true); 
      } else if (isMissingGlobalKeyError && !userApiKey) {
        setAiHelpError("API Key is required. Please configure it using the Settings dialog.");
        onShowSettingsDialogChange(true);
      } else if (isMissingGlobalKeyError && userApiKey) {
        setAiHelpError("There was an issue with the API key. Please check your saved key or global configuration in Settings.");
        onShowSettingsDialogChange(true);
      }
      else {
        setAiHelpError(errorMessage);
      }
    } finally {
      setIsLoadingAiHelp(false);
    }
  };

  const difficultyColor = (difficulty?: Exercise['difficulty']) => {
    if (!difficulty) return 'border-border';
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-400/50';
      case 'Medium': return 'text-yellow-400 border-yellow-400/50';
      case 'Hard': return 'text-red-400 border-red-400/50';
      default: return 'border-border';
    }
  };

  const renderGuideContent = () => {
    if (isLoadingExerciseDetails) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" /> <Skeleton className="h-6 w-20" /> <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-12 w-full mt-2" />
        </div>
      );
    }

    if (exerciseDetailLoadError) {
      return (
        <div className="p-4 text-destructive flex flex-col items-center justify-center h-full">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error Loading Exercise Details</p>
          <p className="text-sm text-center mb-2">{exerciseDetailLoadError}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try Reloading Page</Button>
        </div>
      );
    }

    if (!currentExercise) {
      return <div className="p-4 text-muted-foreground">Select an exercise to see its guide.</div>;
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{currentExercise.name}</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3"/>{currentExercise.category}</Badge>
          <Badge variant="secondary" className={`${difficultyColor(currentExercise.difficulty)} gap-1`}><CheckCircle className="h-3 w-3"/>{currentExercise.difficulty}</Badge>
          {currentExercise.tags.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        
        <div>
          <p className="text-foreground/80 mb-2 whitespace-pre-line">
            {currentExercise.guide || "Guide not available."}
          </p>
        </div>

        {currentExercise.hints && currentExercise.hints.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Hints:</h4>
            <ul className="list-disc list-inside text-foreground/70 space-y-1 text-sm">
              {currentExercise.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
         {!currentExercise.guide && (!currentExercise.hints || currentExercise.hints.length === 0) && (
            <p className="text-muted-foreground italic">No guide or hints available for this exercise.</p>
        )}
      </div>
    );
  };

  const renderSolutionContent = () => {
    if (isLoadingSolution) {
      return (
        <div className="p-4 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Loading solution...</span>
        </div>
      );
    }
    if (solutionLoadError) {
      return (
        <div className="p-4 text-destructive flex flex-col items-center justify-center h-full">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error Loading Solution</p>
          <p className="text-sm text-center mb-2">{solutionLoadError}</p>
        </div>
      );
    }
    if (currentExercise && currentExercise.solutionFetched && !currentExercise.solutionCode) {
      return <div className="p-4 text-muted-foreground">Solution not available for this exercise.</div>;
    }
    if (currentExercise && currentExercise.solutionCode) {
      return (
        <Textarea
          value={currentExercise.solutionCode}
          readOnly
          className="h-full w-full resize-none rounded-none border-0 bg-muted/30 p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Exercise solution code"
        />
      );
    }
    // Fallback if solution hasn't been fetched yet (and not loading/error)
    return <div className="p-4 text-muted-foreground">Solution will be loaded when available.</div>;
  };


  return (
    <>
      <Card className="h-full flex flex-col bg-card border-none shadow-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <CardHeader className="px-4 pt-3 pb-0">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="solution">Solution <Lightbulb className="h-3.5 w-3.5 ml-1 opacity-70"/></TabsTrigger>
              <TabsTrigger value="ai-help">AI Help</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabContentPrimitive value="guide" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              {renderGuideContent()}
            </ScrollArea>
          </TabContentPrimitive>

          <TabContentPrimitive value="output" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold flex items-center gap-2"><Terminal className="h-4 w-4"/>Program Output</h4>
                    {runOutput && (
                        <Badge variant={runOutput.success ? "default" : "destructive"} className={runOutput.success ? "bg-green-600/80 text-white" : ""}>
                        {runOutput.success ? "Success" : "Failed"}
                        </Badge>
                    )}
                </div>
                <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm font-mono whitespace-pre-wrap break-all">
                  {isRunningCode && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Running code...</span>
                    </div>
                  )}
                  {!isRunningCode && runError && (
                    <div className="text-destructive">
                      <p className="font-semibold">Error:</p>
                      <p>{runError}</p>
                       {(runError.toLowerCase().includes("backend") || runError.toLowerCase().includes("url") || runError.toLowerCase().includes("settings")) && (
                         <Button variant="link" size="sm" className="p-0 h-auto text-destructive hover:underline" onClick={() => onShowSettingsDialogChange(true)}>
                           Check Backend URL in Settings
                         </Button>
                       )}
                    </div>
                  )}
                  {!isRunningCode && !runError && !runOutput && (
                    <p className="text-muted-foreground">&gt; Click "Run" to see output or solve the exercise.</p>
                  )}
                  {runOutput && (
                    <>
                      {runOutput.stdout && (
                        <div>
                          <p className="text-foreground/80 font-semibold">stdout:</p>
                          <p>{runOutput.stdout}</p>
                        </div>
                      )}
                      {runOutput.stderr && (
                        <div className="mt-2">
                          <p className="text-destructive font-semibold">stderr:</p>
                          <p className="text-destructive">{runOutput.stderr}</p>
                        </div>
                      )}
                       {!runOutput.stdout && !runOutput.stderr && runOutput.success && (
                        <p className="text-green-400">Compilation successful. No output.</p>
                       )}
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabContentPrimitive>

          <TabContentPrimitive value="solution" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-0"> {/* p-0 for textarea to fill */}
              {renderSolutionContent()}
            </ScrollArea>
          </TabContentPrimitive>

          <TabContentPrimitive value="ai-help" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent"/>AI Assistance</h4>
                  <Button 
                    onClick={handleGetAiHelp} 
                    disabled={isLoadingAiHelp || !currentExercise || isLoadingExerciseDetails || !currentExercise.code } 
                    size="sm" 
                    variant="outline"
                  >
                    {isLoadingAiHelp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting Help...
                      </>
                    ) : (
                      "Get AI Explanation"
                    )}
                  </Button>
                </div>

                 {isLoadingExerciseDetails && !aiHelp && !aiHelpError && (
                    <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading exercise details before AI help can be provided...</span>
                    </div>
                )}


                {aiHelpError && (
                  <div className="p-3 rounded-md bg-destructive/20 text-destructive-foreground border border-destructive flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{aiHelpError}</p>
                      {(aiHelpError.toLowerCase().includes("api key") || aiHelpError.toLowerCase().includes("settings")) && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-destructive-foreground hover:underline" onClick={() => onShowSettingsDialogChange(true)}>
                          Open Settings Dialog
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {!aiHelp && !isLoadingAiHelp && !aiHelpError && !isLoadingExerciseDetails && (
                  <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm flex items-center justify-center">
                    <p className="text-center">Click "Get AI Explanation" for help with the current exercise. <br /> You may need to configure your API key via the Settings dialog.</p>
                  </div>
                )}

                {aiHelp && (
                  <div className="space-y-6 text-sm">
                    <div>
                      <h5 className="font-semibold text-md mb-1">Explanation</h5>
                      <p className="text-foreground/80 whitespace-pre-line">{aiHelp.explanation}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-md mb-1">How to Pass</h5>
                      <p className="text-foreground/80 whitespace-pre-line">{aiHelp.howToPass}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-md mb-1">Learn More</h5>
                      <p className="text-foreground/80 whitespace-pre-line">{aiHelp.learnMore}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabContentPrimitive>
        </Tabs>
      </Card>
    </>
  );
}

