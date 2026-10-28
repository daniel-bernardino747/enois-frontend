/**
 * PROTÓTIPO (spike/feed-mobile-ux) — descartável. Cabeçalho do card do post em cada variação.
 * Sem menu do dono nem fixar: o protótipo só responde "como o cabeçalho deveria ler".
 */
import { Link } from "@tanstack/react-router";

import { TOPIC_LABELS } from "@/constants/community-topics";
import { postSeal } from "@/constants/post-seals";
import { POST_TYPES } from "@/constants/post-types";
import type { PrototypePostHeaderProps } from "@/types/components/prototype/prototype-post-header-props";
import { StyledName, UserAvatar, UserBadges } from "@rede-enois/design-system/domain";
import { BadgeCheck, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatTime } from "@/components/post/format-time";

function topicLabel(topic: string | null | undefined) {
  return topic ? (TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic) : null;
}

/** Até 3 emblemas e o resto vira "+N": cinco imagens coladas no nome empurravam tudo. */
function FewBadges({ badges }: { badges: string[] | null | undefined }) {
  const list = badges ?? [];
  if (list.length === 0) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      <UserBadges badges={list.slice(0, 3)} />
      {list.length > 3 && <span className="text-[11px] text-text-subtle">+{list.length - 3}</span>}
    </span>
  );
}

function ContributorMark() {
  return (
    <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Contribuinte" role="img" />
  );
}

export function PrototypePostHeader({
  variant,
  post,
  typeLabel,
  typeClassName,
  seals,
}: PrototypePostHeaderProps) {
  const topic = topicLabel(post.topic);
  const time = formatTime(post.createdAt);
  const profile = { to: "/perfil/$username" as const, params: { username: post.authorUsername } };

  /* A — uma linha de nome, uma linha de contexto (tempo · tipo · assunto). */
  if (variant === "A") {
    return (
      <header className="flex items-center gap-3">
        <Link {...profile} className="shrink-0">
          <UserAvatar
            frame={post.authorAvatarFrame}
            src={post.authorAvatar}
            alt={post.authorName}
            className="h-10 w-10"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link {...profile} className="min-w-0 truncate text-sm font-bold hover:underline">
              <StyledName name={post.authorName} style={post.authorStyle} />
            </Link>

            {post.authorContributor && <ContributorMark />}

            <FewBadges badges={post.authorBadges} />
          </div>

          <p className="truncate text-xs text-text-subtle">
            {time} · {typeLabel}
            {topic ? ` · ${topic}` : ""}
          </p>
        </div>
      </header>
    );
  }

  /* B — faixa de contexto em cima (tipo, assunto, selos, tempo) e a pessoa embaixo. */
  if (variant === "B") {
    return (
      <header>
        <div className="flex items-center gap-1.5 text-xs text-text-subtle">
          <span className={cn("rounded-full px-2 py-0.5 font-medium", typeClassName)}>
            {typeLabel}
          </span>

          {topic && <span className="truncate">{topic}</span>}

          {seals?.seals.slice(0, 2).map((item) => {
            const seal = postSeal(item.seal);
            if (!seal) return null;
            return (
              <span key={item.seal} className="inline-flex items-center gap-0.5" title={seal.label}>
                <seal.icon className="h-3 w-3" />
                {item.count}
              </span>
            );
          })}

          <span className="ml-auto shrink-0">{time}</span>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <Link {...profile} className="shrink-0">
            <UserAvatar
              frame={post.authorAvatarFrame}
              src={post.authorAvatar}
              alt={post.authorName}
              className="h-9 w-9"
            />
          </Link>

          <div className="min-w-0">
            <Link {...profile} className="block truncate text-sm font-bold hover:underline">
              <StyledName name={post.authorName} style={post.authorStyle} />
            </Link>

            <span className="flex items-center gap-1 text-xs text-text-subtle">
              <span className="truncate">@{post.authorUsername}</span>

              {post.authorContributor && (
                <span className="shrink-0 rounded-full border border-primary/50 px-1.5 text-[10px] font-medium text-primary">
                  Contribuinte
                </span>
              )}
            </span>
          </div>
        </div>
      </header>
    );
  }

  /* C — o tipo vira um selinho no avatar; o nome fica sozinho na primeira linha, com o tempo. */
  const TypeIcon = POST_TYPES.find((t) => t.id === post.type)?.icon ?? Lightbulb;
  return (
    <header className="flex items-start gap-3">
      <Link {...profile} className="relative shrink-0" title={typeLabel}>
        <UserAvatar
          frame={post.authorAvatarFrame}
          src={post.authorAvatar}
          alt={post.authorName}
          className="h-11 w-11"
        />

        <span
          className={cn(
            "absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full ring-2 ring-surface-card",
            typeClassName,
          )}
        >
          <TypeIcon className="h-3 w-3" aria-label={typeLabel} />
        </span>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link {...profile} className="min-w-0 flex-1 truncate text-sm font-bold hover:underline">
            <StyledName name={post.authorName} style={post.authorStyle} />
          </Link>

          <span className="shrink-0 text-xs text-text-date">{time}</span>
        </div>

        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-text-subtle">
          {post.authorContributor && <ContributorMark />}

          <FewBadges badges={post.authorBadges} />

          <span className="truncate">
            {typeLabel}
            {topic ? ` em ${topic}` : ""}
          </span>
        </div>
      </div>
    </header>
  );
}
