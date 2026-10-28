/**
 * PROTÓTIPO (spike/feed-mobile-ux) — descartável.
 *
 * Pergunta: "como o topo do feed deveria ficar no celular?". Três variações do composer e do
 * seletor de feed na própria rota /feed, trocadas por `?variant=A|B|C` (sem o parâmetro, a tela
 * atual). Os dados são os reais da rota; publicar está DESLIGADO (só mostra um aviso).
 */
import { useState } from "react";

import { TOPIC_LABELS } from "@/constants/community-topics";
import { POST_TYPES } from "@/constants/post-types";
import type { FeedMobilePrototypeProps } from "@/types/components/prototype/feed-mobile-prototype-props";
import { UserAvatar } from "@rede-enois/design-system/domain";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  useToast,
} from "@rede-enois/design-system/ui";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  Hash,
  Image,
  Pencil,
  SlidersHorizontal,
  Type,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { MentionTextarea } from "@/components/mention-textarea";

const TYPES = POST_TYPES.filter((t) => t.id !== "BUSINESS");
const TOPICS = Object.entries(TOPIC_LABELS).slice(0, 12);

/** Uma frase por tipo: é o que faz o "começar pelo tipo" (variação C) explicar cada um. */
const TYPE_HINTS: Record<string, string> = {
  INSIGHT: "Algo que você aprendeu",
  ARTICLE: "Texto longo, com título",
  QUESTION: "Peça ajuda ou opinião",
  PROJECT: "Mostre o que construiu",
  OPPORTUNITY: "Vaga, bolsa ou evento",
  NEWS: "Novidade da área",
  TUTORIAL: "Passo a passo",
  REVIEW: "Avalie curso, livro, ferramenta",
  DIVERTIDO: "Meme e descontração",
  MOMENT: "Some em 24h",
  PAGE: "Mini página em HTML",
};

const PLACEHOLDERS: Record<string, string> = {
  INSIGHT: "Compartilhe algo que aprendeu hoje…",
  QUESTION: "Qual é a sua dúvida?",
  PROJECT: "Conte sobre o seu projeto…",
  NEWS: "Qual é a novidade?",
  TUTORIAL: "Explique o passo a passo…",
};

function typeOf(id: string) {
  return TYPES.find((t) => t.id === id) ?? TYPES[0];
}

function usePublishStub() {
  const { toast } = useToast();
  return () => toast("Protótipo: publicar está desligado nesta variação.", "success");
}

/* ------------------------------------------------------------------------------------------ */
/* Peças pequenas, de propósito duplicadas entre variações (cada uma é livre para divergir).   */
/* ------------------------------------------------------------------------------------------ */

