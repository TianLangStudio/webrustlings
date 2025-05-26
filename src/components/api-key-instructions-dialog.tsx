
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface ApiKeyInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyInstructionsDialog({ open, onOpenChange }: ApiKeyInstructionsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>GEMINI_API_KEY Configuration Required</AlertDialogTitle>
          <AlertDialogDescription>
            To use the AI Help feature, you need to configure your Gemini API key.
            Please follow these steps:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm space-y-3 py-2 max-h-[60vh] overflow-y-auto">
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
            and sign in with your Google account.
          </p>
          <p>
            2. Click on &quot;Create API key&quot; to generate a new key. You might need to create or select a project if you haven&apos;t already.
          </p>
          <p>
            3. Copy the generated API key.
          </p>
          <p>
            4. In the root directory of this project, create a file named <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code> if it doesn&apos;t already exist.
          </p>
          <p>
            5. Add the following line to your <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code> file, replacing <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">YOUR_API_KEY_HERE</code> with the key you copied:
          </p>
          <pre className="bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto">
            GEMINI_API_KEY=YOUR_API_KEY_HERE
          </pre>
          <p>
            Alternatively, you can set the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">GOOGLE_API_KEY</code> environment variable.
          </p>
          <p>
            6. <strong className="text-destructive">Crucial Step:</strong> After creating or modifying the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code> file, you **must restart your development server** (the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">npm run dev</code> or similar command) for the changes to take effect.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
