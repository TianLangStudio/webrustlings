
'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, MessageSquare, Sparkles, Terminal, AlertTriangle, Loader2 } from "lucide-react";
import type { Exercise } from "./exercise-selector";
import { explainExercise, type ExplainExerciseOutput } from "@/ai/flows/explain-exercise-flow";
import { ScrollArea } from "./ui/scroll-area";

interface GuidePanelProps {
  currentExercise: Exercise;
}

export function GuidePanel({ currentExercise }: GuidePanelProps) {
  const [aiHelp, setAiHelp] = useState<ExplainExerciseOutput | null>(null);
  const [isLoadingAiHelp, setIsLoadingAiHelp] = useState(false);
  const [aiHelpError, setAiHelpError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("guide");

  // Reset AI help when exercise changes and tab is not AI Help
  useEffect(() => {
    if (activeTab !== "ai-help") {
      setAiHelp(null);
      setAiHelpError(null);
    }
  }, [currentExercise, activeTab]);

  const handleGetAiHelp = async () => {
    setIsLoadingAiHelp(true);
    setAiHelp(null);
    setAiHelpError(null);
    try {
      const response = await explainExercise({ exercise: currentExercise });
      setAiHelp(response);
    } catch (error) {
      console.error("Error fetching AI help:", error);
      let errorMessage = "An unknown error occurred while fetching AI help.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      if (errorMessage.includes("Please pass in the API key") || errorMessage.includes("GEMINI_API_KEY") || errorMessage.includes("GOOGLE_API_KEY")) {
        setAiHelpError("It looks like the AI service API key is not configured. Please set the GEMINI_API_KEY or GOOGLE_API_KEY environment variable. For more details, refer to the Genkit documentation on Google AI.");
      } else {
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
    <Card className="h-full flex flex-col bg-card border-none shadow-none">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <CardHeader className="px-4 pt-3 pb-0">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="ai-help">AI Help</TabsTrigger>
          </TabsList>
        </CardHeader>
        
        <TabsContent value="guide" className="flex-grow overflow-hidden mt-0">
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
        </TabsContent>

        <TabsContent value="output" className="flex-grow overflow-hidden mt-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2"><Terminal className="h-4 w-4"/>Program Output</h4>
              <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm font-mono">
                <p>&gt; Waiting for run...</p>
                {/* Example output:
                <p className="text-green-400">Compilation successful!</p>
                <p>Hello and welcome to Rust!</p>
                <p className="text-red-400">Error: Variable \`x\` not found.</p>
                */}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ai-help" className="flex-grow overflow-hidden mt-0">
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
                <div className="p-3 rounded-md bg-destructive/20 text-destructive-foreground border border-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{aiHelpError}</p>
                  </div>
                </div>
              )}

              {!aiHelp && !isLoadingAiHelp && !aiHelpError && (
                <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm flex items-center justify-center">
                  <p>Click "Get AI Explanation" for help with the current exercise.</p>
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
        </TabsContent>
      </Tabs>
    </Card>
  );
}