function TopicPicker({ topic, onTopic }: { topic: string; onTopic: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs",
            topic
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border-soft text-text-subtle",
          )}
        >
          <Hash className="h-3.5 w-3.5" />
          {topic ? TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] : "Assunto"}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 p-1">
        <div className="flex max-h-64 flex-col overflow-y-auto">
          {TOPICS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onTopic(key === topic ? "" : key);
                setOpen(false);
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-2"
            >
              {label}
              {key === topic && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TypePicker({ type, onType }: { type: string; onType: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = typeOf(type);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border-soft px-3 py-1.5 text-xs text-text-strong"
        >
          <current.icon className="h-3.5 w-3.5 text-primary" />
          {current.label}
          <ChevronDown className="h-3 w-3 text-text-subtle" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-60 p-1">
        <div className="flex max-h-72 flex-col overflow-y-auto">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onType(t.id);
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-2"
            >
              <t.icon className="h-4 w-4 text-primary" />

              <span className="flex-1">{t.label}</span>

              <span className="text-[11px] text-text-subtle">{TYPE_HINTS[t.id]}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* A — Compacto: composer recolhido numa linha + abas roláveis fixas no topo.                  */
/* ------------------------------------------------------------------------------------------ */

function VariantA(props: FeedMobilePrototypeProps) {
  const publish = usePublishStub();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [type, setType] = useState("INSIGHT");
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState(false);

  return (
    <>
      {!open ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-card p-3">
          <UserAvatar src={props.profile?.avatar} alt={props.profile?.name} className="h-9 w-9" />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 truncate rounded-full bg-surface-2 px-4 py-2.5 text-left text-sm text-text-subtle"
          >
            Compartilhe algo que aprendeu hoje…
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Adicionar mídia"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-subtle hover:bg-surface-2"
          >
            <Image className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/40 bg-surface-card p-3">
          <div className="flex items-start gap-3">
            <UserAvatar src={props.profile?.avatar} alt={props.profile?.name} className="h-9 w-9" />
            <MentionTextarea
              value={draft}
              onChange={(v) => setDraft(v)}
              placeholder={PLACEHOLDERS[type] ?? PLACEHOLDERS.INSIGHT}
              className="min-h-[96px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-base"
              toolbar={format}
            />
          </div>

          {/* Uma linha só, rolando de lado: nada quebra em três linhas no celular. */}
          <div className="-mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
            <TypePicker type={type} onType={setType} />
            <TopicPicker topic={topic} onTopic={setTopic} />

            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border-soft px-3 py-1.5 text-xs text-text-subtle"
            >
              <Image className="h-3.5 w-3.5" />
              Mídia
            </button>

            <button
              type="button"
              onClick={() => setFormat((f) => !f)}
              aria-pressed={format}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs",
                format
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border-soft text-text-subtle",
              )}
            >
              <Type className="h-3.5 w-3.5" />
              Formatar
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border-soft pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-text-subtle"
            >
              Cancelar
            </button>

            <span className="ml-auto text-xs tabular-nums text-text-subtle">
              {draft.length > 0 ? `${draft.length}/1.200` : ""}
            </span>

            <button
              type="button"
              aria-label="Agendar"
              className="grid h-9 w-9 place-items-center rounded-full text-text-subtle hover:bg-surface-2"
            >
              <CalendarClock className="h-4 w-4" />
            </button>

            <Button
              size="sm"
              className="rounded-full px-5"
              disabled={!draft.trim()}
              onClick={publish}
            >
              Publicar
            </Button>
          </div>
        </div>
      )}

      {/* Abas fixas: trocar de feed vira um toque, sem abrir lista. */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border-soft bg-background/95 px-4 backdrop-blur">
        <div className="flex gap-5 overflow-x-auto [scrollbar-width:none]">
          {props.tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => props.onTab(t)}
              className={cn(
                "shrink-0 border-b-2 py-3 text-sm font-medium transition",
                t === props.tab
                  ? "border-primary text-text-strong"
                  : "border-transparent text-text-subtle",
              )}
            >
              {props.tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {props.tab === "ALL" && (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
          {props.typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => props.onTypeFilter(f.value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                props.typeFilter === f.value
                  ? "bg-text-strong text-background"
                  : "bg-surface-2 text-text-subtle",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* B — Botão flutuante: o feed abre direto no conteúdo; escrever é uma tela própria.          */
/* ------------------------------------------------------------------------------------------ */

function VariantB(props: FeedMobilePrototypeProps) {
  const publish = usePublishStub();
  const [sheet, setSheet] = useState(false);
  const [step, setStep] = useState<"type" | "write">("type");
  const [type, setType] = useState("INSIGHT");
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [filters, setFilters] = useState(false);
  const activeFilter = props.typeFilters.find((f) => f.value === props.typeFilter);
  const current = typeOf(type);

  return (
    <>
      {/* Controle segmentado: as quatro abas cabem na largura, sem rolagem nem lista. */}
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-4 rounded-xl bg-surface-2 p-1">
          {props.tabs.slice(0, 4).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => props.onTab(t)}
              className={cn(
                "truncate rounded-lg px-1 py-2 text-xs font-medium transition",
                t === props.tab ? "bg-surface-card text-text-strong shadow" : "text-text-subtle",
              )}
            >
              {props.tabLabels[t]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setFilters(true)}
          aria-label="Filtrar por tipo"
          className={cn(
            "relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
            props.typeFilter
              ? "border-primary text-primary"
              : "border-border-soft text-text-subtle",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {activeFilter && props.typeFilter && (
        <button
          type="button"
          onClick={() => props.onTypeFilter("")}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
        >
          Só {activeFilter.label}
          <X className="h-3 w-3" />
        </button>
      )}

      <Sheet open={filters} onOpenChange={setFilters}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetTitle>Mostrar só</SheetTitle>

          <div className="mt-4 flex flex-wrap gap-2 pb-6">
            {props.typeFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  props.onTypeFilter(f.value);
                  if (props.tab !== "ALL") props.onTab("ALL");
                  setFilters(false);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm",
                  props.typeFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-text-strong",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={() => {
          setStep("type");
          setSheet(true);
        }}
        className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-xl"
      >
        <Pencil className="h-5 w-5" />
        Publicar
      </button>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="h-[92dvh] rounded-t-3xl p-0">
          {step === "type" ? (
            <div className="p-5">
              <SheetTitle>O que você quer publicar?</SheetTitle>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id);
                      setStep("write");
                    }}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-border-soft p-3 text-left hover:border-primary"
                  >
                    <t.icon className="h-5 w-5 text-primary" />

                    <span className="text-sm font-semibold text-text-strong">{t.label}</span>

                    <span className="text-xs text-text-subtle">{TYPE_HINTS[t.id]}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b border-border-soft py-2 pl-3 pr-14">
                <button
                  type="button"
                  onClick={() => setStep("type")}
                  aria-label="Voltar"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <SheetTitle className="flex items-center gap-1.5 text-base">
                  <current.icon className="h-4 w-4 text-primary" />
                  {current.label}
                </SheetTitle>

                <Button
                  size="sm"
                  className="ml-auto rounded-full px-5"
                  disabled={!draft.trim()}
                  onClick={publish}
                >
                  Publicar
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3">
                <MentionTextarea
                  value={draft}
                  onChange={(v) => setDraft(v)}
                  placeholder={PLACEHOLDERS[type] ?? PLACEHOLDERS.INSIGHT}
                  className="min-h-[200px] w-full resize-none border-0 bg-transparent p-0 text-base"
                />
              </div>

              {/* Barra de ferramentas embaixo, onde o polegar alcança (e acima do teclado). */}
              <div className="flex items-center gap-1 border-t border-border-soft px-2 py-2">
                <button
                  type="button"
                  aria-label="Mídia"
                  className="grid h-10 w-10 place-items-center rounded-full text-text-subtle hover:bg-surface-2"
                >
                  <Image className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label="Formatar"
                  className="grid h-10 w-10 place-items-center rounded-full text-text-subtle hover:bg-surface-2"
                >
                  <Type className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label="Agendar"
                  className="grid h-10 w-10 place-items-center rounded-full text-text-subtle hover:bg-surface-2"
                >
                  <CalendarClock className="h-5 w-5" />
                </button>

                <div className="ml-auto">
                  <TopicPicker topic={topic} onTopic={setTopic} />
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* C — Começar pelo tipo: cartões de tipo guiam o que escrever; feed como título-menu.         */
/* ------------------------------------------------------------------------------------------ */

function VariantC(props: FeedMobilePrototypeProps) {
  const publish = usePublishStub();
  const [type, setType] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [feedMenu, setFeedMenu] = useState(false);
  const firstName = props.profile?.name?.split(" ")[0] ?? "você";
  const current = type ? typeOf(type) : null;

  return (
    <>
      <section className="rounded-2xl border border-border-soft bg-surface-card p-4">
        <div className="flex items-center gap-3">
          <UserAvatar src={props.profile?.avatar} alt={props.profile?.name} className="h-9 w-9" />

          <p className="text-sm text-text-strong">
            Oi, <strong>{firstName}</strong>. O que você quer compartilhar?
          </p>
        </div>

        {!current ? (
          <div className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className="flex w-28 shrink-0 snap-start flex-col items-start gap-1 rounded-2xl bg-surface-2 p-3 text-left"
              >
                <t.icon className="h-5 w-5 text-primary" />

                <span className="text-sm font-semibold text-text-strong">{t.label}</span>

                <span className="text-[11px] leading-tight text-text-subtle">
                  {TYPE_HINTS[t.id]}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setType(null)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <current.icon className="h-3.5 w-3.5" />
              {current.label}
              <X className="h-3 w-3" />
            </button>

            <MentionTextarea
              value={draft}
              onChange={(v) => setDraft(v)}
              placeholder={
                PLACEHOLDERS[current.id] ?? `${current.label}: ${TYPE_HINTS[current.id]}`
              }
              className="mt-2 min-h-[110px] w-full resize-none rounded-xl border-border-soft bg-surface-1 px-3 py-2 text-base"
              toolbar
            />

            <div className="mt-3 flex items-center gap-2">
              <TopicPicker topic={topic} onTopic={setTopic} />

              <button
                type="button"
                aria-label="Mídia"
                className="grid h-9 w-9 place-items-center rounded-full border border-border-soft text-text-subtle"
              >
                <Image className="h-4 w-4" />
              </button>

              <Button
                size="sm"
                className="ml-auto rounded-full px-5"
                disabled={!draft.trim()}
                onClick={publish}
              >
                Publicar
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* O feed escolhido vira o título da lista: dá para ler "o que estou vendo" de relance. */}
      <div className="flex items-center justify-between pt-2">
        <Popover open={feedMenu} onOpenChange={setFeedMenu}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-lg font-semibold text-text-strong"
            >
              {props.tabLabels[props.tab]}
              <ChevronDown className="h-5 w-5 text-text-subtle" />
            </button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-56 p-1">
            {props.tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  props.onTab(t);
                  setFeedMenu(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-2"
              >
                {props.tabLabels[t]}
                {t === props.tab && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {props.tab === "ALL" && (
          <select
            value={props.typeFilter}
            onChange={(e) => props.onTypeFilter(e.target.value)}
            aria-label="Tipo de publicação"
            className="rounded-full border border-border-soft bg-surface-card px-3 py-1.5 text-xs text-text-strong"
          >
            {props.typeFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </>
  );
}

export const FEED_MOBILE_VARIANTS = [
  { key: "atual", name: "Tela atual" },
  { key: "A", name: "Compacto" },
  { key: "B", name: "Botão flutuante" },
  { key: "C", name: "Começar pelo tipo" },
];

export function FeedMobilePrototype(props: FeedMobilePrototypeProps) {
  if (props.variant === "A") return <VariantA {...props} />;
  if (props.variant === "B") return <VariantB {...props} />;
  return <VariantC {...props} />;
}
