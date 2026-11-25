import type { GuideArticle } from "./types";
import { bestSeasonsGuide } from "./best-seasons";
import { pyreneesCrossingGuide } from "./pyrenees-crossing";
import { last100kmGuide } from "./last-100km-guide";
import { albergueGuide } from "./albergue-guide";
import { footwearAndLuggageGuide } from "./footwear-and-luggage";
import { budgetBreakdownGuide } from "./budget-breakdown";
import { credencialAndCompostelaGuide } from "./credencial-and-compostela";
import { finisterreMuxiaGuide } from "./finisterre-muxia-extension";
import { bedbugPreventionGuide } from "./bedbug-prevention-and-hygiene";
import { soloPilgrimSafetyGuide } from "./solo-pilgrim-safety-and-etiquette";
import { pilgrimMenuAndFoodGuide } from "./pilgrim-menu-and-food";
import { simCardAndNavigationGuide } from "./sim-card-and-navigation";

export {
  GUIDE_CATEGORY_STYLES,
  type GuideCategory,
  type GuideCategoryFilter,
  type GuideCategoryStyle,
  type GuideSection,
  type GuideArticle,
} from "./types";

export const GUIDE_ARTICLES: GuideArticle[] = [
  bestSeasonsGuide,
  pyreneesCrossingGuide,
  last100kmGuide,
  albergueGuide,
  footwearAndLuggageGuide,
  budgetBreakdownGuide,
  credencialAndCompostelaGuide,
  finisterreMuxiaGuide,
  bedbugPreventionGuide,
  soloPilgrimSafetyGuide,
  pilgrimMenuAndFoodGuide,
  simCardAndNavigationGuide,
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}
