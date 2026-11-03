// PROTOTYPE — rota descartável e pública do spike do onboarding do Par de estudo.
// Existe só porque /par-de-estudo exige login e o dev local não segura sessão da API de produção.
// Some em build de produção (notFound). Branch: spike/par-de-estudo-onboarding.
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";

import { z } from "zod";

import { AppContainer } from "@/components/app-container";
import { StudyPairOnboardingPrototype } from "@/components/study-pairs/prototype-onboarding";

const searchSchema = z.object({ variant: z.string().optional() });

export const Route = createFileRoute("/prototype-par-de-estudo")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: PrototypePage,
});

function PrototypePage() {
  const { variant = "A" } = Route.useSearch();
  const navigate = useNavigate({ from: "/prototype-par-de-estudo" });

  return (
    <AppContainer>
      <StudyPairOnboardingPrototype
        variant={variant}
        onVariant={(v) => void navigate({ search: { variant: v }, replace: true })}
      />
    </AppContainer>
  );
}
