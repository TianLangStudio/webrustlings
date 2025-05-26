'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, MessageSquare, Sparkles, Terminal } from "lucide-react";

export function GuidePanel() {
  return (
    <Card className="h-full flex flex-col bg-card border-none shadow-none">
      <Tabs defaultValue="guide" className="flex-grow flex flex-col">
        <CardHeader className="px-4 pt-3 pb-0">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="ai-help">AI Help</TabsTrigger>
          </TabsList>
        </CardHeader>
        
        <TabsContent value="guide" className="flex-grow overflow-y-auto p-4 mt-0">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Intro 1: Remove 'I AM NOT DONE'</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3"/>00. Introduction</Badge>
              <Badge variant="secondary" className="text-green-400 border-green-400/50 gap-1"><CheckCircle className="h-3 w-3"/>Easy</Badge>
              <Badge variant="outline">basics</Badge>
              <Badge variant="outline">comments</Badge>
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Summarize Instructions (AI)
            </Button>
            <div>
              <p className="text-foreground/80 mb-2">
                Welcome to RustlingsWeb! This is a very simple first exercise. The main goal is to get you familiar with the "I AM NOT DONE" problem we use in Rustlings to track your progress. Remove the '// I AM NOT DONE' comment from the code to make the program print its message.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Hints:</h4>
              <ul className="list-disc list-inside text-foreground/70 space-y-1 text-sm">
                <li>Simply delete the line that says `// I AM NOT DONE`.</li>
                <li>Ensure the `main` function and its `println!` macro remain.</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="output" className="flex-grow overflow-y-auto p-4 mt-0">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><Terminal className="h-4 w-4"/>Program Output</h4>
            <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm font-mono">
              <p>&gt; Waiting for run...</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="ai-help" className="flex-grow overflow-y-auto p-4 mt-0">
           <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4"/>AI Assistance</h4>
            <div className="p-3 rounded-md bg-muted/50 min-h-[100px] text-sm">
              <p>AI Help is not yet implemented. Ask for hints or explanations about your code here.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
