// This component is no longer used. The main layout is now defined in src/app/page.tsx
// for the RustlingsWeb interface.
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <>
        {children} 
   </>;
}
