
'use client';

import { useState, useEffect } from "react";
import {
  AlertDialog,
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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCAL_STORAGE_API_KEY_NAME = "userLocalGeminiApiKey";
const LOCAL_STORAGE_BACKEND_URL_KEY = "userBackendUrl";
// Matching the default from page.tsx to show as a placeholder if nothing is stored
const DEFAULT_BACKEND_URL = "https://play.rust-lang.org/execute"; 

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savedKeyExists, setSavedKeyExists] = useState(false);
  const [backendUrlInput, setBackendUrlInput] = useState("");
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

      const storedBackendUrl = localStorage.getItem(LOCAL_STORAGE_BACKEND_URL_KEY);
      setBackendUrlInput(storedBackendUrl || ""); // Show empty if not set, placeholder will guide
    }
  }, [open]);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY_NAME, apiKeyInput.trim());
      setSavedKeyExists(true);
      toast({
        title: "API Key Saved",
        description: "Your API key has been saved in your browser's local storage.",
      });
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

  const handleSaveBackendUrl = () => {
    if (backendUrlInput.trim()) {
      localStorage.setItem(LOCAL_STORAGE_BACKEND_URL_KEY, backendUrlInput.trim());
      toast({
        title: "Backend URL Saved",
        description: "Your backend URL has been saved in your browser's local storage.",
      });
    } else {
      toast({
        title: "Error",
        description: "Backend URL cannot be empty. To use the default, leave it empty and clear any saved setting (though no explicit clear for URL here yet, saving empty won't work).",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Settings: API Key & Backend URL</AlertDialogTitle>
          <AlertDialogDescription>
            Configure your Gemini API Key and the backend URL for running Rust code.
            Changes are saved in your browser&apos;s local storage for this session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2">
          {/* API Key Section */}
          <div className="space-y-3 p-4 border rounded-md bg-card/50">
            <h3 className="font-semibold text-md">Gemini API Key Configuration</h3>
            <div className="space-y-1">
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
                  An API key is currently saved. Saving a new one will overwrite it.
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSaveKey} size="sm">Save API Key</Button>
              {savedKeyExists && (
                <Button onClick={handleClearKey} variant="outline" size="sm">
                  Clear Saved API Key
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              For global configuration (recommended for development):
              <br />1. Get key from{" "}
              <Link
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </Link>.
              <br />2. Create <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code> with <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">GEMINI_API_KEY=YOUR_KEY</code> or set <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">GOOGLE_API_KEY</code>.
              <br />3. <strong className="text-destructive">Restart dev server</strong> after changes.
            </p>
          </div>

          {/* Backend URL Section */}
          <div className="space-y-3 p-4 border rounded-md bg-card/50">
            <h3 className="font-semibold text-md">Backend URL Configuration</h3>
             <div className="space-y-1">
              <Label htmlFor="backendUrlInput">Backend Execute URL (Stored Locally)</Label>
              <Input
                id="backendUrlInput"
                type="url"
                placeholder={`e.g., ${DEFAULT_BACKEND_URL}`}
                value={backendUrlInput}
                onChange={(e) => setBackendUrlInput(e.target.value)}
                className="text-xs"
              />
              <p className="text-xs text-muted-foreground">
                This is the endpoint for code execution. If empty, app uses default: <code className="text-xs font-mono">{DEFAULT_BACKEND_URL}</code>.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSaveBackendUrl} size="sm">Save Backend URL</Button>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
