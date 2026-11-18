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

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "best-seasons",
    category: "route-strategy",
    title: "朝聖之路什麼時候去最好？四季氣候與出發月份分析",
    titleEn: "When to Walk the Camino de Santiago: Seasonal Weather & Best Months",
    subtitle:
      "比較春、夏、秋、冬四季氣溫、降雨、人潮與庇護所營運狀況，了解不同季節的徒步優勢與風險，找出最適合你的出發月份。",
    subtitleEn:
      "Compare seasonal temperatures, rainfall, pilgrim numbers, and albergue availability to understand the advantages and challenges of each season and choose your ideal departure window.",
    seoDescription:
      "完整解析聖雅各朝聖之路四季氣候與最佳出發月份：比較 5 月與 9 月熱門時段、7–8 月梅塞塔高溫風險、加利西亞秋季降雨，以及冬季 11–3 月庇護所營運與庇里牛斯山封路規定。",
    seoDescriptionEn:
      "A seasonal guide to the Camino de Santiago: compare the popular May and September periods, Meseta summer heat, autumn rainfall in Galicia, and winter albergue availability and Pyrenees route restrictions.",
    keywords: "朝聖之路最佳月份, 朝聖之路天氣, 法國之路季節, 朝聖之路冬天, 朝聖之路庇護所, Camino best months",
    keywordsEn:
      "best time to walk Camino, Camino de Santiago weather, Camino winter closures, Camino albergues, Camino seasonal guide",
    readingMinutes: 6,
    updatedAt: "2026-11-16",
    sections: [
      {
        heading: "春季（4 月至 6 月）：百花盛開與舒適的徒步氣候",
        headingEn: "Spring (April to June): Wildflowers and Mild Walking Conditions",
        paragraphs: [
          "5 月至 6 月上旬是法國之路與葡萄牙之路相當受歡迎的徒步時段，氣溫通常適合長時間步行，沿途植被逐漸轉綠，納瓦拉（Navarra）與里奧哈（La Rioja）也能欣賞春季田野景觀。不過，各路段的氣溫差異很大，庇里牛斯山、梅塞塔高原與加利西亞不能使用同一組氣溫數據概括。春季早晚仍可能偏冷，建議準備薄刷毛、防風外套及雨具。",
          "4 月初至 5 月初，庇里牛斯山高海拔區域仍可能遇到降雪、強風及低溫，出發前應確認山區天候與路線開放狀況。5 月至 6 月則逐漸進入熱門徒步季節，尤其熱門城鎮及 Sarria 至 Santiago 的最後 100 公里，住宿需求較高。公立與私立庇護所的預約規則不同，應事先確認入住方式，並適度提早抵達目的地。",
        ],
        paragraphsEn: [
          "May through early June is a popular walking period for the Camino Francés and Portuguese routes. Temperatures are generally comfortable for long-distance walking, vegetation becomes greener, and the countryside of Navarra and La Rioja is especially attractive in spring. However, temperatures vary considerably between regions, so the Pyrenees, Meseta, and Galicia should not be treated as having the same climate. Mornings and evenings can still be cool, so bring a light fleece, a windproof jacket, and rain protection.",
          "From early April through early May, high-altitude sections of the Pyrenees may still experience snow, strong winds, and low temperatures. Check mountain weather and route restrictions before departure. May and June gradually enter the popular walking season, with higher accommodation demand in popular towns and on the final 100 km from Sarria to Santiago. Public and private albergues have different booking policies, so check their arrangements and plan to arrive at your destination in good time.",
        ],
      },
      {
        heading: "夏季（7 月至 8 月）：海岸路線選擇與梅塞塔高溫防範",
        headingEn: "Summer (July to August): Coastal Alternatives and Meseta Heat Precautions",
        paragraphs: [
          "7、8 月的西班牙內陸，特別是 Burgos 至 León 之間的梅塞塔高原（Meseta），日照強烈、遮蔭有限，熱浪期間氣溫可能超過 35°C。長時間暴露在烈日下容易增加脫水與熱傷害風險。若在盛夏徒步，應依照日出時間與路況安排清晨出發，盡量避開正午高溫時段，並在高溫時段前完成主要徒步路段。飲水量應依照氣溫、行走距離、個人流汗量及沿途補水機會調整，不能只依賴固定的飲水容量。",
          "如果只能在暑假出發，可以考慮沿大西洋海岸前進的北方之路（Camino del Norte）或葡萄牙海岸之路（Camino Portugués de la Costa）。相較於西班牙內陸，海岸地區通常受到海洋氣候調節，氣溫較為溫和，但仍可能遇到熱浪、強風及降雨。西班牙北部 8 月適逢暑假與旅遊旺季，部分熱門海岸城鎮住宿需求較高，建議提早確認房況並預訂。",
        ],
        paragraphsEn: [
          "In July and August, inland Spain, particularly the exposed Meseta plateau between Burgos and León, experiences strong sunshine and limited shade. Temperatures can exceed 35°C during heatwaves, increasing the risk of dehydration and heat-related illness. If walking in midsummer, plan an early start according to sunrise and trail conditions, avoid the hottest part of the day, and aim to complete the main walking section before peak afternoon heat. Water requirements depend on temperature, distance, individual sweat loss, and opportunities to refill; do not rely on a fixed quantity for every stage.",
          "If you can only travel during the summer holidays, consider the coastal Camino del Norte or the Portuguese Coastal Route along the Atlantic. Coastal areas are generally moderated by maritime conditions and tend to be milder than inland Spain, although heatwaves, strong winds, and rain are still possible. August is also a major holiday period in northern Spain, and accommodation demand can be high in popular coastal towns. Check availability and book ahead.",
        ],
      },
      {
        heading: "秋季（9 月至 10 月）：葡萄採收季與舒適徒步窗口",
        headingEn: "Autumn (September to October): Harvest Season and Comfortable Walking Conditions",
        paragraphs: [
          "9 月中旬至 10 月中旬是許多朝聖者喜愛的徒步時段。夏季酷熱逐漸消退，白天氣溫通常較適合長距離步行，里奧哈產區也進入葡萄採收季，可以欣賞葡萄園及秋季田野景觀。不過，進入 10 月後，加利西亞（Galicia）的降雨日數通常會明顯增加，尤其 10 月下旬更需要留意連續降雨及濕滑路面，建議準備可靠的防水外套、背包防水套與快乾衣物。",
          "9 月是朝聖之路全年人潮最集中的月份之一。根據 2025 年朝聖者辦公室統計，9 月抵達聖地牙哥的人數為 81,533 人，排名全年第一，其次為 5 月的 78,648 人及 8 月的 77,095 人。這些數字是依照抵達聖地牙哥並取得 Compostela 的月份統計，而非各月份的出發人數。從 Sarria 出發的最後 100 公里尤其熱門，建議提早預訂熱門住宿。進入 10 月中下旬後，整體人潮通常逐漸減少，但天候與庇護所營運狀況也需要更加留意。",
        ],
        paragraphsEn: [
          "Mid-September through mid-October is a favorite walking period for many pilgrims. Summer heat gradually subsides, daytime temperatures are generally more comfortable for long-distance walking, and the La Rioja region enters its grape harvest season. However, rainfall in Galicia typically increases in October, particularly toward the end of the month. Prepare a reliable waterproof jacket, backpack cover, and quick-drying clothing for prolonged rain and slippery trails.",
          "September is one of the busiest months on the Camino. According to 2025 statistics from the Pilgrim's Office, 81,533 pilgrims received their Compostela in September, making it the busiest month of the year. May followed with 78,648 and August with 77,095. These figures refer to the month of arrival in Santiago, not the month pilgrims began walking. The final 100 km from Sarria is particularly popular, so advance accommodation bookings are recommended. Overall pilgrim numbers generally decline from mid-to-late October, although weather conditions and albergue opening schedules also require attention.",
        ],
      },
      {
        heading: "冬季（11 月至隔年 3 月）：寧靜徒步與住宿後勤考驗",
        headingEn: "Winter (November to March): Quiet Trails and Logistical Challenges",
        paragraphs: [
          "每年 11 月 1 日至隔年 3 月 31 日，法國之路起點 Saint-Jean-Pied-de-Port 翻越庇里牛斯山的拿破崙山脊路線（Route Napoléon）依法限制通行，朝聖者必須改走海拔較低的 Valcarlos 河谷路線。這項限制僅適用於拿破崙路線，並不代表整條法國之路冬季封閉。即使選擇 Valcarlos，仍應留意山區降雪、結冰與強風等天候風險。",
          "冬季沿途部分季節性私立庇護所、餐廳及商店會縮短營業時間或暫停營業，但實際情況依路線、城鎮及住宿業者而異，不能假設所有地區都有相同比例的休館情況。出發前應逐日確認預定住宿是否營業、是否需要預約，以及附近是否有餐飲與補給設施。依各庇護所提供的寢具及住宿規定，準備適當的睡袋或睡袋內套，並攜帶備用糧食與足夠的保暖裝備。",
          "冬季的日照時間較短，部分高海拔路段可能遇到積雪、結冰或濃霧，公車與其他交通班次也可能減少。適合具備低溫徒步經驗、能彈性調整每日距離，且願意提前確認住宿及補給安排的朝聖者。若缺乏冬季登山經驗，不建議僅為了避開人潮而選擇高風險的山區路段。",
        ],
        paragraphsEn: [
          "From November 1 to March 31 each year, the Napoleon Route over the Pyrenees from Saint-Jean-Pied-de-Port is legally restricted. Pilgrims must use the lower-altitude Valcarlos Valley Route instead. This restriction applies to the Napoleon Route only; it does not mean that the entire Camino Francés is closed in winter. Even on the Valcarlos route, be prepared for snow, ice, and strong winds.",
          "Some seasonal private albergues, restaurants, and shops reduce their opening hours or close during winter. Actual availability varies by route, town, and individual provider, so there is no single closure percentage that applies to the entire Camino. Before departure, verify each night's accommodation, booking requirements, and nearby food and supply options. Bring an appropriate sleeping bag or liner according to the bedding and accommodation policies of each albergue, along with spare food and adequate warm clothing.",
          "Winter brings shorter daylight hours, and high-altitude sections may experience snow, ice, or dense fog. Bus services and other transport connections may also be reduced. Winter walking is best suited to pilgrims with cold-weather hiking experience, flexible daily distances, and the willingness to verify accommodation and supply arrangements in advance. If you lack winter mountain experience, do not choose a hazardous mountain route simply to avoid crowds.",
        ],
      },
    ],
    pitfallTitle: "挑選出發月份最常忽略的三件事",
    pitfallTitleEn: "3 Common Seasonal Pitfalls to Avoid",
    pitfallPoints: [
      "不要只參考聖地牙哥的氣溫安排衣物。庇里牛斯山、梅塞塔高原與加利西亞的海拔及氣候差異很大，即使同一天也可能出現明顯溫差。建議採用洋蔥式穿搭，準備防風、防雨及保暖衣物。",
      "留意西班牙聖週（Semana Santa）及國定連假。熱門城市與觀光地區的住宿、交通需求可能明顯增加，若行程需要搭乘火車或預訂熱門住宿，建議提前確認並安排。",
      "加利西亞受大西洋氣候影響，全年都有降雨可能，尤其秋冬及春季降雨較頻繁。無論哪個月份出發，都應準備防水外套、背包防水套及快乾衣物。",
    ],
    pitfallPointsEn: [
      "Do not plan your clothing based solely on temperatures in Santiago. The Pyrenees, Meseta, and Galicia have different elevations and climates, and temperatures can vary significantly even on the same day. Use a layering system and bring windproof, waterproof, and warm clothing.",
      "Watch out for Semana Santa (Holy Week) and Spanish public holidays. Accommodation and transport demand can increase significantly in popular cities and tourist areas. Check availability and book ahead if your itinerary requires trains or popular accommodation.",
      "Galicia has an Atlantic climate and can experience rain throughout the year, with more frequent rainfall in autumn, winter, and spring. Regardless of your departure month, bring a waterproof jacket, backpack cover, and quick-drying clothing.",
    ],
    relatedTool: {
      path: "/schedule/frances",
      label: "前往排程規劃",
      labelEn: "Open Scheduler",
      description: "選定理想月份後，直接設定出發日，推算每日分段里程與預計完走日期，並依季節調整行程安排。",
      descriptionEn:
        "Set your departure date to calculate daily stage distances and your expected arrival in Santiago, then adjust your itinerary according to seasonal conditions.",
    },
  },

  {
    slug: "pyrenees-crossing",
    category: "route-strategy",
    title: "翻越庇里牛斯山：拿破崙路線 vs. 河谷路線",
    titleEn: "Crossing the Pyrenees: Napoleon Route vs. Valcarlos Valley Route",
    subtitle:
      "法國之路最具挑戰性的路段之一：第一天就要翻越庇里牛斯山，一次搞懂兩條路線的季節限制、補給點與分段拆解技巧。",
    subtitleEn:
      "One of the toughest stages of the Camino Francés: Day 1 crosses the Pyrenees. Learn the seasonal restrictions, supply points, and how to split the stage.",
    seoDescription:
      "法國之路第一天 SJPP 到 Roncesvalles 完整攻略：比較拿破崙山脊路線與 Valcarlos 河谷路線的距離、海拔爬升、冬季封路規定、Orisson 與 Borda 分段住宿策略。",
    seoDescriptionEn:
      "Complete guide to Stage 1 of the Camino Francés (SJPP to Roncesvalles): compare the Napoleon and Valcarlos routes, elevation gain, winter closures, and overnight stops at Orisson and Borda.",
    keywords: "庇里牛斯山攻略, SJPP到Roncesvalles, 拿破崙路線, Orisson住宿, Borda住宿, 法國之路第一天",
    keywordsEn: "Pyrenees Camino crossing, Napoleon Route vs Valcarlos, SJPP to Roncesvalles, Orisson, Auberge Borda",
    readingMinutes: 6,
    updatedAt: "2026-11-16",
    sections: [
      {
        heading: "為什麼第一天被稱為「朝聖之路最硬的一關」？",
        headingEn: "Why Day 1 Is One of the Toughest Stages",
        paragraphs: [
          "法國之路傳統起點 Saint-Jean-Pied-de-Port（SJPP）海拔約 170 公尺，拿破崙路線需要在約 24.2 公里的路程中翻越 Col de Lepoeder（約 1,430 公尺），累積爬升約 1,250 公尺。實際距離與爬升數據會因 GPX 路線及測量方式而有所差異。對剛搭乘長途飛機、尚未適應時差與背包重量的徒步者來說，第一天就挑戰長距離爬坡，容易增加肌肉、肌腱及膝關節的負荷。",
          "這段路並非一定要在一天內完成，可以選擇在 Orisson 或 Borda 住宿，將翻山行程拆成兩天；也可以依照季節與當日天候，選擇海拔較低的 Valcarlos 河谷路線。不要為了趕行程而勉強完成翻山，應優先考量身體狀況與山區安全。",
        ],
        paragraphsEn: [
          "Starting at approximately 170m in Saint-Jean-Pied-de-Port (SJPP), the Napoleon Route covers around 24.2 km and climbs to Col de Lepoeder at approximately 1,430m, with about 1,250m of cumulative ascent. Actual figures vary depending on the GPX track and measurement method. For pilgrims arriving after a long-haul flight, jet lag, an unfamiliar backpack, and sustained climbing can place considerable strain on muscles, tendons, and knees.",
          "You do not have to complete the entire crossing in one day. Staying overnight at Orisson or Borda allows you to split the climb into two stages. Alternatively, choose the lower-altitude Valcarlos Route depending on the season and weather. Prioritize your physical condition and mountain safety over your itinerary.",
        ],
      },
      {
        heading: "拿破崙路線（Route Napoléon）：風景壯闊但受季節嚴格管制",
        headingEn: "Route Napoléon: Sweeping Views with Strict Seasonal Restrictions",
        paragraphs: [
          "拿破崙路線沿庇里牛斯山高地與山脊推進，視野開闊，可以欣賞壯麗的山脈及高山草原景觀，是春夏季熱門的朝聖路線。但由於高海拔區段天候變化劇烈，容易受到降雪、濃霧及強風影響，每年 11 月 1 日至隔年 3 月 31 日，納瓦拉政府依法限制通行，必須改走 Valcarlos 河谷路線。2026 年 11 月 1 日至 2027 年 3 月 31 日的限制，依據納瓦拉政府 Resolución 7001E/2026 執行。",
          "即使在 4 月至 10 月的開放期間，高海拔山區仍可能因暴風雪、濃霧、強風等惡劣天候而不適合通行。出發前應先向 Saint-Jean-Pied-de-Port 朝聖者辦公室（39 Rue de la Citadelle）確認當日天候與路線狀況。若官方發布封閉或安全警告，應遵循指示改走 Valcarlos 路線，必要時延後出發。",
          "越過 Orisson 與 Borda 後，沿途幾乎沒有村莊及可靠的商業補給點。出發前應準備足夠飲水、食物與保暖裝備，並留意手機訊號在部分高山路段可能不穩定。",
        ],
        paragraphsEn: [
          "The Napoleon Route crosses the high mountain terrain and ridges of the Pyrenees, offering sweeping views of alpine meadows and mountain scenery. It is a popular choice during spring and summer. However, the high-altitude sections are exposed to rapidly changing weather, including snow, dense fog, and strong winds. From November 1 to March 31 each year, the Government of Navarre restricts access to this eastern variant, making the Valcarlos Route mandatory. The 2026–2027 restriction is covered by Navarre Resolution 7001E/2026.",
          "Even when the route is officially open between April and October, severe weather can still make the crossing unsafe. Before departure, check the latest weather and trail conditions at the Saint-Jean-Pied-de-Port Pilgrim Office (39 Rue de la Citadelle). Follow official closure notices and safety instructions, use the Valcarlos alternative when required, or postpone your departure if necessary.",
          "Beyond Orisson and Borda, there are virtually no villages or reliable commercial supply points. Carry sufficient water, food, and warm clothing. Mobile phone reception may also be unreliable in some mountain sections.",
        ],
      },
      {
        heading: "拆成兩天走的黃金策略：停留在 Orisson 或 Borda",
        headingEn: "Splitting the Crossing: Staying at Orisson or Auberge Borda",
        paragraphs: [
          "如果希望降低單日爬坡及膝蓋負荷，可以將拿破崙路線拆成兩天，第一晚選擇住宿於 Refuge Orisson 或 Auberge Borda。兩處都位於 SJPP 至 Roncesvalles 的山路上，但位置並不相同：Orisson 距離 SJPP 約 7.5 公里，Borda 則約 8.5 公里。兩處住宿床位有限，旺季建議提前數週至數月預約，實際訂房情況應以住宿方公告為準。",
          "第一天從 SJPP 出發，完成前段持續爬升的山路後，在 Orisson 或 Borda 休息過夜。第二天再繼續翻越 Bentartea 與 Lepoeder，最後下坡抵達 Roncesvalles。若住在 Orisson，第二天約需行走 16.7 公里；若住在 Borda，則約需行走 15.7 公里。實際距離依住宿位置及選擇的下山路線而異。",
          "這種分段方式可以減少單日長時間連續爬坡的負擔，但第二天仍須翻越高海拔山區，並不是平緩的休閒步道。出發前仍應確認天候、日照時間及個人體能，不要為了欣賞日出而在天色未明時冒險進入山區。",
        ],
        paragraphsEn: [
          "To reduce the physical strain of a long climbing day, consider splitting the Napoleon Route into two stages by staying overnight at Refuge Orisson or Auberge Borda. Although both are located along the route from SJPP to Roncesvalles, they are not at the same distance: Orisson is approximately 7.5 km from SJPP, while Borda is around 8.5 km. Both have limited accommodation, so booking several weeks or even months ahead is advisable during peak season. Actual availability depends on the accommodation provider.",
          "On Day 1, walk from SJPP through the initial sustained climb and stay overnight at Orisson or Borda. On Day 2, continue over the Bentartea and Lepoeder passes before descending to Roncesvalles. The remaining distance is approximately 16.7 km from Orisson or 15.7 km from Borda. Actual distances vary according to the accommodation location and descent option.",
          "Splitting the stage reduces the burden of continuous climbing in one day, but Day 2 still involves high-altitude mountain terrain. It is not an easy or flat walk. Check weather conditions, daylight hours, and your physical condition before setting off. Do not enter the mountains in darkness simply to catch the sunrise.",
        ],
      },
      {
        heading: "河谷路線（Valcarlos Route）：冬季強制替代路線與惡劣天候備案",
        headingEn: "Valcarlos Route: The Mandatory Winter Alternative and Bad-Weather Option",
        paragraphs: [
          "如果在冬季出發，或拿破崙路線遇上不適合通行的惡劣天候，可以選擇沿山谷前進的 Valcarlos 路線。這條路線經過 Arnéguy、Valcarlos 小鎮，再沿 N-135 公路及周邊步道爬升至 Ibañeta 埡口（約 1,057 公尺），最後抵達 Roncesvalles。",
          "相較於拿破崙路線，Valcarlos 的行走海拔較低，沿途經過 Valcarlos 小鎮，可以尋找咖啡館及其他補給設施，休息與補充物資相對方便。不過，這條路線仍有持續爬坡，並非完全平坦；部分路段沿公路行走，可能遇到車流、彎道及路肩狹窄等問題，行走時應注意交通安全。",
          "每年 11 月 1 日至隔年 3 月 31 日，Valcarlos 是官方規定的冬季替代路線。即使選擇河谷路線，冬季仍應準備防水外套、保暖衣物及適合濕滑路面的鞋子，並在出發前確認當地交通與天候狀況。",
        ],
        paragraphsEn: [
          "If you are walking during winter, or if severe weather makes the Napoleon Route unsuitable, consider the Valcarlos Route through the valley. It passes through Arnéguy and the village of Valcarlos before climbing along sections of the N-135 road and nearby paths to the Ibañeta Pass (approximately 1,057m), then continues to Roncesvalles.",
          "Compared with the Napoleon Route, Valcarlos stays at a lower altitude and passes through Valcarlos village, where pilgrims can look for cafes and other supply facilities. However, the route still involves sustained climbing and is not entirely flat. Some sections follow roads with vehicle traffic, bends, and narrow shoulders, so take particular care around passing vehicles.",
          "From November 1 to March 31 each year, Valcarlos is the officially required winter alternative. Even on this lower-altitude route, bring waterproof clothing, warm layers, and footwear suitable for wet or slippery conditions. Always check local weather and road conditions before departure.",
        ],
      },
    ],
    pitfallTitle: "翻山前的實戰補給提醒",
    pitfallTitleEn: "Pre-Climb Supply and Safety Checklist",
    pitfallPoints: [
      "離開 Orisson 或 Borda 後，直到 Roncesvalles 前幾乎沒有可靠的商業補給點。沿途可能出現季節性餐飲服務，但不保證每日營業，不應將流動餐車視為固定補給來源。建議至少準備 2L 飲水，炎熱天氣或個人需求較高時應增加水量，並攜帶午餐、堅果、香蕉等行動糧。",
      "從 Col de Lepoeder 下山有兩種主要走法：一條是穿越森林的較短捷徑，坡度較陡，雨天容易濕滑；另一條是先經過 Ibañeta 埡口，再繼續前往 Roncesvalles，距離較長，但可避開部分陡峭的森林捷徑。建議使用雙登山杖，並依天候、路況與膝蓋狀況選擇下山路線。",
      "Roncesvalles 的修道院朝聖者庇護所床位較多，但旺季仍可能客滿，建議提前確認開放情況並預約。當地缺乏大型超市及完整的生活補給設施，抵達後可選擇修道院附設餐廳或當地餐飲設施用餐，不要預期能在村內進行完整的物資採購。",
    ],
    pitfallPointsEn: [
      "Beyond Orisson or Borda, there are virtually no reliable commercial supply points before Roncesvalles. Seasonal food services may appear along the route, but they do not operate every day and should never be treated as guaranteed supply stops. Carry at least 2L of water, increasing this amount in hot weather or according to your personal needs. Bring lunch and trail snacks such as nuts and bananas.",
      "There are two main descent options from Col de Lepoeder. The shorter route goes through the forest and is steeper, becoming slippery in wet weather. The alternative passes via the Ibañeta Pass before continuing to Roncesvalles. It is longer but avoids part of the steep forest shortcut. Trekking poles are recommended, and your choice should depend on weather, trail conditions, and your knee condition.",
      "Roncesvalles has a relatively large pilgrim hostel, but beds can still fill up during peak season. Check opening arrangements and book ahead. The village has limited shopping and supply facilities, so do not expect to buy all your provisions there. Pilgrims can look for dining options at the monastery restaurant or other local establishments.",
    ],
    relatedTool: {
      path: "/schedule/frances",
      label: "查看法國之路",
      labelEn: "French Way",
      description: "可在排程工具中查看 SJPP 至 Roncesvalles 的距離、海拔數據，以及 Orisson、Borda 等建議拆段方式。",
      descriptionEn:
        "View stage distances, elevation data, and suggested overnight stops such as Orisson and Borda in the French Way scheduler.",
    },
  },

  {
    slug: "last-100km-guide",
    category: "route-strategy",
    title: "最後 100 公里怎麼走？Sarria 與 Tui 路線及行程規劃",
    titleEn: "Walking the Last 100 km: Sarria vs. Tui Routes & Itinerary Planning",
    subtitle:
      "假期只有一週，也能挑戰朝聖之路！比較法國之路 Sarria 與葡萄牙之路 Tui 的路線特色、交通接駁、5～7 天分段安排，以及申請完步證書（Compostela）的官方規定。",
    subtitleEn:
      "Have only a week off? Compare the French Way from Sarria and the Portuguese Way from Tui, including transport, 5–7 day itineraries, and the official requirements for the Compostela.",
    seoDescription:
      "聖雅各朝聖之路最後 100 公里攻略：比較法國之路 Sarria 與葡萄牙之路 Tui 的路線距離、難度、人潮、交通方式、5～7 天分段安排，以及步行者每日至少 2 個印章的完步證書規定。",
    seoDescriptionEn:
      "A guide to the final 100 km of the Camino de Santiago from Sarria or Tui, comparing distances, difficulty, crowds, transport, 5–7 day itineraries, and the two-stamp-per-day requirement for the Compostela.",
    keywords: "朝聖之路最後100公里, Sarria出發, Tui出發, 完步證書規定, 朝聖護照蓋章, Camino分段規劃",
    keywordsEn:
      "last 100km Camino, Sarria to Santiago, Tui to Santiago, Compostela requirements, two stamps per day, Camino itinerary",
    readingMinutes: 7,
    updatedAt: "2026-11-16",
    sections: [
      {
        heading: "為什麼大家都從最後 100 公里出發？",
        headingEn: "Why Start Within the Final 100 km?",
        paragraphs: [
          "根據聖地牙哥朝聖者接待辦公室（Oficina del Peregrino）的規定，步行者或騎馬者必須沿著同一條獲認可的朝聖路線，連續完成至少最後 100 公里，並抵達聖地牙哥大教堂，才符合申請官方拉丁文完步證書（Compostela）的距離條件。申請者也必須具有宗教或靈性目的，並以朝聖者護照（Credencial）記錄行程。",
          "因此，Sarria（法國之路）與 Tui（葡萄牙之路）成為兩個常見的百公里起點。Sarria 至聖地牙哥約 114.2 公里，Tui 約 116 公里，兩者都超過 100 公里的最低門檻。對假期有限的旅人而言，安排 5～7 天步行，再預留交通與抵達後的緩衝時間，是較實際的規劃方式。",
          "注意：完步證書並不是只要走滿 100 公里就一定能領取。除了距離與蓋章要求，也必須符合官方對路線連續性、抵達終點及朝聖目的的規定。若分成多次完成，必須依照地理位置及時間順序接續行走。",
        ],
        paragraphsEn: [
          "According to the Pilgrim's Reception Office in Santiago, walkers and horseback pilgrims must complete at least the final 100 continuous kilometres on a recognised Camino route, following the same route to the Cathedral of Santiago. The Compostela also requires a religious or spiritual motivation, and the journey must be documented in an accepted Pilgrim's Credential.",
          "Sarria on the French Way and Tui on the Portuguese Way are two popular starting points for this final stretch. Sarria is approximately 114.2 km from Santiago, while Tui is around 116 km. Both exceed the minimum distance requirement. If you have limited vacation time, allow 5–7 walking days plus additional time for transport and arrival arrangements.",
          "Meeting the distance requirement alone does not automatically guarantee a Compostela. Pilgrims must also comply with the official requirements for route continuity, arrival at the Cathedral, stamps, and the religious or spiritual purpose of the pilgrimage. Walks completed in separate trips must follow chronological and geographical order.",
        ],
      },
      {
        heading: "起點對決：法國之路 Sarria vs. 葡萄牙之路 Tui",
        headingEn: "Sarria (French Way) vs. Tui (Portuguese Way)",
        paragraphs: [
          "Sarria（至聖地牙哥約 114.2 km）是法國之路最熱門的百公里起點之一。沿途城鎮、住宿、餐飲與補給設施相對密集，對第一次走朝聖之路的人較容易安排。不過，這也是人潮最集中的路段之一，旺季住宿需求高，熱門城鎮可能需要提早規劃。根據 2025 年朝聖者統計，約有 161,882 人從 Sarria 出發。",
          "Tui（至聖地牙哥約 116 km）位於西班牙加利西亞與葡萄牙的邊境，隔著米尼奧河（Río Miño）與葡萄牙 Valença 相望。這條葡萄牙中部之路沿途可經過森林、村落、歷史城鎮與石橋，地形整體起伏相對溫和，但仍有部分上坡路段。2025 年約有 41,643 人從 Tui 出發，出發人數明顯少於 Sarria，但仍是相當成熟的朝聖路線。",
          "從波多前往 Tui，可考慮巴士或火車接駁。巴士車程約 2 小時，實際時間依班次及交通狀況而異；火車並非直達，通常需要轉乘。若從波多機場抵達，還要另外計算機場至市區或巴士站的接駁時間，不宜只用波多市區至 Tui 的車程估算整段交通。",
          "簡單來說：想體驗熱鬧的朝聖者社群、沿途補給選擇多，且不介意人潮，可考慮 Sarria；偏好葡萄牙路線文化、邊境城鎮風景，以及相對較少的出發人數，可考慮 Tui。",
        ],
        paragraphsEn: [
          "Sarria (approximately 114.2 km from Santiago) is one of the most popular starting points on the French Way. Towns, accommodation, restaurants, and supply stops are relatively frequent, making this route easier to organise for first-time pilgrims. However, it is also one of the busiest sections of the Camino, and accommodation in popular towns can be in high demand during peak season. Around 161,882 pilgrims started in Sarria in 2025.",
          "Tui (approximately 116 km from Santiago) lies on the border between Galicia in Spain and Portugal, facing the Portuguese town of Valença across the River Miño. The Central Portuguese Way passes through woodland, villages, historic towns, and stone bridges. Its overall profile is relatively moderate, although some uphill sections remain. Around 41,643 pilgrims started in Tui in 2025, considerably fewer than in Sarria, but it is still an established and well-travelled route.",
          "From Porto, you can reach Tui by bus or train connections. The bus journey takes approximately two hours, depending on the service and traffic. Trains are not direct and require a transfer. If you are arriving at Porto Airport, allow extra time to travel between the airport, the city, and the departure station or bus terminal.",
          "In short: choose Sarria if you want a lively pilgrim atmosphere and frequent services, and do not mind larger crowds. Choose Tui if you prefer the Portuguese route's culture, border-town scenery, and a lower number of starting pilgrims.",
        ],
      },
      {
        heading: "5～7 天怎麼安排？兩條路線的分段建議",
        headingEn: "How to Plan 5–7 Days: Suggested Stage Splits",
        paragraphs: [
          "【Sarria：法國之路】全程約 114.2 km。5 天走法是較緊湊的經典安排，常見分段約為 Sarria → Portomarín（22.2 km）、Portomarín → Palas de Rei（24.8 km）、Palas de Rei → Arzúa（28.5 km）、Arzúa → O Pedrouzo（19.3 km）、O Pedrouzo → Santiago（19.4 km）。其中 Palas de Rei 至 Arzúa 路段較長，對體力與腳部耐受度有一定要求。",
          "若希望降低每日負擔，可改安排 6 天，最長單日距離可縮短至約 22.3 km；若有較充裕時間，7 天行程則能將每日距離控制在約 20 km 以內，適合希望放慢腳步、保留休息時間或初次長距離徒步的人。",
          "【Tui：葡萄牙之路】全程約 116 km。6 天是常見且較均衡的安排，分段可參考 Tui → O Porriño（約 16.1 km）、O Porriño → Redondela（約 16 km）、Redondela → Pontevedra（約 19.8 km）、Pontevedra → Caldas de Reis（約 21.1 km）、Caldas de Reis → Padrón（約 18.6 km）、Padrón → Santiago（約 24.4 km）。實際距離會因路線版本與測量方式而略有差異。",
          "Tui 若壓縮成 5 天，部分路段會超過 25 km，甚至接近 29 km，較適合已有長距離徒步經驗、體能與腳部狀況良好的人。若安排 7 天，則能將每日距離縮短，較容易兼顧沿途景點、休息與住宿安排。",
          "以上是規劃參考，不代表固定或唯一的官方分段。每日距離應依個人體能、天候、住宿位置及庇護所營業情況調整。尤其旺季期間，建議先確認住宿是否需要預訂，以及抵達時間是否符合入住規定。",
        ],
        paragraphsEn: [
          "[Sarria – French Way] The total distance is approximately 114.2 km. A five-day itinerary is a relatively compact and popular option. A typical split is Sarria → Portomarín (22.2 km), Portomarín → Palas de Rei (24.8 km), Palas de Rei → Arzúa (28.5 km), Arzúa → O Pedrouzo (19.3 km), and O Pedrouzo → Santiago (19.4 km). The Palas de Rei–Arzúa stage is particularly long and requires good stamina and foot endurance.",
          "For a more balanced pace, a six-day itinerary reduces the longest daily stage to approximately 22.3 km. With seven days, daily distances can generally be kept below around 20 km, allowing more time for breaks and a less demanding first long-distance pilgrimage.",
          "[Tui – Portuguese Way] The total distance is approximately 116 km. Six days is a common and relatively balanced option. Suggested stages are Tui → O Porriño (about 16.1 km), O Porriño → Redondela (about 16 km), Redondela → Pontevedra (about 19.8 km), Pontevedra → Caldas de Reis (about 21.1 km), Caldas de Reis → Padrón (about 18.6 km), and Padrón → Santiago (about 24.4 km). Actual distances may vary slightly depending on the route version and measurement method.",
          "Compressing the Tui route into five days creates several stages longer than 25 km, with some approaching 29 km. This is more suitable for experienced long-distance walkers with good fitness and foot endurance. A seven-day itinerary shortens the daily distances and leaves more time for sightseeing, rest, and accommodation arrangements.",
          "These are planning examples, not fixed or official stage requirements. Adjust each day according to your fitness, weather, accommodation locations, and hostel opening schedules. During peak season, check whether accommodation needs to be booked in advance and confirm its check-in arrangements.",
        ],
      },
      {
        heading: "務必遵守的「最後 100 公里每日雙章規則」",
        headingEn: "Understanding the Two-Stamp-per-Day Rule",
        paragraphs: [
          "依照聖地牙哥朝聖者接待辦公室的規定，步行者在最後 100 公里內，朝聖者護照（Credencial）必須至少取得每天 2 個印章（sellos），並記錄日期。騎馬者也適用最後 100 公里的規定；自行車朝聖者則必須完成最後 200 公里，並符合相應的蓋章要求。",
          "若只完成最低要求的最後 100 公里，官方特別要求每一段行程的起點與終點都要蓋章，並標示日期。即使前一天已在某個城鎮蓋過住宿印章，隔天重新出發時，仍應在該段起點再次蓋章，以記錄重新接續行程的位置。",
          "印章可以在沿途教堂、庇護所、旅館、市政廳及其他提供朝聖者服務的場所取得。建議每天出發時先確認起點印章，中途再取得其他印章，抵達住宿後確認當日紀錄完整。不要把「一天蓋兩個章」誤解成只要集滿數量就能取代實際步行；印章應如實記錄自己的行程。",
          "朝聖者護照應使用聖地牙哥大教堂或其授權機構核發的版本。若在出發前購買，請先確認發行單位是否獲得官方授權，不要只因為某個商店或住宿有販售，就認定該護照一定符合領證資格。",
        ],
        paragraphsEn: [
          "According to the Pilgrim's Reception Office in Santiago, walkers must collect at least two dated stamps (sellos) in their Pilgrim's Credential for each day of the final 100 km. The same 100 km distance requirement applies to horseback pilgrims. Cyclists must complete the final 200 km and meet the corresponding credential requirements.",
          "If you are completing only the minimum final 100 km, the Office specifically requires a stamp at both the beginning and end of each stage, with the date recorded. Even if you stamped your credential at your accommodation the previous evening, you should obtain another stamp at the starting point when you resume walking the next day.",
          "Stamps are available at churches, albergues, hotels, town halls, and other places serving pilgrims along the route. Check that you have a stamp at the start of each stage, collect additional stamps along the way, and make sure your daily record is complete when you arrive. The two-stamp rule is not a substitute for actually completing the journey on foot; stamps should accurately reflect your route.",
          "Use a Pilgrim's Credential issued by the Cathedral of Santiago or an organisation specifically authorised by it. If you purchase one before departure, check that the issuing organisation is authorised. Do not assume that every credential sold by a shop or accommodation provider will automatically be accepted.",
        ],
      },
      {
        heading: "抵達聖地牙哥後：如何領取完步證書？",
        headingEn: "After Arriving in Santiago: How to Collect Your Compostela",
        paragraphs: [
          "抵達聖地牙哥後，符合資格的朝聖者可前往聖地牙哥朝聖者接待辦公室（Oficina del Peregrino）辦理完步證書。官方目前採用 QR Code 排隊號碼系統，領取號碼後可透過 QR Code 即時查看目前排隊進度，並依系統提示返回辦理。",
          "這項機制是排隊管理方式，不是預約指定日期或時段，也不代表一定能在抵達當天領到證書。官方提醒，在人潮大量增加時，無法保證當天完成領證，因此建議不要把領證安排在返程交通出發前的最後一刻。",
          "辦理時請準備好朝聖者護照，並依現場指示完成資料登記。朝聖者接待辦公室的開放時間會依季節調整，聖誕節及元旦休館；出發前及抵達前應再次查看官方公告。",
        ],
        paragraphsEn: [
          "After arriving in Santiago, pilgrims who meet the requirements can visit the Pilgrim's Reception Office (Oficina del Peregrino) to obtain their Compostela. The Office currently uses a QR-code queue ticket system. After collecting a ticket, you can check the queue status in real time using the QR code and return when instructed.",
          "This is a queue-management system, not a reservation for a specific date or time. It also does not guarantee that you will receive your certificate on the day you arrive. The Office warns that same-day collection cannot be guaranteed during periods of heavy demand, so avoid scheduling your certificate collection immediately before your return journey.",
          "Bring your Pilgrim's Credential and follow the instructions at the Office to complete the registration process. Opening hours vary by season, and the Office is closed on Christmas Day and New Year's Day. Check the official announcements before departure and again before arriving in Santiago.",
        ],
      },
    ],
    pitfallTitle: "短天數百公里行程的避坑重點",
    pitfallTitleEn: "Key Tips for a Short 100 km Pilgrimage",
    pitfallPoints: [
      "不要把最後 100 公里當成輕鬆散步：加利西亞路段並非全程平坦，仍有連續丘陵、上下坡與石板路。Sarria 五天走法可能出現接近 30 公里的單日路段；若體能或徒步經驗有限，建議改排 6～7 天。",
      "護照應使用官方或授權機構核發的 Credencial：出發前可先透過聖地牙哥朝聖者接待辦公室公布的授權機構查詢購買地點。護照價格依發行單位而異，不宜將 2～3 歐元視為固定價格。",
      "每天確認印章與日期：最後 100 公里內每天至少需要 2 個印章；若只走最低要求的 100 公里，還要特別留意每一段起點與終點的蓋章紀錄，避免隔天重新出發時漏蓋起點章。",
      "旺季住宿不要只依賴公立庇護所：部分公立庇護所採先到先得、不接受預約；熱門路段在旺季可能較難找到床位。出發前應確認各站住宿的營業日期、預訂方式及替代選擇。",
      "領證時間要預留彈性：聖地牙哥目前使用 QR Code 排隊號碼系統，但人潮多時不保證當天領證。建議抵達後先處理領證程序，再安排市區觀光及返程交通。",
    ],
    pitfallPointsEn: [
      "Do not underestimate the final 100 km. The Galician sections are not entirely flat and include rolling hills, climbs, descents, and stone-paved paths. A five-day Sarria itinerary can include a stage approaching 30 km. If you have limited fitness or hiking experience, consider allowing six or seven days.",
      "Use a Credencial issued by the Cathedral or an authorised organisation. Before departure, check the list of authorised issuing organisations published by the Pilgrim's Reception Office. Prices vary by issuer, so do not treat €2–3 as a fixed price.",
      "Check your stamps and dates every day. You need at least two stamps per day during the final 100 km. If you are completing only the minimum distance, pay particular attention to stamps at both the beginning and end of every stage, including the starting stamp when you resume walking.",
      "Do not rely exclusively on public albergues during peak season. Some public hostels operate on a first-come, first-served basis and do not accept reservations. Check opening dates, booking policies, and alternative accommodation before setting out.",
      "Allow flexibility for certificate collection. Santiago currently uses a QR-code queue ticket system, but same-day collection is not guaranteed during busy periods. Complete the registration process after arrival before planning sightseeing or onward travel.",
    ],
    relatedTool: {
      path: "/transport/portugues",
      label: "查看交通指南",
      labelEn: "Transit Guide",
      description:
        "查詢葡萄牙之路沿線交通，以及從波多、維戈等交通樞紐前往 Tui 的接駁方式；規劃 Sarria 行程時，也請另外確認前往起點的火車與巴士轉乘資訊。",
      descriptionEn:
        "Explore transport options along the Portuguese Way, including connections to Tui from Porto and Vigo. For a Sarria itinerary, check the separate train and bus connections to the starting point.",
    },
  },

  {
    slug: "albergue-guide",
    category: "accommodation",
    title: "朝聖之路住宿指南：公立、教區與私人庇護所怎麼選？",
    titleEn: "Choosing Camino Accommodation: Public, Parish & Private Albergues",
    subtitle:
      "第一次住朝聖者宿舍怎麼登記、幾點入住、床單與衛生用品怎麼準備？一次了解不同庇護所的收費、預訂規則與住宿禮儀。",
    subtitleEn:
      "Staying in a Camino albergue for the first time? Learn about check-in, booking policies, bedding, hygiene, and the differences between public, donativo, and private hostels.",
    seoDescription:
      "西班牙朝聖之路庇護所攻略：比較公立（Municipal）、教區（Parroquial）、捐獻制（Donativo）與私立（Private）庇護所的收費及預訂規則，整理入住流程、住宿禮儀、床單睡袋與臭蟲預防方法。",
    seoDescriptionEn:
      "A practical guide to Camino de Santiago albergues, comparing public, parish, donativo, and private accommodation, with booking policies, check-in procedures, bedding advice, dorm etiquette, and bed bug prevention.",
    keywords: "朝聖之路庇護所, Albergue入住, 公立庇護所價格, 捐獻制庇護所, 私立庇護所, Camino住宿, 臭蟲預防",
    keywordsEn:
      "Camino albergue guide, public vs private albergue, donativo albergue, Camino accommodation, bed bug prevention",
    readingMinutes: 7,
    updatedAt: "2026-11-16",
    sections: [
      {
        heading: "庇護所類型與價格區間總整理",
        headingEn: "Types of Albergues and Typical Costs",
        paragraphs: [
          "沿途專為朝聖者提供住宿的宿舍統稱為 Albergue。常見的分類方式包括公立或市立庇護所（Público / Municipal）、教區庇護所（Parroquial）、捐獻制庇護所（Donativo）與私立庇護所（Privado）。需要注意的是，這些名稱並非完全互斥：Municipal 和 Parroquial 通常描述管理或營運單位，而 Donativo 描述的是收費方式，因此教區庇護所也可能採捐獻制。",
          "公立／市立庇護所（Público / Municipal）：通常由地方政府或公共機構管理，價格相對便宜，部分採先到先得制，不接受預訂。例如加利西亞 Xunta 公立庇護所目前每人每晚收費 10 歐元，依抵達順序安排床位，並優先考慮徒步朝聖者。其他地區的公立庇護所則可能有不同價格、開放時間與預訂規則。",
          "教區庇護所（Parroquial）：通常由教會、教區或宗教團體管理，可能採固定費用，也可能採捐獻制。部分住宿由志工接待，提供較簡單的床位與共用設施，實際服務內容依各個地點而異。",
          "捐獻制庇護所（Donativo）：沒有固定住宿價格，住客依自身經濟能力及實際接受的服務支付合理捐獻。捐獻不是免費住宿，也不應將某個固定金額視為官方最低標準。若住宿包含晚餐、早餐或其他服務，可以將相關成本一併考慮。",
          "私立庇護所（Privado）：由私人業者經營，通常可以事先預訂，部分提供個人插座、床簾、置物櫃、毛巾或其他額外設備。價格依地區、季節、房型與設施而異，常見多人房床位約 14～25 歐元，熱門地區及旺季可能更高。私立不代表一定有床簾、獨立插座或免費床單，預訂前應確認實際提供的設備。",
          "整體而言，公立庇護所適合希望控制住宿預算、能接受不一定有床位的旅人；捐獻制適合願意參與朝聖者互助文化的人；私立庇護所則適合重視預訂彈性、住宿設備或希望提前確保床位的人。",
        ],
        paragraphsEn: [
          "Accommodation specifically serving Camino pilgrims is generally known as an albergue. Common descriptions include public or municipal albergues (Público / Municipal), parish albergues (Parroquial), donation-based albergues (Donativo), and private albergues (Privado). These categories are not entirely mutually exclusive: Municipal and Parroquial usually describe the operator, while Donativo describes the payment model. A parish albergue, for example, may also operate on a donation basis.",
          "[Public / Municipal] These hostels are generally managed by local authorities or public organisations. They are often among the most affordable options, and some operate on a first-come, first-served basis without reservations. For example, the Xunta public albergues in Galicia currently charge €10 per person per night, allocate beds according to arrival order, and give priority to pilgrims travelling on foot. Public hostels in other regions may have different prices, opening hours, and booking policies.",
          "[Parish] Parish albergues are generally run by churches, parishes, or religious organisations. They may charge a fixed fee or operate on a donation basis. Some are staffed by volunteers and provide relatively simple accommodation and shared facilities. Services vary from one location to another.",
          "[Donativo] Donation-based albergues do not have a fixed accommodation price. Guests contribute according to their financial circumstances and the services received. Donativo does not mean free accommodation, and there is no universal official minimum donation. If meals or other services are included, consider their value when deciding how much to contribute.",
          "[Private] Privately operated albergues can usually be booked in advance. Some offer additional amenities such as individual power outlets, privacy curtains, lockers, towels, or other facilities. Dormitory beds commonly cost around €14–25, although prices vary by location, season, room type, and facilities. Popular destinations and peak-season prices may be higher. Private accommodation does not automatically guarantee curtains, individual outlets, or free bedding, so check the details before booking.",
          "In general, public albergues suit pilgrims looking to minimise accommodation costs and who are comfortable with possible bed availability limitations. Donativo accommodation suits those who appreciate the tradition of mutual hospitality. Private albergues are useful for pilgrims who value advance booking, additional facilities, or greater certainty about having a bed.",
        ],
      },
      {
        heading: "入住標準流程與重要禮儀",
        headingEn: "Check-In Procedures and Dorm Etiquette",
        paragraphs: [
          "庇護所的入住與退房時間並沒有全路線統一標準，應以各住宿公告為準。以加利西亞 Xunta 公立庇護所為例，通常 13:00 開門、22:00 關門，並要求住客在隔天 08:00 前退房。其他地區的公立、教區及私立庇護所可能採用不同時段，部分私立住宿也可能允許較早入住或較晚退房。",
          "辦理入住時，通常需要出示有效身分證件或護照，以及朝聖者護照（Credencial）。管理員（Hospitalero / Hospitalera）會確認入住資格、登記住客資料、收取住宿費或捐獻，並視情況在 Credencial 上蓋章。建議事先準備好證件及付款方式，以加快登記流程。",
          "部分庇護所會要求住客在入口處更換室內鞋，或將登山鞋、登山杖放在指定區域。請依照現場規定使用鞋架及置物空間，不要穿著沾滿泥沙的登山鞋進入寢室，也不要將背包直接放在床墊上。",
          "進入寢室後，請將背包放在指定置物架或管理員允許的位置，保持公共空間整潔。若有使用廚房、浴室或洗衣設施，也應遵守使用時間及清潔規定。夜間請降低音量，並避免在其他住客休息後整理塑膠袋或使用手機閃光燈。",
          "大部分庇護所不會替住客保管所有個人物品，外出洗澡或用餐時，護照、錢包、手機及重要文件應隨身攜帶或妥善鎖好。住宿是否提供置物櫃及鎖具，也應事先確認。",
        ],
        paragraphsEn: [
          "There is no single check-in or checkout schedule for all Camino albergues. Always follow the rules of the individual establishment. For example, Xunta public albergues in Galicia generally open at 1:00 PM, close at 10:00 PM, and require guests to leave by 8:00 AM the following morning. Public, parish, and private hostels in other regions may follow different schedules, and some private establishments may allow earlier check-in or later checkout.",
          "At reception, you will usually need to show valid identification or a passport, together with your Pilgrim's Credential (Credencial). The hospitalero or hospitalera will check your eligibility, register your details, collect the accommodation fee or donation, and may stamp your credential. Keep your documents and payment ready to make check-in easier.",
          "Some albergues require guests to change into indoor footwear or leave hiking boots and trekking poles in a designated area. Follow the establishment's instructions for shoe racks and storage. Avoid wearing muddy hiking boots into dormitories or placing backpacks directly on mattresses.",
          "Once inside the dormitory, keep your backpack in the designated storage area or another location approved by the staff. Keep shared spaces tidy and follow the rules for kitchens, bathrooms, and laundry facilities. Keep noise to a minimum at night, and avoid rustling plastic bags or using your phone's flash after other guests have gone to sleep.",
          "Most albergues do not provide personal item storage services for every guest. Keep your passport, wallet, phone, and important documents with you or securely locked away when showering or eating. Check in advance whether lockers and locks are provided.",
        ],
      },
      {
        heading: "過夜必備 4 樣用品：耳塞、睡袋內襯、拖鞋與快乾毛巾",
        headingEn: "Four Dorm Essentials: Earplugs, Sleeping Bag Liner, Sandals & Quick-Dry Towel",
        paragraphs: [
          "耳塞：多人共用寢室難免出現打呼聲、起床整理背包及夜間走動聲。建議攜帶合適的耳塞，降低環境噪音對睡眠的影響。降噪耳機也可以作為選擇，但睡眠時應注意舒適度，並保留聽見警報或緊急通知的能力。",
          "睡袋或睡袋內襯：是否需要自備睡袋，取決於住宿規定、季節及個人怕冷程度。部分庇護所提供一次性床單，但不一定提供毛毯；也有住宿會提供一般床單或毯子。夏季通常可考慮輕量睡袋內襯，較冷的季節則應確認住宿是否提供足夠保暖寢具，再決定是否攜帶睡袋。不要假設每間庇護所都會提供相同的床上用品。",
          "拖鞋：共用浴室及淋浴間建議穿著防滑拖鞋，避免赤腳踩在潮濕地面，也方便洗澡後在住宿空間內活動。拖鞋應選擇輕量、容易清洗且不易滑倒的款式。",
          "快乾毛巾：許多庇護所不一定提供毛巾，建議自備輕量快乾款式。毛巾使用後應盡量晾乾，避免潮濕收進背包後產生異味。",
          "此外，可準備布質收納袋，將每天需要使用的衣物與盥洗用品分類收納，減少清晨整理行李時的塑膠袋聲響，也能縮短早晨打包時間。",
        ],
        paragraphsEn: [
          "[Earplugs] Shared dormitories inevitably involve snoring, early-morning packing, and people moving around at night. Bring comfortable earplugs to reduce noise and improve sleep. Noise-cancelling headphones are another option, but consider comfort and make sure you can still hear alarms or emergency announcements.",
          "[Sleeping Bag or Liner] Whether you need a sleeping bag depends on the accommodation's rules, the season, and your personal temperature preferences. Some albergues provide disposable bed sheets but may not supply blankets, while others offer regular sheets or blankets. A lightweight liner may be sufficient in summer. In colder seasons, check what bedding is provided before deciding whether to carry a sleeping bag. Do not assume every albergue offers the same bedding.",
          "[Sandals] Wear non-slip sandals in shared bathrooms and showers. They help you avoid walking barefoot on wet floors and are convenient for moving around the accommodation after showering. Choose a lightweight pair that is easy to clean and provides good grip.",
          "[Quick-Dry Towel] Many albergues do not necessarily provide towels, so bring a lightweight quick-dry towel. Allow it to dry properly before packing it away to avoid unpleasant odours.",
          "You may also want to bring fabric packing bags to organise daily clothing and toiletries. They reduce the noise of plastic bags during early-morning packing and make it easier to prepare your belongings.",
        ],
      },
      {
        heading: "臭蟲預防與住宿衛生注意事項",
        headingEn: "Bed Bug Prevention and Accommodation Hygiene",
        paragraphs: [
          "臭蟲（Bed Bugs）是部分朝聖者住宿可能遇到的問題，但並不代表所有庇護所都有臭蟲，也不能只憑皮膚是否出現紅腫就判斷遭到叮咬。入住時可先檢查床墊縫隙、床架接縫及床單周圍，留意是否有活體昆蟲、黑色小點或其他異常跡象。",
          "不要將背包、衣物或睡袋直接放在床墊上，也不要隨意放在其他住客的床位。建議使用住宿指定的置物架或行李區，並將乾淨衣物與穿過的衣物分開收納。",
          "如果發現疑似臭蟲或相關跡象，應立即通知管理員（Hospitalero），請對方檢查床位並協助安排處理，不要自行移動到另一張床而忽略通報，以免造成問題擴散。",
          "若懷疑行李或衣物受到污染，應將相關物品與乾淨衣物隔離，並依管理員或專業人員建議處理。高溫烘乾是常見的有效處理方式之一，但須確認物品材質能否承受高溫。不要未經確認就對寢具、衣物或背包噴灑殺蟲劑。",
          "保持行李整潔、避免將背包放在床上，以及在入住時檢查床位，是降低臭蟲接觸與帶回風險的實用做法。",
        ],
        paragraphsEn: [
          "Bed bugs are a potential issue in some pilgrim accommodations, but this does not mean that every albergue has them. Skin irritation or red marks alone are not enough to confirm a bed bug bite. When checking in, inspect mattress seams, bed-frame joints, and the surrounding bedding for live insects, small dark spots, or other unusual signs.",
          "Do not place backpacks, clothing, or sleeping bags directly on mattresses or on another guest's bed. Use the designated luggage rack or storage area, and keep clean clothing separate from worn items.",
          "If you find suspected bed bugs or signs of an infestation, notify the hospitalero immediately and ask them to inspect the bed and arrange appropriate action. Do not simply move to another bed without reporting the issue, as this may spread the problem.",
          "If you suspect that your luggage or clothing has been exposed, isolate the affected items from clean belongings and follow the advice of the accommodation staff or a professional. High-temperature tumble drying is a commonly effective treatment, but check whether the material can tolerate the heat. Do not spray insecticides on bedding, clothing, or backpacks without confirming that the product is appropriate.",
          "Keeping luggage organised, avoiding placing backpacks on beds, and inspecting your sleeping area on arrival are practical ways to reduce the risk of exposure and carrying bed bugs onward.",
        ],
      },
    ],
    pitfallTitle: "住宿規劃最容易踩的 5 個地雷",
    pitfallTitleEn: "Five Accommodation Pitfalls to Avoid",
    pitfallPoints: [
      "不要把全行程住宿都先訂死：實際步行時可能因天氣、體力、水泡或同行夥伴而調整每日里程。可優先預訂出發前的第一晚、旺季熱門城鎮及抵達聖地牙哥的住宿，其餘路段則依季節與床位供應狀況保留彈性。",
      "不要假設所有公立庇護所都能預訂或都不能預訂：加利西亞 Xunta 公立庇護所不接受預訂，但其他地區可能有例外。出發前應查詢各住宿的官方規定。",
      "不要把 Donativo 當成免費住宿：捐獻制沒有固定價格，但應依自身能力及實際接受的服務支付合理金額，並尊重提供住宿者的營運成本。",
      "不要假設每間庇護所都提供毛毯、床單或毛巾：部分住宿只提供一次性床單，其他寢具與盥洗用品可能需要自備。建議出發前確認住宿設備，並依季節準備睡袋或睡袋內襯。",
      "不要忽略臭蟲預防：入住時檢查床墊及床架，不要把背包放在床上。若發現疑似臭蟲，應立即通知管理員並依照指示處理，避免將問題帶往下一間住宿。",
    ],
    pitfallPointsEn: [
      "Avoid booking every night of your entire Camino in advance. Weather, fitness, blisters, or changes in walking companions may affect your daily distance. Consider booking your first night, accommodation in popular towns during peak season, and your final night in Santiago. Keep the remaining stages flexible according to the season and bed availability.",
      "Do not assume that all public albergues either accept or reject reservations. Xunta public albergues in Galicia do not accept reservations, but exceptions may exist in other regions. Check the rules of each establishment before departure.",
      "Do not treat Donativo as free accommodation. Although there is no fixed price, contribute an appropriate amount according to your financial circumstances and the services received, while respecting the operating costs of the accommodation.",
      "Do not assume that every albergue provides blankets, sheets, or towels. Some only provide disposable bed sheets, while other bedding and toiletries may need to be brought along. Check the facilities in advance and prepare a sleeping bag or liner according to the season.",
      "Do not overlook bed bug prevention. Inspect the mattress and bed frame on arrival and never place your backpack directly on the bed. If you find suspected bed bugs, notify the hospitalero immediately and follow their instructions to avoid carrying the problem to your next accommodation.",
    ],
    relatedTool: {
      path: "/packing",
      label: "檢查裝備清單裡的睡眠與衛生用品",
      labelEn: "Check Sleep and Hygiene Gear in Your Packing List",
      description:
        "確認睡袋或睡袋內襯、耳塞、拖鞋與快乾毛巾是否符合行程季節及住宿需求，並留意整體背包重量與實際負重能力。",
      descriptionEn:
        "Check whether your sleeping bag or liner, earplugs, sandals, and quick-dry towel suit the season and accommodation requirements. Consider your total pack weight and carrying capacity.",
    },
  },

  {
    slug: "footwear-and-luggage",
    category: "gear-budget",
    title: "朝聖之路裝備怎麼準備？鞋襪挑選、水泡預防與行李運送",
    titleEn: "Preparing for the Camino: Footwear, Blister Prevention & Luggage Transport",
    subtitle:
      "越野跑鞋還是登山鞋？鞋子到底要不要買大一號？從試鞋、襪子搭配到水泡預防，再教你如何使用 Correos、Pilbeo 與 Jacotrans 將大背包寄到下一站。",
    subtitleEn:
      "Trail runners or hiking boots? Should you size up? Learn how to choose footwear, prevent blisters, and transfer your main backpack with services such as Correos, Pilbeo, and Jacotrans.",
    seoDescription:
      "朝聖之路鞋襪與行李寄送攻略：比較越野跑鞋、健行鞋與登山靴的優缺點，整理鞋碼選擇、襪子搭配、水泡預防及 Correos Paq Mochila、Pilbeo、Jacotrans 行李寄送服務的預約方式、重量限制與費用。",
    seoDescriptionEn:
      "A practical Camino footwear and luggage guide. Compare trail runners, hiking shoes, and boots; learn about shoe sizing, socks, blister prevention, and backpack transfer services including Correos Paq Mochila, Pilbeo, and Jacotrans.",
    keywords: "朝聖之路鞋子, 越野跑鞋, 登山鞋, 朝聖之路水泡預防, 徒步襪, 行李寄送, Correos寄包, Pilbeo, Jacotrans",
    keywordsEn:
      "Camino shoes, trail runners vs hiking boots, Camino blister prevention, hiking socks, Camino luggage transfer, Correos Paq Mochila, Pilbeo, Jacotrans",
    readingMinutes: 8,
    updatedAt: "2026-11-16",
    sections: [
      {
        heading: "越野跑鞋 vs. 健行鞋 vs. 登山靴：依路線與個人需求選擇",
        headingEn: "Trail Runners vs. Hiking Shoes vs. Boots: Choose for Your Route and Needs",
        paragraphs: [
          "第一次走朝聖之路時，很多人會直覺認為需要穿著厚重的高筒登山靴，但實際上，法國之路與葡萄牙之路的路面包含柏油路、石板路、碎石路、土徑及森林小徑等多種地形，並不是全程都需要高筒登山靴。鞋款應依照路線地形、季節、背包重量、腳型及個人徒步習慣選擇，而不是只看鞋子的外觀或防水功能。",
          "越野跑鞋（Trail Runners）：通常重量較輕、鞋底柔軟且緩震性佳，透氣網布款式也較容易排出濕氣，適合多數路面相對成熟、每日需要長時間行走的路段。缺點是部分款式鞋底耐磨性較低，遇到鬆動碎石、泥濘或長時間負重時，保護性與支撐感可能不如部分健行鞋。",
          "健行鞋（Hiking Shoes）：通常比越野跑鞋有更完整的鞋面保護與較耐磨的鞋底，適合希望兼顧舒適度、穩定性與耐用性的旅人。鞋款差異很大，部分健行鞋也相當輕量，並不一定比越野跑鞋笨重。",
          "中高筒登山靴（Hiking Boots）：通常能提供較完整的腳踝包覆、鞋面保護及較穩定的鞋底結構，適合需要較多支撐、背負較重行李，或行走於泥濘、鬆動石塊及較崎嶇地形的人。缺點是部分款式重量較高、透氣性較低，若鞋內長時間潮濕，也可能增加足部不適。",
          "防水膜（例如 GORE-TEX）：不是越野鞋或登山靴的必要條件。雨季、泥濘路段及低溫環境可能適合防水鞋，但在炎熱天氣或容易流腳汗的情況下，防水膜鞋款的透氣與乾燥速度可能不如非防水款。應依季節、降雨情況與個人腳部出汗程度決定。",
          "沒有一種鞋款適合所有朝聖者。若主要走法國之路或葡萄牙之路，輕量越野跑鞋或健行鞋通常已能應付大部分路段；若走北方之路、原始之路等地形起伏較多的路線，則應更加重視鞋底抓地力、緩震與穩定性。",
        ],
        paragraphsEn: [
          "First-time pilgrims often assume that they need heavy, high-cut hiking boots. However, the French and Portuguese Ways include a mixture of asphalt, cobblestones, gravel, dirt tracks, and woodland paths. Not every section requires high-cut boots. Choose footwear according to the route, season, pack weight, foot shape, and your walking habits rather than appearance or waterproofing alone.",
          "[Trail Runners] These shoes are generally lightweight, flexible, and well cushioned. Breathable mesh models also allow moisture to escape more easily, making them suitable for many Camino stages involving long hours of walking on established paths. However, some models have less durable outsoles, and may offer less protection or support on loose gravel, muddy terrain, or under heavier loads.",
          "[Hiking Shoes] Hiking shoes usually provide more upper protection and durable outsoles than many trail runners. They are a good option for pilgrims seeking a balance between comfort, stability, and durability. Designs vary considerably, and some hiking shoes are also very lightweight.",
          "[Mid- or High-Cut Hiking Boots] Boots generally provide more ankle coverage, upper protection, and a more structured sole. They may suit pilgrims who need additional support, carry heavier packs, or expect muddy, rocky, or uneven terrain. However, some models are heavier and less breathable. Prolonged moisture inside the boots can also cause discomfort.",
          "[Waterproof Membranes such as GORE-TEX] A waterproof membrane is not essential for every pilgrim. Waterproof shoes may be useful in rainy seasons, muddy conditions, or cold environments. In hot weather or for people whose feet sweat heavily, non-waterproof footwear may offer better ventilation and dry more quickly. Choose according to the season, rainfall, and your own foot conditions.",
          "There is no universally best shoe for every pilgrim. Lightweight trail runners or hiking shoes are often sufficient for much of the French and Portuguese Ways. For routes such as the Northern Way or the Primitivo, where elevation changes and uneven terrain may be more demanding, pay particular attention to grip, cushioning, and stability.",
        ],
      },
      {
        heading: "黃金選鞋原則：確認腳趾空間，行前充分測試",
        headingEn: "The Golden Rule: Check Toe Room and Test Your Shoes Before Departure",
        paragraphs: [
          "長時間徒步後，雙腳可能因活動、溫度及個人體質而出現腫脹，因此試鞋時不應只以平常穿著的鞋碼作為唯一依據。建議在下午或走路一段時間後試穿，並穿上預計帶去朝聖之路的徒步襪，模擬實際行走狀況。",
          "試穿時應確認腳趾前方有足夠活動空間，尤其是下坡時，腳趾不應反覆撞擊鞋頭；同時也要確認腳跟不會明顯滑動，鞋面不會壓迫腳背或腳趾側邊。常見的參考方式是讓最長腳趾前方保留約一個拇指寬的空間，但實際仍須依腳型、鞋楦及穿著感受調整，並非所有人都必須固定買大半號或一號。",
          "建議至少提前 1～2 個月選定鞋款，逐步增加穿著時間與行走距離，並安排包含上下坡、不同路面及實際背包重量的訓練。行前可累積多次長距離測試，例如 10～20 公里的練習行程，確認鞋子不會持續磨腳、壓迫腳趾或造成腳跟摩擦。",
          "如果新鞋在短距離測試時就出現明顯疼痛、麻木、腳趾受壓或固定位置反覆磨紅，不要期待走到西班牙後自然會變合腳。應重新調整鞋帶、鞋墊或襪子，必要時更換鞋款。",
        ],
        paragraphsEn: [
          "Feet may swell after prolonged walking due to activity, temperature, and individual differences. Do not rely solely on your usual shoe size when choosing Camino footwear. Try shoes in the afternoon or after some walking, wearing the same hiking socks you plan to use on the Camino.",
          "Check that your toes have enough room to move, especially on descents, when they should not repeatedly hit the front of the shoe. Your heel should also remain reasonably secure, and the upper should not create pressure across the instep or sides of your toes. A common reference is approximately one thumb's width of space in front of your longest toe, but the correct fit depends on your foot shape, the shoe last, and comfort. Not everyone needs to size up by half or a full size.",
          "Choose your shoes at least one to two months before departure. Gradually increase wearing time and walking distance, and include uphill and downhill sections, different surfaces, and training with your actual backpack weight. Several longer practice walks, such as 10–20 km sessions, can help identify rubbing, toe pressure, or heel friction before departure.",
          "If new shoes already cause noticeable pain, numbness, toe pressure, or repeated rubbing during short practice walks, do not assume they will become comfortable once you reach Spain. Adjust the lacing, insoles, or socks, and replace the shoes if necessary.",
        ],
      },
      {
        heading: "水泡預防 3 招：減少摩擦、控制濕氣、及早處理熱點",
        headingEn: "Three Ways to Prevent Blisters: Reduce Friction, Manage Moisture, and Treat Hot Spots Early",
        paragraphs: [
          "徒步水泡通常與反覆摩擦、足部濕氣、鞋襪不合腳及長時間負重有關。當皮膚在鞋襪內反覆受到剪切力與摩擦，表皮組織可能受損並形成水泡。因此，預防重點不是只靠某一種襪子，而是讓鞋子合腳、襪子保持適當乾燥，並減少局部反覆摩擦。",
          "選擇合適的徒步襪：建議使用無明顯縫線、吸濕排汗且不易在鞋內滑動的技術型徒步襪。美麗諾羊毛混紡襪或合成纖維徒步襪都可以考慮，應以實際穿著後不皺摺、不過度壓迫且能保持舒適為準。避免只穿未經測試的全新襪子直接開始長距離行走。",
          "測試雙層襪搭配：部分朝聖者會使用薄內層襪搭配外層徒步襪，或使用五指襪減少腳趾之間的摩擦。這種方式並非人人適用，若兩層襪子讓鞋內過於緊繃，反而可能增加壓迫與摩擦。務必在行前測試，確認鞋內仍有足夠空間。",
          "及早處理 Hot Spot：當腳部開始出現局部發熱、刺痛或泛紅時，不要等到形成水泡才處理。應先停下來檢查，確認是否有砂石、襪子皺摺或鞋帶過緊等問題，再依情況使用透氣運動膠帶、專用防磨貼或其他適合的保護敷料。已形成水泡時，可使用適合水泡的敷料保護患處，避免持續摩擦。",
          "每天中途休息時，可以脫下鞋襪檢查雙腳、讓足部短暫通風，並視需要更換乾燥襪子。若襪子或鞋內已經濕透，應盡量更換並讓鞋襪乾燥，不要長時間穿著潮濕襪子繼續行走。",
          "每天晚上清潔並徹底擦乾雙腳，檢查腳趾、腳跟及前腳掌是否有紅腫、破皮或水泡。若出現傷口感染跡象、明顯腫脹或持續疼痛，應尋求醫療協助，不要只靠貼布繼續硬走。",
        ],
        paragraphsEn: [
          "Hiking blisters are commonly associated with repeated friction, moisture, poorly fitting footwear, and prolonged walking under load. Repetitive shear forces and rubbing inside shoes can damage the skin and lead to blisters. Prevention is not simply about choosing one particular type of sock. A good fit, moisture management, and reducing repeated friction at vulnerable spots are all important.",
          "[Choose Suitable Hiking Socks] Look for technical hiking socks with minimal seams, moisture management, and a fit that does not slide or bunch up inside your shoes. Merino wool blends and synthetic hiking socks are both options. Choose the pair that remains comfortable without excessive pressure or wrinkles. Avoid wearing an untested new pair for the first time on a long walking day.",
          "[Test a Double-Layer Combination] Some pilgrims wear thin liner socks beneath hiking socks, while others use toe socks to reduce friction between the toes. This method does not work for everyone. If two layers make your shoes too tight, they may increase pressure and friction instead. Test the combination before departure and make sure there is still enough room inside your shoes.",
          "[Treat Hot Spots Early] If you feel localised warmth, stinging, or redness, stop and check your feet before a blister forms. Look for grit, sock wrinkles, or overly tight lacing. Depending on the situation, use breathable sports tape, specialised anti-friction tape, or another suitable protective dressing. If a blister has already formed, use an appropriate blister dressing to protect the affected area from further friction.",
          "During longer breaks, remove your shoes and socks to inspect your feet and allow them to air briefly. Change into dry socks when needed. If your socks or shoes become soaked, dry them as much as possible and avoid continuing for long periods in wet socks.",
          "Clean and dry your feet thoroughly every evening. Check your toes, heels, and forefoot for redness, broken skin, or blisters. If you notice signs of infection, significant swelling, or persistent pain, seek medical advice rather than relying only on dressings to keep walking.",
        ],
      },
      {
        heading: "善用行李寄送服務：Correos、Pilbeo 與 Jacotrans 比較",
        headingEn: "Use Luggage Transfer Services: Correos, Pilbeo, and Jacotrans",
        paragraphs: [
          "朝聖之路不一定要全程背負大背包。如果膝蓋、腳踝或肩膀不適，或希望減少每日負重，可以考慮使用行李寄送服務（Luggage Transfer）。常見服務商包括西班牙郵政 Correos 的 Paq Mochila、Pilbeo 與 Jacotrans。各家服務的涵蓋路線、價格、行李重量限制及收件時間不同，預約前應依實際路線與住宿地點確認。",
          "Correos Paq Mochila：由西班牙郵政提供，需先在線上選擇路線、日期與寄送起訖住宿，並依照通知將行李標籤貼在背包上。早上將行李留在指定住宿，郵務人員會前往收件，通常在當天下午 14:30 前送達下一站指定的旅館或庇護所。官方目前列出的重量上限為每件 15 公斤；Sarria 至 Santiago 及 Tui 至 Santiago 路段全年提供服務，其他主要路線則依季節開放，部分路線約從復活節至 10 月 31 日。",
          "Pilbeo：可透過官方網站或 App 預訂，選擇路線、日期、寄送站點及行李件數，付款後取得行李識別資料。官方公布每件行李重量上限為 20 公斤，收件時間依路線約為早上 08:00～09:00，通常在 14:30 前送達目的地。以目前網站列出的套裝價格為例，Sarria 至 Santiago 五段約 30 歐元，Tui 至 Santiago 六段約 42 歐元；單段價格與整段套裝價格可能不同，應以預訂頁面結帳金額為準。",
          "Jacotrans：也是朝聖之路常見的行李接送服務商之一，提供部分路線及城鎮之間的背包運送。實際服務路段、營運日期、每件行李重量限制、收件時間與價格，應依官方預訂資訊或聯絡服務商確認，不宜直接套用其他公司的價格或時間規則。",
          "一般操作流程是先確認下一站住宿是否接受代收行李，再依服務商規定預約及付款，將識別標籤固定在行李上，並於指定時間前放在住宿指定位置。服務商會依照路線安排收件與配送，抵達下一站後再依住宿或服務商指示領取。",
          "使用寄包服務時，隨身小背包仍應攜帶飲水、食物、雨具、手機、錢包、護照、藥品及簡易急救用品。重要文件、貴重物品、當日可能需要使用的物品，以及不適合託運的物品，不應放入寄送的大背包。",
        ],
        paragraphsEn: [
          "You do not have to carry your main backpack throughout the entire Camino. If you experience discomfort in your knees, ankles, or shoulders, or simply want to reduce your daily load, consider using a luggage transfer service. Common providers include Correos Paq Mochila, Pilbeo, and Jacotrans. Their route coverage, prices, weight limits, and collection schedules vary, so check the details for your route and accommodation before booking.",
          "[Correos Paq Mochila] This service is operated by the Spanish postal service. Book online by selecting your route, dates, and pickup and delivery accommodations, then attach the luggage label supplied by Correos. Leave your bag at the designated accommodation in the morning. A postal worker will collect it and usually deliver it to your selected hotel or albergue by 2:30 PM. The published maximum weight is 15 kg per bag. The service operates year-round between Sarria and Santiago and between Tui and Santiago. Other major routes are seasonal, with service generally available from Easter until 31 October.",
          "[Pilbeo] Book through the official website or app by selecting your route, dates, pickup and delivery locations, and number of bags. After payment, you will receive luggage identification details. The published maximum weight is 20 kg per bag. Depending on the route, collection is usually between 8:00 and 9:00 AM, with delivery generally before 2:30 PM. Current examples on the website include a five-stage Sarria–Santiago package for approximately €30 and a six-stage Tui–Santiago package for approximately €42. Single-stage prices and package prices may differ, so check the final amount during booking.",
          "[Jacotrans] Jacotrans is another luggage transfer provider operating on selected Camino routes and between participating towns. Check its official booking information or contact the provider to confirm route coverage, operating dates, luggage weight limits, pickup times, and prices. Do not assume that its prices or schedules are the same as those of other companies.",
          "The general process is to confirm that your next accommodation accepts luggage deliveries, book and pay according to the provider's instructions, attach the identification label securely, and leave your bag at the designated location before the stated collection time. The provider then arranges pickup and delivery along the route. Collect your luggage at the next stop according to the accommodation's or provider's instructions.",
          "Even when using luggage transfer, carry water, food, rain gear, your phone, wallet, passport, medication, and a small first-aid kit in your daypack. Keep important documents, valuables, items needed during the day, and anything unsuitable for transport out of your transferred luggage.",
        ],
      },
    ],
    pitfallTitle: "裝備與寄包的常見誤區",
    pitfallTitleEn: "Common Gear and Luggage Transfer Mistakes",
    pitfallPoints: [
      "不要只因為朝聖之路很長就買最厚重的高筒登山靴：鞋款應依照路線地形、季節、負重、腳型及個人習慣選擇。輕量越野跑鞋、健行鞋或登山靴都可能適合，最重要的是合腳且經過行前測試。",
      "不要把「買大半號至一號」當成固定規則：試鞋時應穿實際徒步襪，確認腳趾活動空間、腳跟固定及下坡時不頂腳。鞋碼應依品牌鞋楦及個人腳型決定。",
      "不要穿全新鞋子直接出發：行前應安排多次不同距離的練習，並穿著實際背包與襪子測試。若出現反覆磨腳、疼痛或麻木，應及早調整或更換鞋款。",
      "不要認為雙層襪一定能預防水泡：襪子搭配必須與鞋內空間相容，過厚或過緊反而可能增加摩擦。應在行前測試適合自己的襪子組合。",
      "不要把每天 5～7 歐元當成所有寄包服務的固定價格：Correos 依行程查價，Pilbeo 有單段與套裝方案，Jacotrans 也可能依路線及日期不同而調整費用。預約前應確認實際價格及重量限制。",
      "不要假設每間庇護所都能代收寄送行李：部分住宿可能不接受外部行李配送，或有指定收件位置及時間。預約前務必確認下一站住宿是否能收件，並確認服務商涵蓋該住宿及路段。",
      "不要將護照、錢包、手機、藥品及當天必需品放入寄送的大背包：行李可能在下午才送達，白天徒步時需要使用的物品應隨身攜帶。",
    ],
    pitfallPointsEn: [
      "Do not automatically buy the heaviest high-cut boots just because the Camino is a long-distance walk. Choose footwear according to terrain, season, pack weight, foot shape, and personal preference. Trail runners, hiking shoes, and boots can all be suitable if they fit well and have been tested before departure.",
      "Do not treat sizing up by half or a full size as a universal rule. Try shoes with your actual hiking socks and check toe room, heel security, and comfort on descents. Choose the size according to the shoe last and your own foot shape.",
      "Never start the Camino in completely new shoes. Complete several practice walks of different distances, using your actual backpack and socks. Adjust or replace footwear early if you experience repeated rubbing, pain, or numbness.",
      "Do not assume that double-layer socks always prevent blisters. The combination must fit comfortably inside your shoes. Socks that are too thick or tight may increase friction. Test the combination before departure.",
      "Do not assume that every luggage transfer service costs €5–7 per day. Correos calculates prices according to the itinerary, Pilbeo offers both single-stage and package options, and Jacotrans may vary its fees by route and date. Confirm the actual price and weight limit before booking.",
      "Do not assume that every albergue accepts transferred luggage. Some accommodations may refuse external deliveries or have specific drop-off locations and collection times. Confirm that your next accommodation and the service provider both support the delivery before booking.",
      "Do not put your passport, wallet, phone, medication, or daily essentials in your transferred backpack. Your main luggage may not arrive until the afternoon, so carry everything you need during the day's walk in your daypack.",
    ],
    relatedTool: {
      path: "/packing",
      label: "試算背包負重",
      labelEn: "Calculate Your Backpack Weight",
      description: "逐項檢查裝備重量，區分每日隨身攜帶與可寄送的物品，並依個人體能、行程地形及背負舒適度控制整體負重。",
      descriptionEn:
        "Review each item, separate daily essentials from luggage that can be transferred, and manage your total pack weight according to your fitness, route terrain, and carrying comfort.",
    },
  },

  {
    slug: "budget-breakdown",
    category: "gear-budget",
    title: "朝聖之路花費總整理：每日餐費、住宿與預算分配",
    titleEn: "Camino de Santiago Budget Breakdown: Daily Costs & Real Expenses",
    subtitle:
      "走一趟法國之路或葡萄牙之路到底要花多少錢？以歐元估算每日住宿、餐飲、交通與其他支出，規劃適合自己的朝聖預算。",
    subtitleEn:
      "How much does a Camino pilgrimage really cost? Explore estimated accommodation, food, transport, and other daily expenses to plan a realistic budget.",
    seoDescription:
      "朝聖之路花費與預算解析：比較公立、私立庇護所住宿價格，了解朝聖者套餐 Menú del Peregrino、超市餐飲與其他日常支出，並提供節省型、一般型及舒適型預算參考。",
    seoDescriptionEn:
      "Plan your Camino de Santiago budget with estimated albergue prices, pilgrim menu costs, supermarket meals, transport, and practical daily spending ranges for different travel styles.",
    keywords: "朝聖之路花費, 朝聖之路預算, 朝聖者套餐價格, 西班牙物價, Camino budget guide",
    keywordsEn: "Camino de Santiago cost, Camino daily budget, pilgrim menu price, Spain trail cost",
    readingMinutes: 5,
    updatedAt: "2026-11-16",
    sections: [
      {
        heading: "每日現地開銷結構：€35–45（節省）vs. €50–60（一般）vs. €75–100（舒適）",
        headingEn: "Daily On-Trail Budget: €35–45 (Budget) vs. €50–60 (Mid-Range) vs. €75–100 (Comfortable)",
        paragraphs: [
          "扣除台灣往返歐洲的國際機票與行前裝備採購，朝聖期間的每日花費主要取決於住宿選擇、用餐方式及是否安排額外服務。以下以每人每日估算，提供三種預算層級作為規劃參考：",
          "① 節省型：約 35 至 45 歐元。以公立或平價庇護所為主，早餐與部分餐食自行採買，偶爾在餐廳享用朝聖者套餐。若能找到較便宜的住宿並減少額外消費，部分日子有機會低於此區間，但不宜將低預算視為每天都能穩定達成。",
          "② 一般型：約 50 至 60 歐元。混合入住公立與私立庇護所，早餐在咖啡館或酒吧解決，每天安排一餐餐廳料理，其餘餐食視情況採買或自理，並預留洗衣、飲料及零星支出。",
          "③ 舒適型：約 75 至 100 歐元以上。較常選擇私立庇護所、旅館或私人房間，餐飲以餐廳為主，也能安排行李接送、休息日住宿及其他額外服務。若經常入住單人房或較高級的住宿，實際花費可能超過此區間。",
          "以上金額是規劃用的估算範圍，並非官方統一收費或所有路線的平均消費。法國之路與葡萄牙之路不同路段的住宿供應、旅遊旺季及城鎮物價都有差異，尤其熱門路段與聖地牙哥周邊，住宿及餐飲費用可能較高。",
        ],
        paragraphsEn: [
          "Excluding international flights and pre-trip gear, daily Camino expenses depend mainly on accommodation, meals, and optional services. The following estimates are per person and can be used as a starting point for planning:",
          "① Budget: approximately €35–45 per day. Stay mainly in public or inexpensive albergues, buy breakfast and some meals at supermarkets, and occasionally enjoy a pilgrim menu. Spending less is possible on some days, but consistently maintaining a very low budget may be difficult.",
          "② Mid-range: approximately €50–60 per day. Mix public and private albergues, have breakfast at local cafes or bars, and enjoy one restaurant meal a day while buying or preparing other meals. Allow extra room for laundry, drinks, and small purchases.",
          "③ Comfortable: approximately €75–100 or more per day. Choose private albergues, guesthouses, or private rooms more often, eat most meals at restaurants, and allow for luggage transfers, rest-day accommodation, and other extras. Frequent stays in private rooms may push the budget higher.",
          "These figures are planning estimates, not official rates or universal averages. Accommodation availability, seasonal demand, and local prices vary between the Camino Francés and Camino Portugués. Popular sections and towns near Santiago may be more expensive.",
        ],
      },
      {
        heading: "吃什麼最划算？認識「朝聖者套餐（Menú del Peregrino）」",
        headingEn: "Eating Well on a Budget: The Pilgrim Menu",
        paragraphs: [
          "沿途部分餐廳會提供朝聖者套餐（Menú del Peregrino），常見參考價格約為 12 至 18 歐元，但實際價格會依路線、城鎮、季節及餐廳而異，並非每家餐廳都有供應。套餐通常包含前菜（例如沙拉、湯品或義大利麵）、主菜、甜點及麵包；飲料可能包含水或葡萄酒，也可能需要另外付費，點餐前最好先確認套餐內容。",
          "早餐可以選擇咖啡搭配吐司（Tostada）、可頌或西班牙馬鈴薯烘蛋（Tortilla）。在酒吧或咖啡館用餐通常比完整餐廳套餐便宜，但價格會隨地點而變動。若想控制預算，也可以在超市購買麵包、水果、優格及其他簡單食材。",
          "午餐不一定要安排完整的餐廳套餐。部分朝聖者會選擇 Bocadillo（長棍麵包三明治）、Tortilla 或超市食品，搭配水果與飲水補充體力。若當天路段較長，建議事先準備足夠的食物與飲水，不要只依賴沿途餐廳是否營業。",
          "需要注意的是，西班牙的 Menú del Día（每日套餐）與 Menú del Peregrino（朝聖者套餐）並非完全相同，供應時間及內容也可能不同。部分餐廳只在午餐時段供應每日套餐，朝聖者套餐則依店家安排，建議抵達後先查看菜單。",
        ],
        paragraphsEn: [
          "Some restaurants along the Camino offer a Menú del Peregrino, or Pilgrim Menu. A typical planning estimate is around €12–18, although prices vary by route, town, season, and restaurant. Not every restaurant offers one. A menu often includes a starter, main course, dessert, and bread. Water or wine may be included, but drinks are not always part of the price, so check before ordering.",
          "For breakfast, common choices include coffee with tostada (toast), a croissant, or Spanish tortilla. A cafe or bar breakfast is usually less expensive than a full restaurant meal, but prices vary by location. Supermarkets are another option for bread, fruit, yogurt, and simple food.",
          "Lunch does not have to be a full restaurant meal. Many pilgrims choose a bocadillo (baguette sandwich), tortilla, or supermarket food with fruit and water. On longer stages, carry enough food and water rather than relying entirely on restaurants along the route.",
          "The Menú del Día (daily set menu) and Menú del Peregrino (Pilgrim Menu) are not necessarily the same. Their serving hours and contents vary by restaurant. Some restaurants offer the daily menu mainly at lunchtime, while the availability of a Pilgrim Menu depends on the establishment.",
        ],
      },
      {
        heading: "別忘了「行前固定支出」與「突發應急金」",
        headingEn: "Don’t Forget Fixed Pre-Trip Costs & Emergency Buffers",
        paragraphs: [
          "除了每日住宿與餐飲，規劃總預算時還應將以下項目分開計算：",
          "① 國際機票：台灣或其他出發地往返歐洲的機票，依航空公司、轉機次數、購票時間及旅遊季節而有很大差異，建議依實際查詢價格編列。",
          "② 旅遊保險：建議確認保險是否涵蓋海外醫療、緊急救援、意外事故及行程變更等項目，並留意保險條款與保障額度。",
          "③ 歐洲境內交通：往返朝聖路線起點與終點的火車、巴士或國內航班費用，會依出發城市、路線及購票時間而變動。例如巴黎前往法國之路起點，與波多前往葡萄牙之路起點的交通安排就不同，不建議直接套用固定的 100 至 250 歐元預算。",
          "④ 行前裝備：包含背包、鞋襪、雨具、登山杖、快乾衣物及其他個人用品。若已有合適裝備，這部分支出可以大幅降低；若從零開始採購，則應另外編列預算。",
          "⑤ 網路與通訊：依旅程長度及使用需求選擇 eSIM、實體 SIM 卡或電信漫遊方案，並確認是否涵蓋西班牙、葡萄牙及轉機國家。",
          "⑥ 其他與突發支出：例如洗衣、行李接送、休息日住宿、藥局用品、臨時交通及行程變更。可以在每日預算之外，另外預留約總旅費 10% 至 15% 作為個人應急金；這是規劃上的建議比例，並非官方標準。",
          "另外，建議將抵達聖地牙哥後的住宿與返程交通獨立列入預算。完成徒步後可能需要多住一晚休息，也可能因班機時間而需要額外住宿或交通費用。",
        ],
        paragraphsEn: [
          "In addition to daily accommodation and meals, include the following items when calculating your total trip budget:",
          "① International flights: Airfares from Taiwan or another departure point to Europe vary significantly depending on the airline, connections, booking date, and travel season. Use actual flight searches when estimating this cost.",
          "② Travel insurance: Check whether your policy covers overseas medical expenses, emergency assistance, accidents, and trip changes. Review the exclusions and coverage limits carefully.",
          "③ Transport within Europe: Trains, buses, or domestic flights to and from your Camino starting and finishing points depend on your departure city, route, and booking time. For example, travelling from Paris to the start of the Camino Francés is very different from travelling from Porto to the start of the Camino Portugués. Avoid relying on a single fixed estimate such as €100–250.",
          "④ Pre-trip gear: Include a backpack, footwear, socks, rain gear, trekking poles, quick-drying clothing, and other personal items. If you already own suitable equipment, this cost may be much lower; starting from scratch requires a separate gear budget.",
          "⑤ Connectivity: Choose an eSIM, physical SIM card, or roaming plan according to your trip length and data needs. Check coverage in Spain, Portugal, and any transit countries.",
          "⑥ Extras and unexpected expenses: Allow for laundry, luggage transfers, rest-day accommodation, pharmacy supplies, unexpected transport, and itinerary changes. As a planning suggestion, you can set aside an additional 10%–15% of your total trip budget as an emergency reserve. This is a personal budgeting guideline, not an official requirement.",
          "Also budget separately for accommodation and transport after reaching Santiago. You may want an extra night to rest after walking, or additional accommodation and transport depending on your return flight schedule.",
        ],
      },
    ],
    pitfallTitle: "管好旅費的 3 個實用小習慣",
    pitfallTitleEn: "3 Practical Money Habits on the Camino",
    pitfallPoints: [
      "現金與信用卡並用：沿途不少餐廳、超市及住宿場所可以刷卡，但小型酒吧、部分庇護所、捐獻制住宿及鄉村商店可能只收現金。建議隨身準備適量小額現金，入住或消費前先確認付款方式。",
      "週日及假日留意商店營業時間：西班牙各自治區及城鎮的商店營業規定不同，大型超市、觀光區商店與小型雜貨店的營業情況也不一樣；部分店家會在星期日或國定假日休息。若隔天需要早餐或行動糧，建議前一天先確認附近商店是否營業，並提早採買。",
      "提款與現金保管：不要假設每個小鎮都有 ATM，部分偏遠路段的提款機或銀行服務可能有限。建議事先確認沿途較大的城鎮是否有提款機，依實際需求分次提款，並將現金分開保管；使用 ATM 時也要留意是否有額外手續費，以及提款畫面是否提供不利的動態貨幣轉換匯率。",
    ],
    pitfallPointsEn: [
      "Carry both cash and cards: Many restaurants, supermarkets, and accommodation providers accept cards, but small bars, some albergues, donativo establishments, and rural shops may accept cash only. Carry a reasonable amount of small-denomination cash and check payment options before ordering or checking in.",
      "Check Sunday and holiday opening hours: Shop opening rules vary between Spanish autonomous communities and towns. Large supermarkets, tourist-area shops, and small grocery stores may follow different schedules, and some close on Sundays or public holidays. Check whether shops near your accommodation will be open and buy food in advance if needed.",
      "Plan cash withdrawals and keep money secure: Do not assume every small town has an ATM. Cash machines and banking services may be limited in remote sections. Check where larger towns have ATMs, withdraw according to your needs, and keep cash in separate places. Watch for ATM fees and unfavorable dynamic currency conversion offers.",
    ],
    relatedTool: {
      path: "/budget",
      label: "開啟預算試算",
      labelEn: "Budget Tool",
      description: "輸入徒步天數、住宿偏好與匯率，試算每日花費及 EUR、TWD 雙幣總預算。",
      descriptionEn:
        "Enter your walking days, accommodation preferences, and exchange rate to estimate your daily expenses and total budget in EUR and TWD.",
    },
  },
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}
