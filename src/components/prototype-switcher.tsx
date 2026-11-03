// PROTOTYPE — barra flutuante para alternar variantes de um spike de UI. Não vai para produção.
import { useEffect } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function PrototypeSwitcher({
  variants,
  current,
  onChange,
}: {
  variants: { key: string; name: string }[];
  current: string;
  onChange: (key: string) => void;
}) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const go = (delta: number) =>
    onChange(variants[(index + delta + variants.length) % variants.length].key);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-2 py-1.5 font-mono text-xs text-white shadow-2xl ring-2 ring-yellow-400">
      <button
        type="button"
        aria-label="Variante anterior"
        onClick={() => go(-1)}
        className="rounded-full p-1 hover:bg-white/20"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="px-1 whitespace-nowrap">
        {variants[index].key} — {variants[index].name}
      </span>

      <button
        type="button"
        aria-label="Próxima variante"
        onClick={() => go(1)}
        className="rounded-full p-1 hover:bg-white/20"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
