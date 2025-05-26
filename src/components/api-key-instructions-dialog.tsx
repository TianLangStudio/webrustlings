
'use client';

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCAL_STORAGE_API_KEY_NAME = "userLocalGeminiApiKey";

export function ApiKeyInstructionsDialog({ open, onOpenChange }: ApiKeyInstructionsDialogProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savedKeyExists, setSavedKeyExists] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const storedKey = localStorage.getItem(LOCAL_STORAGE_API_KEY_NAME);
      if (storedKey) {
        setApiKeyInput(storedKey);
        setSavedKeyExists(true);
      } else {
        setApiKeyInput("");
        setSavedKeyExists(false);
      }
    }
  }, [open]);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY_NAME, apiKeyInput.trim());
      setSavedKeyExists(true);
      toast({
        title: "API Key Saved",
        description: "Your API key has been saved in your browser's local storage for this session.",
      });
      onOpenChange(false); // Close dialog after saving
    } else {
      toast({
        title: "Error",
        description: "API Key cannot be empty.",
        variant: "destructive",
      });
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_API_KEY_NAME);
    setApiKeyInput("");
    setSavedKeyExists(false);
    toast({
      title: "API Key Cleared",
      description: "Your saved API key has been removed from local storage.",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Configure Your Gemini API Key</AlertDialogTitle>
          <AlertDialogDescription>
            To use the AI Help feature, you need a Gemini API key. You can provide one below to be stored in your browser for this session, or set it globally.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="apiKeyInput">Enter API Key (Stored Locally)</Label>
            <Input
              id="apiKeyInput"
              type="password"
              placeholder="Enter your Gemini API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="text-xs"
            />
            {savedKeyExists && (
              <p className="text-xs text-muted-foreground">
                An API key is currently saved in your browser&apos;s local storage. Saving a new one will overwrite it.
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSaveKey} size="sm">Save Key Locally</Button>
              {savedKeyExists && (
                <Button onClick={handleClearKey} variant="outline" size="sm">
                  Clear Saved Key
                </Button>
              )}
            </div>
          </div>

          <hr className="my-4 border-border" />

          <p className="font-medium">Global Configuration (Recommended for Development):</p>
          <p>
            1. Go to{" "}
            <Link
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio (MakerSuite)
            </Link>{" "}
            and sign in.
          </p>
          <p>
            2. Click &quot;Create API key&quot; to generate one.
          </p>
          <p>
            3. Create a file named <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code> in the project root.
          </p>
          <p>
            4. Add to <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code>:
          </p>
          <pre className="bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto">
            GEMINI_API_KEY=YOUR_API_KEY_HERE
          </pre>
          <p>
            Alternatively, set the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">GOOGLE_API_KEY</code> environment variable.
          </p>
          <p>
            5. <strong className="text-destructive">Crucial:</strong> Restart your development server after changes to <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code>.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
