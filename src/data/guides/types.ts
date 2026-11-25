export type GuideCategory = "route-strategy" | "accommodation" | "gear-budget";
export type GuideCategoryFilter = "all" | GuideCategory;

export interface GuideCategoryStyle {
  activeBtn: string;
  inactiveHover: string;
  badge: string;
}

/** 攻略分類色彩對照表，統一篩選按鈕、列表標籤與內頁標籤樣式 */
export const GUIDE_CATEGORY_STYLES: Record<GuideCategoryFilter, GuideCategoryStyle> = {
  all: {
    activeBtn: "bg-slate-900 text-white border-slate-900",
    inactiveHover: "hover:border-slate-300 hover:text-slate-900",
    badge: "bg-slate-100 text-slate-700",
  },
  "route-strategy": {
    activeBtn: "bg-emerald-600 text-white border-emerald-600",
    inactiveHover: "hover:border-emerald-300 hover:text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
  },
  accommodation: {
    activeBtn: "bg-amber-500 text-white border-amber-500",
    inactiveHover: "hover:border-amber-300 hover:text-amber-700",
    badge: "bg-amber-50 text-amber-700",
  },
  "gear-budget": {
    activeBtn: "bg-sky-600 text-white border-sky-600",
    inactiveHover: "hover:border-sky-300 hover:text-sky-700",
    badge: "bg-sky-50 text-sky-700",
  },
};

export interface GuideSection {
  heading: string;
  headingEn: string;
  paragraphs: string[];
  paragraphsEn: string[];
}

export interface GuideArticle {
  slug: string;
  category: GuideCategory;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  seoDescription: string;
  seoDescriptionEn: string;
  keywords: string;
  keywordsEn: string;
  readingMinutes: number;
  updatedAt: string;
  sections: GuideSection[];
  pitfallTitle: string;
  pitfallTitleEn: string;
  pitfallPoints: string[];
  pitfallPointsEn: string[];
  relatedTool: {
    path: string;
    label: string;
    labelEn: string;
    description: string;
    descriptionEn: string;
  };
}
