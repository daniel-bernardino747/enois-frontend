import type { PostSeals } from "@/types/application/feed/post-seals";
import type { PostView } from "@/types/application/feed/post-view";

import type { FeedMobileVariant } from "./feed-mobile-variant";

/** PROTÓTIPO: cabeçalho do card do post em cada variação. */
export type PrototypePostHeaderProps = {
  variant: FeedMobileVariant;
  post: PostView;
  typeLabel: string;
  typeClassName: string;
  seals: PostSeals | undefined;
};
