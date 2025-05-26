import { Settings2 } from 'lucide-react';

export function RustlingsLogo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-primary">
      <div className="relative h-7 w-7">
        <Settings2 className="h-6 w-6 absolute top-0 left-0 transform rotate-[-15deg]" />
        <Settings2 className="h-6 w-6 absolute top-1 left-1 transform rotate-[15deg] opacity-75" />
      </div>
      <span>RustlingsWeb</span>
    </div>
  );
}
