import { useEffect } from "react";

import type { PrototypeSwitcherProps } from "@/types/components/prototype/prototype-switcher-props";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * PROTÓTIPO (spike/feed-mobile-ux): barra para alternar variações. Não vai para produção: só
 * aparece em `import.meta.env.DEV`.
 */
export function PrototypeSwitcher({ variants, current, onChange }: PrototypeSwitcherProps) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const go = (delta: number) =>
    onChange(variants[(index + delta + variants.length) % variants.length].key);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      if (el?.closest("input, textarea, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!import.meta.env.DEV) return null;

  const active = variants[index];

  return (
    <div className="fixed bottom-3 left-1/2 z-[2147483000] flex -translate-x-1/2 items-center gap-1 rounded-full bg-black px-1.5 py-1.5 text-white shadow-2xl ring-2 ring-yellow-400">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Variação anterior"
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[10rem] px-1 text-center font-mono text-xs">
        {active.key} — {active.name}
      </span>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Próxima variação"
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
