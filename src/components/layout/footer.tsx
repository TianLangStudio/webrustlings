export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/50 py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} React Project Starter. All rights reserved.</p>
        <p className="mt-1">
          Built with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Next.js</a> and <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Tailwind CSS</a>.
        </p>
      </div>
    </footer>
  );
}
