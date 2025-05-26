
'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent as TabContentPrimitive } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, MessageSquare, Sparkles, Terminal, AlertTriangle, Loader2 } from "lucide-react";
import type { Exercise } from "@/app/page"; // Import Exercise type from page.tsx
import { explainExercise, type ExplainExerciseOutput, type ExplainExerciseInput } from "@/ai/flows/explain-exercise-flow";
import { ScrollArea } from "./ui/scroll-area";
import { SettingsDialog } from "./settings-dialog"; // Updated import

export interface RunOutput {
  success: boolean;
  stdout: string;
  stderr: string;
}

interface GuidePanelProps {
  currentExercise: Exercise; // Assume currentExercise is always provided when this panel is rendered
  runOutput: RunOutput | null;
  isRunningCode: boolean;
  runError: string | null;
  showSettingsDialog: boolean;
  onShowSettingsDialogChange: (open: boolean) => void;
}

const LOCAL_STORAGE_API_KEY_NAME = "userLocalGeminiApiKey";

export function GuidePanel({ currentExercise, runOutput, isRunningCode, runError, showSettingsDialog, onShowSettingsDialogChange }: GuidePanelProps) {
  const [aiHelp, setAiHelp] = useState<ExplainExerciseOutput | null>(null);
  const [isLoadingAiHelp, setIsLoadingAiHelp] = useState(false);
  const [aiHelpError, setAiHelpError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("guide");
  // showSettingsDialog state is now managed by parent (page.tsx)

  useEffect(() => {
    // Clear AI help when exercise changes
    setAiHelp(null);
    setAiHelpError(null);
    
    // Switch to output tab if code is running or has new output/error, unless AI help is active
    if ((isRunningCode || runOutput || runError) && activeTab !== 'ai-help') {
      setActiveTab("output");
    } else if (!isRunningCode && !runOutput && !runError && activeTab === "output") {
      // If no output and current tab is output, switch back to guide
      setActiveTab("guide");
    }

  }, [currentExercise, isRunningCode, runOutput, runError]); // Removed activeTab from deps to avoid loop
  
  useEffect(() => {
    // Effect to switch to output tab when new output/error arrives
    if ((runOutput || runError || isRunningCode) && activeTab !== "output") {
      // Only switch if not already on output, to avoid forcing user away from other tabs
      // if they manually switched after run started.
      // Let's be more assertive: if there's an output/error, show it.
      setActiveTab("output");
    }
  }, [runOutput, runError, isRunningCode]);


  const handleGetAiHelp = async () => {
    setIsLoadingAiHelp(true);
    setAiHelp(null);
    setAiHelpError(null);

    const userApiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY_NAME);
    const flowInput: ExplainExerciseInput = {
      exercise: currentExercise, // currentExercise is guaranteed to be non-null here
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

  const difficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-400/50';
      case 'Medium': return 'text-yellow-400 border-yellow-400/50';
      case 'Hard': return 'text-red-400 border-red-400/50';
      default: return 'border-border';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col bg-card border-none shadow-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <CardHeader className="px-4 pt-3 pb-0">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="ai-help">AI Help</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabContentPrimitive value="guide" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
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
                    {currentExercise.guide}
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
              </div>
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
                       {(runError.toLowerCase().includes("backend") || runError.toLowerCase().includes("url")) && (
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

          <TabContentPrimitive value="ai-help" className="flex-grow overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent"/>AI Assistance</h4>
                  <Button onClick={handleGetAiHelp} disabled={isLoadingAiHelp} size="sm" variant="outline">
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

                {!aiHelp && !isLoadingAiHelp && !aiHelpError && (
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
      <SettingsDialog open={showSettingsDialog} onOpenChange={onShowSettingsDialogChange} />
    </>
  );
}

