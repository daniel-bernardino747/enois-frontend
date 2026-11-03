// PROTOTYPE — spike de layout do onboarding do Par de estudo (proposta PENDING com quebra-gelo).
/* eslint-disable local/type-boundaries -- PROTOTYPE descartável: tipos ficam junto do spike. */
// Variantes em /prototype-par-de-estudo?variant=C1 (rodada 2: C1–C3 sobre a C; rodada 1: A, B, C). Dados fictícios, nada chama a API.
// Spec: issue "[Proposta] Par de estudo: aceite mútuo com quebra-gelo antes do primeiro check-in".
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@rede-enois/design-system/domain";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Pill,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Textarea,
} from "@rede-enois/design-system/ui";
import {
  ArrowDown,
  CalendarClock,
  Check,
  Hourglass,
  Lock,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { PrototypeSwitcher } from "@/components/prototype-switcher";

// ---------- dados e estado fictícios ----------

type Follow = "CHECKIN" | "MESSAGE" | "CALL";
type Answers = { why: string; hours: string; follow: Follow[]; extra: string };

const FOLLOW_LABEL: Record<Follow, string> = {
  CHECKIN: "Só pelo check-in daqui",
  MESSAGE: "Também por mensagem",
  CALL: "Chamada de vez em quando",
};
const HOURS = ["Até 2h", "2 a 5h", "5 a 10h", "Mais de 10h"];
const Q = {
  why: "Por que esse objetivo agora?",
  hours: "Quanto tempo por semana você pretende dedicar?",
  follow: "Como prefere que a gente se acompanhe?",
  extra: "Algo mais? (opcional)",
};

const PARTNER = {
  name: "Marina Souza",
  username: "marina.dev",
  href: "/perfil/marina.dev",
  avatarUrl: null as string | null,
  bio: "Back-end em transição pra sistemas. Gosto de estudar com prazo.",
};
const GOAL = { goal: "Aprender Rust", topicLabel: "Tecnologia" };
const PARTNER_ANSWERS: Answers = {
  why: "Quero contribuir num projeto open source em Rust até março e preciso de ritmo.",
  hours: "2 a 5h",
  follow: ["CHECKIN", "MESSAGE"],
  extra: "Estou no capítulo 8 do livro oficial.",
};
const EMPTY: Answers = { why: "", hours: "", follow: [], extra: "" };

type Proto = {
  partnerAnswered: boolean;
  partnerAccepted: boolean;
  mine: Answers;
  iAccepted: boolean;
  declined: boolean;
  daysLeft: number;
};

const INITIAL: Proto = {
  partnerAnswered: true,
  partnerAccepted: false,
  mine: EMPTY,
  iAccepted: false,
  declined: false,
  daysLeft: 6,
};

type VariantProps = {
  state: Proto;
  setMine: (patch: Partial<Answers>) => void;
  accept: () => void;
  decline: () => void;
};

const firstName = PARTNER.name.split(" ")[0];
const canAccept = (a: Answers) => a.why.trim().length > 0;
const bothWantMessage = (s: Proto) =>
  s.partnerAnswered &&
  PARTNER_ANSWERS.follow.includes("MESSAGE") &&
  s.mine.follow.includes("MESSAGE");
const toggle = (list: Follow[], f: Follow) =>
  list.includes(f) ? list.filter((x) => x !== f) : [...list, f];

// ---------- peças pequenas reaproveitadas (não o layout) ----------

function PartnerIdentity({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar
        src={PARTNER.avatarUrl}
        alt={PARTNER.name}
        className={compact ? "h-9 w-9" : "h-14 w-14"}
      />

      <div className="min-w-0">
        <a
          href={PARTNER.href}
          className="block truncate font-medium text-text-strong hover:underline"
        >
          {PARTNER.name}
        </a>

        <p className="truncate text-xs text-text-subtle">@{PARTNER.username}</p>
        {!compact && <p className="mt-1 text-sm text-pretty text-text-subtle">{PARTNER.bio}</p>}
      </div>
    </div>
  );
}

function Deadline({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-subtle">
      <Hourglass className="h-3.5 w-3.5" /> {days} dias para aceitar
    </span>
  );
}

function HoursPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {HOURS.map((h) => (
        <Pill key={h} size="sm" active={value === h} onClick={() => onChange(value === h ? "" : h)}>
          {h}
        </Pill>
      ))}
    </div>
  );
}

function FollowPicker({ value, onChange }: { value: Follow[]; onChange: (v: Follow[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(FOLLOW_LABEL) as Follow[]).map((f) => (
        <Pill
          key={f}
          size="sm"
          active={value.includes(f)}
          onClick={() => onChange(toggle(value, f))}
        >
          {FOLLOW_LABEL[f]}
        </Pill>
      ))}
    </div>
  );
}

