// No lucide import needed if we replace Settings2

export function RustlingsLogo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-primary">
      {/* New RW Logo Mark */}
      <div
        className="relative h-7 w-7"
        aria-hidden="true" // Decorative, screen readers will read "RustlingsWeb"
      >
        <span
          className="absolute text-[26px] leading-none font-extrabold text-primary select-none"
          style={{ left: '2px', top: '1px', transform: 'scale(1, 1.05)' }} // R slightly taller
        >
          R
        </span>
        <span
          className="absolute text-[26px] leading-none font-extrabold text-accent select-none opacity-90"
          style={{ left: '10px', top: '3px', transform: 'scale(0.95, 1)' }} // W slightly narrower, overlapping
        >
          W
        </span>
      </div>
      <span>RustlingsWeb</span>
    </div>
  );
}
