import type { Profile } from "@/types/application/profile/profile";
import type { HomeTab } from "@/types/routes/feed/home-tab";

import type { FeedMobileVariant } from "./feed-mobile-variant";

/** PROTÓTIPO: o que o topo do feed precisa da rota (dados reais, publicação desligada). */
export type FeedMobilePrototypeProps = {
  variant: FeedMobileVariant;
  profile: Profile | undefined;
  tab: HomeTab;
  tabs: HomeTab[];
  tabLabels: Record<HomeTab, string>;
  onTab: (tab: HomeTab) => void;
  typeFilter: string;
  typeFilters: readonly { value: string; label: string }[];
  onTypeFilter: (value: string) => void;
};