function Outcome({ state }: { state: Proto }) {
  if (state.declined)
    return (
      <div className="surface-card p-4 text-sm text-text-subtle">
        Você recusou. {firstName} volta para a fila na posição original e vocês não serão propostas
        de novo para este objetivo.
      </div>
    );
  if (state.iAccepted && state.partnerAccepted)
    return (
      <div className="surface-card space-y-3 p-4">
        <p className="flex items-center gap-2 font-medium text-text-strong">
          <Sparkles className="h-4 w-4" /> Par formado! A semana 1 começa agora.
        </p>
        {bothWantMessage(state) && (
          <Button size="sm" variant="outline" className="rounded-full">
            <MessageCircle className="h-4 w-4" /> Mandar mensagem para {firstName}
          </Button>
        )}
      </div>
    );
  if (state.iAccepted)
    return (
      <div className="surface-card p-4 text-sm text-text-subtle">
        Você aceitou. Falta {firstName} aceitar, avisamos quando o par começar.
      </div>
    );
  return null;
}

// ---------- A: card inline na lista, lado a lado ----------

function VariantA({ state, setMine, accept, decline }: VariantProps) {
  if (state.declined || state.iAccepted) return <Outcome state={state} />;
  const m = state.mine;
  return (
    <article className="surface-card space-y-4 p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-text-subtle uppercase">
            Proposta de par
          </p>

          <h3 className="text-base font-medium text-text-strong">{GOAL.goal}</h3>
        </div>

        <Deadline days={state.daysLeft} />
      </header>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <section className="min-w-0 space-y-3 rounded-xl bg-surface-2 p-3">
          <PartnerIdentity compact />
          {state.partnerAnswered ? (
            <dl className="space-y-2 text-sm">
              <dt className="text-xs text-text-subtle">{Q.why}</dt>

              <dd className="text-text-strong">{PARTNER_ANSWERS.why}</dd>

              <dt className="text-xs text-text-subtle">{Q.hours}</dt>

              <dd>{PARTNER_ANSWERS.hours}</dd>

              <dt className="text-xs text-text-subtle">{Q.follow}</dt>

              <dd>{PARTNER_ANSWERS.follow.map((f) => FOLLOW_LABEL[f]).join(" · ")}</dd>

              <dd className="text-text-subtle italic">“{PARTNER_ANSWERS.extra}”</dd>
            </dl>
          ) : (
            <p className="text-sm text-text-subtle">
              {firstName} ainda não escreveu a apresentação.
            </p>
          )}
        </section>

        <section className="min-w-0 space-y-3 rounded-xl border border-border p-3">
          <p className="text-sm font-medium text-text-strong">Você</p>

          <label className="block space-y-1 text-xs text-text-subtle">
            {Q.why} *
            <Textarea
              value={m.why}
              maxLength={280}
              onChange={(e) => setMine({ why: e.target.value })}
            />
          </label>

          <div className="space-y-1 text-xs text-text-subtle">
            {Q.hours}
            <HoursPicker value={m.hours} onChange={(hours) => setMine({ hours })} />
          </div>

          <div className="space-y-1 text-xs text-text-subtle">
            {Q.follow}
            <FollowPicker value={m.follow} onChange={(follow) => setMine({ follow })} />
          </div>

          <label className="block space-y-1 text-xs text-text-subtle">
            {Q.extra}
            <Textarea
              rows={2}
              value={m.extra}
              onChange={(e) => setMine({ extra: e.target.value })}
            />
          </label>
        </section>
      </div>

      <footer className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" className="rounded-full" onClick={decline}>
          Agora não
        </Button>

        <Button size="sm" className="rounded-full" disabled={!canAccept(m)} onClick={accept}>
          Aceitar e começar
        </Button>
      </footer>
    </article>
  );
}

// ---------- B: passo a passo em diálogo ----------

function VariantB({ state, setMine, accept, decline }: VariantProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const m = state.mine;
  const steps = ["Conheça", "Por quê", "Ritmo", "Revisar"];

  if (state.declined || state.iAccepted) return <Outcome state={state} />;

  return (
    <>
      {/* gatilho: banner fino no topo da página */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-primary/10 p-3">
        <PartnerIdentity compact />

        <p className="min-w-0 flex-1 text-sm text-text-strong">
          Você e {firstName} querem <strong>{GOAL.goal}</strong>.
        </p>

        <Deadline days={state.daysLeft} />

        <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          Conhecer e responder
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{steps[step]}</DialogTitle>

            <DialogDescription>
              Passo {step + 1} de {steps.length} · {GOAL.goal}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1">
            {steps.map((s, i) => (
              <span
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-surface-2"}`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <PartnerIdentity />
              {state.partnerAnswered ? (
                <blockquote className="rounded-xl bg-surface-2 p-3 text-sm">
                  “{PARTNER_ANSWERS.why}”
                  <span className="mt-2 block text-xs text-text-subtle">
                    {PARTNER_ANSWERS.hours} por semana ·{" "}
                    {PARTNER_ANSWERS.follow.map((f) => FOLLOW_LABEL[f]).join(" · ")}
                  </span>
                </blockquote>
              ) : (
                <p className="text-sm text-text-subtle">
                  {firstName} ainda não respondeu. Você pode responder primeiro.
                </p>
              )}
            </div>
          )}
          {step === 1 && (
            <label className="block space-y-2 text-sm">
              {Q.why}
              <Textarea
                autoFocus
                rows={4}
                value={m.why}
                onChange={(e) => setMine({ why: e.target.value })}
              />
            </label>
          )}
          {step === 2 && (
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                {Q.hours}
                <HoursPicker value={m.hours} onChange={(hours) => setMine({ hours })} />
              </div>

              <div className="space-y-2">
                {Q.follow}
                <FollowPicker value={m.follow} onChange={(follow) => setMine({ follow })} />
              </div>

              <label className="block space-y-2">
                {Q.extra}
                <Textarea
                  rows={2}
                  value={m.extra}
                  onChange={(e) => setMine({ extra: e.target.value })}
                />
              </label>
            </div>
          )}
          {step === 3 && (
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-text-subtle">Por quê:</span> {m.why || "—"}
              </li>

              <li>
                <span className="text-text-subtle">Tempo:</span> {m.hours || "—"}
              </li>

              <li>
                <span className="text-text-subtle">Acompanhar:</span>{" "}
                {m.follow.map((f) => FOLLOW_LABEL[f]).join(" · ") || "—"}
              </li>
              {bothWantMessage(state) && (
                <li className="flex items-center gap-1 text-text-strong">
                  <MessageCircle className="h-4 w-4" /> Vocês dois querem conversar por mensagem.
                </li>
              )}
            </ul>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {step === 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  decline();
                }}
              >
                Agora não
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                size="sm"
                disabled={step === 1 && !canAccept(m)}
                onClick={() => setStep(step + 1)}
              >
                Continuar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setOpen(false);
                  accept();
                }}
              >
                Aceitar e começar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- C: roteiro em formato de conversa ----------

function Bubble({ from, children }: { from: "app" | "partner" | "me"; children: React.ReactNode }) {
  const side =
    from === "me"
      ? "ml-auto bg-primary text-primary-foreground"
      : from === "partner"
        ? "bg-surface-2"
        : "bg-transparent text-text-subtle";
  return <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${side}`}>{children}</div>;
}

function VariantC({ state, setMine, accept, decline }: VariantProps) {
  const m = state.mine;
  const [draft, setDraft] = useState("");
  // passo atual da conversa: 0 why, 1 hours, 2 follow, 3 pronto
  const step = !m.why ? 0 : !m.hours ? 1 : m.follow.length === 0 ? 2 : 3;

  if (state.declined || state.iAccepted) return <Outcome state={state} />;

  return (
    <section className="surface-card mx-auto max-w-xl space-y-3 p-4">
      <header className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <PartnerIdentity compact />
        <Deadline days={state.daysLeft} />
      </header>

      <Bubble from="app">
        Vocês dois querem <strong>{GOAL.goal}</strong>. Antes do primeiro check-in, que tal se
        apresentarem?
      </Bubble>

      <Bubble from="app">{Q.why}</Bubble>
      {state.partnerAnswered && (
        <Bubble from="partner">
          <b>{firstName}:</b> {PARTNER_ANSWERS.why}
        </Bubble>
      )}
      {m.why && <Bubble from="me">{m.why}</Bubble>}

      {step >= 1 && (
        <>
          <Bubble from="app">{Q.hours}</Bubble>
          {state.partnerAnswered && (
            <Bubble from="partner">
              <b>{firstName}:</b> {PARTNER_ANSWERS.hours}
            </Bubble>
          )}
          {m.hours && <Bubble from="me">{m.hours}</Bubble>}
        </>
      )}
      {step >= 2 && (
        <>
          <Bubble from="app">{Q.follow}</Bubble>
          {state.partnerAnswered && (
            <Bubble from="partner">
              <b>{firstName}:</b> {PARTNER_ANSWERS.follow.map((f) => FOLLOW_LABEL[f]).join(" · ")}
            </Bubble>
          )}
          {m.follow.length > 0 && (
            <Bubble from="me">{m.follow.map((f) => FOLLOW_LABEL[f]).join(" · ")}</Bubble>
          )}
        </>
      )}

      {/* área de resposta muda conforme o passo */}
      <div className="border-t border-border pt-3">
        {step === 0 && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) setMine({ why: draft.trim() });
              setDraft("");
            }}
          >
            <Textarea
              rows={1}
              placeholder="Sua resposta…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />

            <Button type="submit" size="sm" disabled={!draft.trim()}>
              Enviar
            </Button>
          </form>
        )}
        {step === 1 && <HoursPicker value={m.hours} onChange={(hours) => setMine({ hours })} />}
        {step === 2 && <FollowPicker value={m.follow} onChange={(follow) => setMine({ follow })} />}
        {step === 3 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {bothWantMessage(state) ? (
              <span className="flex items-center gap-1 text-xs text-text-subtle">
                <MessageCircle className="h-3.5 w-3.5" /> Mensagem liberada depois do aceite
              </span>
            ) : (
              <span />
            )}
            <Button size="sm" className="rounded-full" onClick={accept}>
              <Check className="h-4 w-4" /> Bora começar
            </Button>
          </div>
        )}
        <button
          type="button"
          onClick={decline}
          className="mt-2 inline-flex items-center gap-1 text-xs text-text-subtle hover:underline"
        >
          <X className="h-3 w-3" /> Agora não
        </button>
      </div>
    </section>
  );
}

// =====================================================================================
// Rodada 2: três evoluções da C (rolagem, mensagem chegando, "digitando…").
// =====================================================================================

const PROTO_CSS = `
@keyframes proto-in { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes proto-dot { 0%, 60%, 100% { transform: translateY(0); opacity: .35; } 30% { transform: translateY(-3px); opacity: 1; } }
@keyframes proto-reveal { from { opacity: .4; filter: blur(6px); transform: scale(.98); } to { opacity: 1; filter: none; transform: none; } }
.proto-in { animation: proto-in 280ms cubic-bezier(.22,1,.36,1) both; }
.proto-in-left { transform-origin: bottom left; }
.proto-in-right { transform-origin: bottom right; }
.proto-dot { animation: proto-dot 1s ease-in-out infinite; }
.proto-dot:nth-child(2) { animation-delay: .15s; }
.proto-dot:nth-child(3) { animation-delay: .3s; }
.proto-reveal { animation: proto-reveal 450ms cubic-bezier(.22,1,.36,1) both; }
.proto-fade-top { mask-image: linear-gradient(to bottom, transparent 0, #000 24px); }
@media (prefers-reduced-motion: reduce) {
  .proto-in, .proto-dot, .proto-reveal { animation: none; }
}
`;

type Who = "app" | "partner" | "me";
type RoundKey = "intro" | "why" | "hours" | "follow" | "extra" | "done";
type Msg = { id: string; from: Who; round: RoundKey; text: React.ReactNode };

const ROUNDS: { key: Exclude<RoundKey, "intro" | "done">; q: string }[] = [
  { key: "why", q: Q.why },
  { key: "hours", q: Q.hours },
  { key: "follow", q: Q.follow },
  { key: "extra", q: "Quer contar mais alguma coisa? Pode pular." },
];

const followText = (f: Follow[]) => f.map((x) => FOLLOW_LABEL[x]).join(" · ");

/** Passo atual: 0 por quê, 1 tempo, 2 acompanhamento, 3 algo mais, 4 pronto. */
function stepOf(m: Answers, extraDone: boolean) {
  if (!m.why) return 0;
  if (!m.hours) return 1;
  if (m.follow.length === 0) return 2;
  if (!extraDone) return 3;
  return 4;
}

/** O roteiro inteiro derivado do estado; a revelação aos poucos fica com `useReveal`. */
function buildScript(state: Proto, extraDone: boolean, revealAfterMine: boolean): Msg[] {
  const m = state.mine;
  const step = stepOf(m, extraDone);
  const mineOf = { why: m.why, hours: m.hours, follow: followText(m.follow), extra: m.extra };
  const partnerOf = {
    why: PARTNER_ANSWERS.why,
    hours: PARTNER_ANSWERS.hours,
    follow: followText(PARTNER_ANSWERS.follow),
    extra: PARTNER_ANSWERS.extra,
  };
  const out: Msg[] = [
    {
      id: "intro",
      from: "app",
      round: "intro",
      text: (
        <>
          Vocês dois querem <strong>{GOAL.goal}</strong>. Antes do primeiro check-in, que tal se
          apresentarem?
        </>
      ),
    },
  ];

  ROUNDS.forEach((r, i) => {
    if (i > step) return;
    out.push({ id: `${r.key}-q`, from: "app", round: r.key, text: r.q });
    const answered = i < step;
    const partner: Msg | null = state.partnerAnswered
      ? { id: `${r.key}-p`, from: "partner", round: r.key, text: partnerOf[r.key] }
      : null;
    const mine: Msg | null =
      answered && mineOf[r.key]
        ? { id: `${r.key}-m`, from: "me", round: r.key, text: mineOf[r.key] }
        : null;
    if (revealAfterMine) {
      if (mine) out.push(mine);
      if (partner && answered) out.push(partner);
    } else {
      if (partner) out.push(partner);
      if (mine) out.push(mine);
    }
  });

  if (step === 4) {
    out.push({
      id: "done",
      from: "app",
      round: "done",
      text: bothWantMessage(state)
        ? "Tudo pronto! Vocês dois querem conversar por mensagem: o botão aparece assim que o par começar."
        : "Tudo pronto! Quando vocês dois aceitarem, a semana 1 começa.",
    });
  }
  return out;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Revela o roteiro uma mensagem por vez: as suas aparecem na hora; as do app e da outra pessoa
 * passam antes por "digitando…". Marca por id, então inserir mensagem no meio (Marina responde
 * depois) também anima.
 */
function useReveal(script: Msg[]) {
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const next = script.find((msg) => !seen.has(msg.id));
  const nextId = next?.id;
  const nextFrom = next?.from;

  useEffect(() => {
    if (!nextId) return;
    const fast = prefersReducedMotion();
    const delay = nextFrom === "me" ? 0 : fast ? 150 : nextFrom === "app" ? 700 : 1200;
    const t = window.setTimeout(() => setSeen((s) => new Set(s).add(nextId)), delay);
    return () => window.clearTimeout(t);
  }, [nextId, nextFrom]);

  return {
    visible: script.filter((msg) => seen.has(msg.id)),
    typing: next && next.from !== "me" ? next.from : null,
    busy: Boolean(next),
  };
}

/** Rola até o fim quando chega algo, a não ser que a pessoa tenha subido para reler. */
function useStickToBottom(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(false);

  const scrollDown = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    setUnread(false);
  };

  useEffect(() => {
    if (atBottom) scrollDown();
    else setUnread(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAtBottom(bottom);
    if (bottom) setUnread(false);
  };

  return { ref, onScroll, unread, scrollDown };
}

function TypingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label="digitando">
      <span className="proto-dot h-1.5 w-1.5 rounded-full bg-current" />
      <span className="proto-dot h-1.5 w-1.5 rounded-full bg-current" />
      <span className="proto-dot h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

/** Controles de resposta do passo atual; muda de forma conforme a pergunta. */
function Composer({
  step,
  state,
  setMine,
  onExtraDone,
  accept,
  decline,
  chipsClassName = "flex flex-wrap gap-2",
}: {
  step: number;
  state: Proto;
  setMine: (patch: Partial<Answers>) => void;
  onExtraDone: () => void;
  accept: () => void;
  decline: () => void;
  chipsClassName?: string;
}) {
  const [draft, setDraft] = useState("");
  const [follow, setFollow] = useState<Follow[]>([]);

  const sendText = (apply: (text: string) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    apply(draft.trim());
    setDraft("");
  };

  if (step === 0 || step === 3)
    return (
      <form
        className="flex items-end gap-2"
        onSubmit={sendText((text) => {
          if (step === 0) {
            if (text) setMine({ why: text });
          } else {
            setMine({ extra: text });
            onExtraDone();
          }
        })}
      >
        <Textarea
          rows={1}
          autoFocus
          placeholder={step === 0 ? "Sua resposta…" : "Algo mais (opcional)…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="max-h-32 min-h-10 resize-none"
        />

        {step === 3 && !draft.trim() ? (
          <Button type="submit" size="sm" variant="ghost" className="rounded-full">
            Pular
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={!draft.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        )}
      </form>
    );

  if (step === 1)
    return (
      <div className={chipsClassName}>
        {HOURS.map((h) => (
          <Pill key={h} size="sm" onClick={() => setMine({ hours: h })}>
            {h}
          </Pill>
        ))}
      </div>
    );

  if (step === 2)
    return (
      <div className="space-y-2">
        <div className={chipsClassName}>
          {(Object.keys(FOLLOW_LABEL) as Follow[]).map((f) => (
            <Pill
              key={f}
              size="sm"
              active={follow.includes(f)}
              onClick={() => setFollow(toggle(follow, f))}
            >
              {FOLLOW_LABEL[f]}
            </Pill>
          ))}
        </div>

        <Button
          size="sm"
          className="rounded-full"
          disabled={follow.length === 0}
          onClick={() => setMine({ follow })}
        >
          Confirmar
        </Button>
      </div>
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button type="button" onClick={decline} className="text-xs text-text-subtle hover:underline">
        Agora não
      </button>

      <Button size="sm" className="rounded-full" onClick={accept}>
        <Check className="h-4 w-4" /> Aceitar e começar
      </Button>

      {!state.partnerAnswered && (
        <p className="w-full text-xs text-text-subtle">
          {firstName} ainda não respondeu. O par começa quando vocês dois aceitarem.
        </p>
      )}
    </div>
  );
}

type ChatVariantProps = VariantProps & { extraDone: boolean; onExtraDone: () => void };

// ---------- C1: chat no card, rolagem própria e composer fixo ----------

function VariantC1({ state, setMine, accept, decline, extraDone, onExtraDone }: ChatVariantProps) {
  const script = buildScript(state, extraDone, false);
  const { visible, typing, busy } = useReveal(script);
  const step = stepOf(state.mine, extraDone);
  const { ref, onScroll } = useStickToBottom([visible.length, typing]);

  if (state.declined || state.iAccepted)
    return (
      <div className="proto-in mx-auto max-w-xl">
        <Outcome state={state} />
      </div>
    );

  return (
    <section className="surface-card mx-auto flex h-[32rem] max-h-[75dvh] max-w-xl flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-border p-3">
        <PartnerIdentity compact />
        <Deadline days={state.daysLeft} />
      </header>

      <div
        ref={ref}
        onScroll={onScroll}
        className="proto-fade-top min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4"
      >
        {visible.map((msg, i) => {
          const prev = visible[i - 1];
          const showAvatar = msg.from === "partner" && prev?.from !== "partner";
          return (
            <div
              key={msg.id}
              className={`proto-in flex items-end gap-2 ${msg.from === "me" ? "proto-in-right justify-end" : "proto-in-left"}`}
            >
              {msg.from === "partner" && (
                <span className="w-6 shrink-0">
                  {showAvatar && (
                    <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-6 w-6" />
                  )}
                </span>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm text-pretty ${
                  msg.from === "me"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : msg.from === "partner"
                      ? "rounded-bl-md bg-surface-2"
                      : "border border-border text-text-subtle"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className={`proto-in proto-in-left flex items-end gap-2`}>
            {typing === "partner" && (
              <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-6 w-6" />
            )}
            <div className="rounded-2xl rounded-bl-md bg-surface-2 px-3 py-3 text-text-subtle">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border p-3">
        {busy ? (
          <p className="h-10 text-xs leading-10 text-text-subtle">…</p>
        ) : (
          <Composer
            step={step}
            state={state}
            setMine={setMine}
            onExtraDone={onExtraDone}
            accept={accept}
            decline={decline}
          />
        )}
      </footer>
    </section>
  );
}

// ---------- C2: mensageiro em painel lateral, com horário, status e "nova mensagem" ----------

function VariantC2({ state, setMine, accept, decline, extraDone, onExtraDone }: ChatVariantProps) {
  const [open, setOpen] = useState(false);
  const script = buildScript(state, extraDone, false);
  const { visible, typing, busy } = useReveal(open ? script : []);
  const step = stepOf(state.mine, extraDone);
  const { ref, onScroll, unread, scrollDown } = useStickToBottom([visible.length, typing]);

  if (state.declined || state.iAccepted) return <Outcome state={state} />;

  const status =
    typing === "partner"
      ? "digitando…"
      : typing === "app"
        ? "Énóis está escrevendo…"
        : `@${PARTNER.username}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="surface-card flex w-full items-center gap-3 p-3 text-left hover:bg-surface-2"
      >
        <span className="relative">
          <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-11 w-11" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-surface-1" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-text-strong">
            {firstName} · {GOAL.goal}
          </span>

          <span className="block truncate text-sm text-text-subtle">
            Proposta de par ·{" "}
            {state.partnerAnswered ? `${firstName} já se apresentou` : "toque para se apresentar"}
          </span>
        </span>

        <Deadline days={state.daysLeft} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <header className="flex items-center gap-3 border-b border-border p-3 pr-12">
            <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-9 w-9" />

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-sm">{PARTNER.name}</SheetTitle>

              <SheetDescription key={status} className="proto-in truncate text-xs">
                {status}
              </SheetDescription>
            </div>

            <div className="flex gap-1" aria-label={`Passo ${Math.min(step + 1, 4)} de 4`}>
              {ROUNDS.map((r, i) => (
                <span
                  key={r.key}
                  className={`h-1.5 w-4 rounded-full transition-colors duration-300 ${i < step ? "bg-primary" : "bg-surface-2"}`}
                />
              ))}
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div
              ref={ref}
              onScroll={onScroll}
              className="proto-fade-top h-full space-y-1 overflow-y-auto overscroll-contain px-3 py-4"
            >
              <p className="pb-2 text-center text-[11px] text-text-subtle">
                Hoje · só vocês dois veem esta conversa
              </p>

              {visible.map((msg, i) => {
                const prev = visible[i - 1];
                const nextMsg = visible[i + 1];
                const first = prev?.from !== msg.from;
                const last = nextMsg?.from !== msg.from;
                const time = `14:${String(2 + i).padStart(2, "0")}`;
                if (msg.from === "app")
                  return (
                    <p
                      key={msg.id}
                      className="proto-in mx-auto max-w-[85%] py-2 text-center text-xs text-pretty text-text-subtle"
                    >
                      {msg.text}
                    </p>
                  );
                const mine = msg.from === "me";
                return (
                  <div
                    key={msg.id}
                    className={`proto-in flex items-end gap-2 ${mine ? "proto-in-right justify-end" : "proto-in-left"} ${first ? "pt-2" : ""}`}
                  >
                    {!mine && (
                      <span className="w-7 shrink-0">
                        {last && (
                          <UserAvatar
                            src={PARTNER.avatarUrl}
                            alt={PARTNER.name}
                            className="h-7 w-7"
                          />
                        )}
                      </span>
                    )}

                    <div
                      className={`max-w-[78%] px-3 py-2 text-sm text-pretty ${
                        mine ? "bg-primary text-primary-foreground" : "bg-surface-2"
                      } ${mine ? (last ? "rounded-2xl rounded-br-md" : "rounded-2xl") : last ? "rounded-2xl rounded-bl-md" : "rounded-2xl"}`}
                    >
                      {msg.text}
                      {last && (
                        <span
                          className={`mt-0.5 block text-right text-[10px] ${mine ? "opacity-70" : "text-text-subtle"}`}
                        >
                          {time}
                          {mine && " ✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {typing === "partner" && (
                <div className="proto-in proto-in-left flex items-end gap-2 pt-2">
                  <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-7 w-7" />

                  <div className="rounded-2xl rounded-bl-md bg-surface-2 px-3 py-3 text-text-subtle">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {unread && (
              <button
                type="button"
                onClick={scrollDown}
                className="proto-in absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground shadow-lg"
              >
                <ArrowDown className="h-3.5 w-3.5" /> Nova mensagem
              </button>
            )}
          </div>

          <footer className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {busy ? (
              <div className="flex h-10 items-center text-text-subtle">
                <TypingDots />
              </div>
            ) : (
              <Composer
                step={step}
                state={state}
                setMine={setMine}
                onExtraDone={onExtraDone}
                accept={() => {
                  setOpen(false);
                  accept();
                }}
                decline={() => {
                  setOpen(false);
                  decline();
                }}
                chipsClassName="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]"
              />
            )}
          </footer>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ---------- C3: rodadas, a resposta da outra pessoa só aparece depois da sua ----------

function VariantC3({ state, setMine, accept, decline, extraDone, onExtraDone }: ChatVariantProps) {
  const script = buildScript(state, extraDone, true);
  const { visible, typing, busy } = useReveal(script);
  const step = stepOf(state.mine, extraDone);
  const { ref, onScroll } = useStickToBottom([visible.length, typing]);
  const ids = new Set(visible.map((m) => m.id));

  if (state.declined || state.iAccepted) return <Outcome state={state} />;

  const intro = visible.find((m) => m.round === "intro");
  const done = visible.find((m) => m.round === "done");

  return (
    <section className="surface-card mx-auto flex h-[34rem] max-h-[78dvh] max-w-xl flex-col overflow-hidden">
      <header className="space-y-3 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <PartnerIdentity compact />
          <Deadline days={state.daysLeft} />
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
          />
        </div>
      </header>

      <div
        ref={ref}
        onScroll={onScroll}
        className="proto-fade-top min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
      >
        {intro && <p className="proto-in text-sm text-text-subtle">{intro.text}</p>}

        {ROUNDS.map((r, i) => {
          if (!ids.has(`${r.key}-q`)) return null;
          const past = i < step;
          const mine = visible.find((m) => m.id === `${r.key}-m`);
          const partner = visible.find((m) => m.id === `${r.key}-p`);
          const partnerTyping =
            typing === "partner" && script.find((m) => !ids.has(m.id))?.round === r.key;
          return (
            <article
              key={r.key}
              className={`proto-in rounded-2xl border p-3 transition-colors duration-300 ${past ? "border-border" : "border-primary/40 bg-primary/5"}`}
            >
              <p className="mb-2 text-xs font-medium text-text-subtle">
                {i + 1}/4 · {r.q}
              </p>

              <div className="space-y-2">
                {mine ? (
                  <div className="proto-in proto-in-right ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {mine.text}
                  </div>
                ) : past ? (
                  <p className="text-right text-xs text-text-subtle italic">Você pulou</p>
                ) : null}

                {partner ? (
                  <div className="proto-reveal flex items-end gap-2">
                    <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-6 w-6" />

                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface-2 px-3 py-2 text-sm">
                      {partner.text}
                    </div>
                  </div>
                ) : partnerTyping ? (
                  <div className="proto-in flex items-end gap-2 text-text-subtle">
                    <UserAvatar src={PARTNER.avatarUrl} alt={PARTNER.name} className="h-6 w-6" />

                    <div className="rounded-2xl rounded-bl-md bg-surface-2 px-3 py-3">
                      <TypingDots />
                    </div>
                  </div>
                ) : state.partnerAnswered && !past ? (
                  <div className="flex items-center gap-2 text-xs text-text-subtle">
                    <Lock className="h-3.5 w-3.5" /> {firstName} já respondeu. Responda para ver.
                  </div>
                ) : !state.partnerAnswered ? (
                  <p className="text-xs text-text-subtle">{firstName} ainda não respondeu.</p>
                ) : null}
              </div>
            </article>
          );
        })}

        {typing === "app" && (
          <div className="proto-in text-text-subtle">
            <TypingDots />
          </div>
        )}

        {done && <p className="proto-in text-sm text-text-strong">{done.text}</p>}
      </div>

      <footer className="border-t border-border p-3">
        {busy ? (
          <p className="h-10 text-xs leading-10 text-text-subtle">…</p>
        ) : (
          <Composer
            step={step}
            state={state}
            setMine={setMine}
            onExtraDone={onExtraDone}
            accept={accept}
            decline={decline}
          />
        )}
      </footer>
    </section>
  );
}

// ---------- switcher + painel de estado ----------

/** Variante da rodada 1 (A, B, C) não usa o "algo mais" do roteiro; ignora as props extras. */
const VARIANTS: { key: string; name: string; C: (p: ChatVariantProps) => React.JSX.Element }[] = [
  { key: "C", name: "Roteiro de conversa (original)", C: VariantC },
  { key: "C1", name: "Chat no card", C: VariantC1 },
  { key: "C2", name: "Mensageiro lateral", C: VariantC2 },
  { key: "C3", name: "Rodadas com revelação", C: VariantC3 },
  { key: "A", name: "Card lado a lado (rodada 1)", C: VariantA },
  { key: "B", name: "Passo a passo (rodada 1)", C: VariantB },
];

export function StudyPairOnboardingPrototype({
  variant,
  onVariant,
}: {
  variant: string;
  onVariant: (v: string) => void;
}) {
  const [state, setState] = useState<Proto>(INITIAL);
  const [extraDone, setExtraDone] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const current = VARIANTS.find((v) => v.key === variant) ?? VARIANTS[1];
  const Variant = current.C;
  const set = (patch: Partial<Proto>) => setState((s) => ({ ...s, ...patch }));
  const reset = () => {
    setState(INITIAL);
    setExtraDone(false);
    setResetCount((n) => n + 1);
  };

  return (
    <div className="space-y-3">
      <style>{PROTO_CSS}</style>

      <Variant
        key={`${current.key}-${resetCount}`}
        state={state}
        setMine={(patch) => setState((s) => ({ ...s, mine: { ...s.mine, ...patch } }))}
        accept={() => set({ iAccepted: true })}
        decline={() => set({ declined: true })}
        extraDone={extraDone}
        onExtraDone={() => setExtraDone(true)}
      />

      <details
        open
        className="rounded-xl border border-dashed border-yellow-500 p-3 font-mono text-xs"
      >
        <summary className="cursor-pointer">PROTOTYPE — estado</summary>

        <div className="my-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => set({ partnerAnswered: !state.partnerAnswered })}
          >
            {firstName} {state.partnerAnswered ? "já respondeu" : "não respondeu"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => set({ partnerAccepted: !state.partnerAccepted })}
          >
            {firstName} {state.partnerAccepted ? "aceitou" : "não aceitou"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => set({ daysLeft: state.daysLeft === 1 ? 6 : 1 })}
          >
            <CalendarClock className="h-3.5 w-3.5" /> prazo: {state.daysLeft}d
          </Button>

          <Button size="sm" variant="outline" onClick={reset}>
            reiniciar
          </Button>
        </div>

        <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(state, null, 2)}</pre>
      </details>

      <PrototypeSwitcher variants={VARIANTS} current={current.key} onChange={onVariant} />
    </div>
  );
}
