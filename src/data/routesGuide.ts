/**
 * 朝聖路線攻略與關鍵指標資料庫
 * 嚴格對齊目前排程系統收錄之路線（法國之路、葡萄牙之路、北方之路，以及世界盡頭延伸線）
 */

import type { RouteId } from "@/types/route";

export interface RouteGuideItem {
  id: RouteId;
  name: string;
  nameEn?: string;
  spanishName: string;
  startTown: string;
  startTownEn?: string;
  startTownCountry: string;
  startTownCountryEn?: string;
  totalDistanceKm: number;
  recommendedDays: string;
  recommendedDaysEn?: string;
  dailyDistanceAvgKm: string;
  dailyDistanceAvgKmEn?: string;
  difficulty: "適中" | "容易" | "挑戰" | "極高挑戰";
  difficultyEn?: string;
  difficultyStars: number; // 1 ~ 5
  landscapeType: string;
  landscapeTypeEn?: string;
  pavementRatio: {
    trail: number; // 泥土/碎石山徑 %
    boardwalkOrCobble: number; // 木棧道/石板路 %
    asphalt: number; // 柏油硬路 %
  };
  bestMonths: string;
  bestMonthsEn?: string;
  badge?: string;
  badgeEn?: string;
  targetAudience: string;
  targetAudienceEn?: string;
  summary: string;
  summaryEn?: string;
  keyFeatures: {
    title: string;
    description: string;
    titleEn?: string;
    descriptionEn?: string;
  }[];
  pitfallWarnings: string[];
  pitfallWarningsEn?: string[];
  recommendedStartGuide: {
    hubCity: string;
    hubCityEn?: string;
    transferTips: string;
    transferTipsEn?: string;
  };
}

export const ROUTES_GUIDE_LIST: RouteGuideItem[] = [
  {
    id: "frances",
    name: "法國之路",
    nameEn: "Camino Francés",
    spanishName: "Camino Francés",
    startTown: "聖讓皮耶德波爾 (SJPP)",
    startTownEn: "Saint-Jean-Pied-de-Port (SJPP)",
    startTownCountry: "法國",
    startTownCountryEn: "France",
    totalDistanceKm: 764,
    recommendedDays: "33 ～ 35 天",
    recommendedDaysEn: "33 – 35 days",
    dailyDistanceAvgKm: "約 22 ～ 24 km",
    dailyDistanceAvgKmEn: "~22 – 24 km",
    difficulty: "適中",
    difficultyEn: "Moderate",
    difficultyStars: 3,
    landscapeType: "庇里牛斯山、拉里奧哈葡萄園、梅塞塔麥田高原、加利西亞丘陵與尤加利樹林",
    landscapeTypeEn: "Pyrenean peaks, La Rioja vineyards, Meseta plateau, Galician rolling hills and eucalyptus groves",
    pavementRatio: {
      trail: 62,
      boardwalkOrCobble: 8,
      asphalt: 30,
    },
    bestMonths: "5-6 月、9-10 月",
    bestMonthsEn: "May–Jun, Sep–Oct",
    badge: "經典熱門",
    badgeEn: "Classic Route",
    targetAudience: "第一次踏上朝聖之路、喜愛豐富社交氛圍、時間充裕（約 5 週）的徒步者。",
    targetAudienceEn: "First-time pilgrims, those seeking a vibrant international community, and hikers with ~5 weeks of travel time.",
    summary:
      "法國之路是聖雅各朝聖之路中最知名、歷史底蘊最深厚且沿途朝聖設施相當完善的經典路線。沿途城鎮、庇護所與補給設施相對密集，指標清晰，從翻越庇里牛斯山的壯闊景觀，到梅塞塔高原的遼闊平原，再到加利西亞的綠意山丘，呈現豐富多變的自然景觀與文化體驗。",
    summaryEn:
      "The Camino Francés is the most celebrated, culturally storied, and well-equipped pilgrimage route to Santiago. With dense albergue networks, frequent waypoints, and clear yellow arrows, it transitions from the dramatic Pyrenees to the vast agricultural expanse of the Meseta, ending in the lush hills of Galicia.",
    keyFeatures: [
      {
        title: "三大典型地貌層次遞進",
        description:
          "首段翻越庇里牛斯山，拿破崙路線具有明顯的爬升挑戰；中段穿越梅塞塔高原，以開闊農田、麥田與廣闊平原為主，部分路段長時間缺乏遮蔭；尾段進入加利西亞，沿途可見尤加利樹林、森林小徑與綠意盎然的丘陵。",
        titleEn: "Three Evolving Landscapes",
        descriptionEn:
          "Begins with the steep alpine crossing of the Pyrenees on the Napoleon route; traverses the wide horizons and sparse shade of the Meseta plateau; and finishes among the mossy forests and eucalyptus woods of Galicia.",
      },
      {
        title: "全球朝聖者社群的大熔爐",
        description:
          "法國之路是全球最受歡迎的朝聖路線，長年位居各條聖雅各朝聖路線的首位。沿途朝聖者來自世界各地，庇護所、朝聖者晚餐（Menú del Peregrino）與公共休息空間形成濃厚的國際交流氛圍。",
        titleEn: "Global Melting Pot of Pilgrims",
        descriptionEn:
          "As the world's most popular Camino, pilgrims arrive from dozens of countries. Communal dinners (Menú del Peregrino) and municipal albergues cultivate unmatched cross-cultural connections.",
      },
      {
        title: "彈性極佳的分段節奏",
        description:
          "沿線城鎮、村莊及朝聖者服務設施相對密集，多數路段可找到休息及補給點，適合初次嘗試長途徒步的人自主配速。不過，梅塞塔部分路段的城鎮間距較長，出發前仍應確認飲水及餐飲供應。若假期有限，亦可自最後 114 公里的薩里亞（Sarria）起步，通常約 5 天即可抵達聖地牙哥。",
        titleEn: "Flexible Pacing & Rest Stops",
        descriptionEn:
          "Frequent towns and pilgrim amenities make self-paced walking manageable. For travelers with limited holiday time, starting from Sarria covers the final 114 km in approximately 5 days to earn the Compostela.",
      },
    ],
    pitfallWarnings: [
      "冬季期間，Saint-Jean-Pied-de-Port 至 Roncesvalles 的高海拔拿破崙路線（Route Napoléon）會受到季節性管制，通常於 11 月 1 日至隔年 3 月 31 日禁止通行，實際管制日期應以當年度官方公告為準。冬季出發應改走 Valcarlos 低海拔替代路線，切勿因天候不佳而冒險翻越山區。",
      "梅塞塔高原夏季氣溫可能超過 38°C，部分路段數十公里缺乏遮蔭。建議避開正午高溫時段，清晨提早出發，並依天候、路段及個人飲水需求攜帶至少 2 公升飲水與電解質補給。",
      "最後 100 公里自薩里亞（Sarria）起步的朝聖者明顯增加，尤其在春夏旺季及聖雅各年，住宿需求較高。公立庇護所通常採先到先得制度，旺季應預留住宿安排的彈性，避免完全依賴當天臨時找房。",
    ],
    pitfallWarningsEn: [
      "In winter, the high Route Napoléon over the Pyrenees (SJPP to Roncesvalles) is legally closed (typically Nov 1 to March 31). Pilgrims must take the low Valcarlos route; do not attempt the high mountain path in adverse conditions.",
      "The Meseta can exceed 38°C in July and August, with long distances between shaded villages. Start before sunrise and carry at least 2 liters of water with electrolytes.",
      "Pilgrim numbers surge dramatically after Sarria (the final 100 km), especially in peak summer and Holy Years. Reserve private rooms in advance or arrive early at municipal albergues.",
    ],
    recommendedStartGuide: {
      hubCity: "巴黎 / 馬德里 / 巴約訥",
      hubCityEn: "Paris / Madrid / Bayonne",
      transferTips:
        "從巴黎搭乘 TGV 高鐵前往 Bayonne，車程約 4 小時，再轉乘 TER 區域列車前往 Saint-Jean-Pied-de-Port，車程約 1 小時至 1 小時 30 分鐘，實際時間依班次及營運狀況而異。冬季或鐵路施工期間，部分班次可能改以巴士接駁，出發前應確認 SNCF Connect 最新時刻表。",
      transferTipsEn:
        "Take the TGV from Paris Montparnasse to Bayonne (~4h), then connect to the TER regional train to Saint-Jean-Pied-de-Port (~1h 15m). In winter or during rail maintenance, SNCF may substitute buses; verify on SNCF Connect.",
    },
  },
  {
    id: "portugues",
    name: "葡萄牙之路",
    nameEn: "Camino Portugués",
    spanishName: "Camino Portugués",
    startTown: "波多 (Porto)",
    startTownEn: "Porto",
    startTownCountry: "葡萄牙",
    startTownCountryEn: "Portugal",
    totalDistanceKm: 243,
    recommendedDays: "11 ～ 14 天",
    recommendedDaysEn: "11 – 14 days",
    dailyDistanceAvgKm: "約 18 ～ 24 km",
    dailyDistanceAvgKmEn: "~18 – 24 km",
    difficulty: "容易",
    difficultyEn: "Easy to Moderate",
    difficultyStars: 2,
    landscapeType: "大西洋海岸、木棧道、古羅馬與中世紀石橋、綠酒葡萄莊園、加利西亞河灣",
    landscapeTypeEn: "Atlantic coast, wooden boardwalks, Roman & medieval stone bridges, Vinho Verde vineyards, Galician rías",
    pavementRatio: {
      trail: 35,
      boardwalkOrCobble: 10,
      asphalt: 55,
    },
    bestMonths: "4-10 月",
    bestMonthsEn: "Apr–Oct",
    badge: "海岸與古道",
    badgeEn: "Coastal & Inland",
    targetAudience: "休假時間約 2 週、偏好相對平緩路面、喜愛海洋風光或古老葡萄園的朝聖者。",
    targetAudienceEn: "Pilgrims with ~2 weeks of vacation, those seeking gentler gradients, and lovers of coastal seafood and historic wine country.",
    summary:
      "葡萄牙之路是熱門度僅次於法國之路的經典朝聖路線。自葡萄牙波多（Porto）啟程，徒步者可選擇穿越鄉村、中世紀古鎮與歷史古橋的中央線（Caminho Central），或沿著大西洋海岸前進的海岸線（Caminho da Costa）。兩條路線在西班牙雷東德拉（Redondela）附近匯合後，繼續北上前往聖地牙哥。中央線全程約 243 公里，海岸線則約 271 公里。",
    summaryEn:
      "The second most popular route to Santiago. Starting from World Heritage Porto, walkers can choose between the rural Central Route (Caminho Central) with medieval towns and Roman bridges, or the Coastal Route (Caminho da Costa) along Atlantic beaches and boardwalks, converging near Redondela before reaching Santiago.",
    keyFeatures: [
      {
        title: "中央線 vs. 海岸線特色",
        description:
          "中央線（約 243 km）途經以公雞傳說聞名的巴塞盧什（Barcelos），以及擁有羅馬時期歷史淵源與中世紀古橋的蓬特迪利馬（Ponte de Lima）。沿途穿越鄉村、林地及傳統石板街道，朝聖設施相對完善；海岸線（約 271 km）則沿著大西洋海岸、沙灘、木棧道與海濱步道前行，能欣賞不同於內陸路線的海洋景觀。",
        titleEn: "Central vs. Coastal Options",
        descriptionEn:
          "The Central Route (~243 km) visits historic Barcelos and ancient Ponte de Lima with charming stone streets and shaded woodlands. The Coastal Route (~271 km) follows ocean sands, sea breezes, and wooden boardwalks.",
      },
      {
        title: "跨越國境的國際水上接駁體驗",
        description:
          "海岸線朝聖者通常會在葡萄牙 Caminha 預約水上計程車（例如 Xacobeo Transfer），橫越米尼奧河（Minho River）抵達西班牙加利西亞的 A Guarda。航程約 10 分鐘，但服務並非全年固定營運，會受到季節、天候、水位及營運安排影響，出發前應確認當日服務及預約方式。",
        titleEn: "Cross-Border River Boat Crossing",
        descriptionEn:
          "Coastal walkers in Caminha often cross the Minho River into Spain via pilgrim taxi-boat (e.g., Xacobeo Transfer) to A Guarda in 10 minutes. Operational hours depend on tides and season.",
      },
      {
        title: "地形相對平緩、步調悠閒",
        description:
          "海岸線前段地勢相對平緩，沿途以海濱步道、木棧道及鄉村道路為主，整體爬升幅度通常低於中央線，適合喜歡悠閒步調及海景的朝聖者。不過，進入西班牙後仍會經過部分丘陵與起伏路段，尤其 Redondela 之後與中央線匯合，仍須面對一定程度的上下坡。中央線則以 Ponte de Lima 至 Rubiães 之間的 Alto da Portela（Labruja）爬升路段最具挑戰性，沿途需要克服較明顯的上坡與下坡。選擇時應考量每日步行距離、個人體能及對爬升路段的適應程度。",
        titleEn: "Gentle Elevation with Occasional Climbs",
        descriptionEn:
          "The coastal segments are mostly flat with boardwalks and paved paths. The notable elevation challenge on the Central Route is Alto da Portela (Labruja) between Ponte de Lima and Rubiães.",
      },
    ],
    pitfallWarnings: [
      "波多市區出城初段需要穿越市區道路及部分車流較多的路段，尤其中央線部分路段有較多柏油路面。若希望減少市區硬鋪裝路及車流干擾，可研究搭乘大眾運輸前往 Matosinhos，再銜接海岸步道，但這會改變原本的步行起點與實際里程。",
      "從葡萄牙跨越米尼奧河進入西班牙加利西亞時，記得將手錶調快 1 小時。葡萄牙與西班牙全年相差 1 小時，但兩國均會實施夏令時間，實際 UTC 時區會隨季節調整，避免錯過庇護所登記及預約時間。",
      "葡萄牙傳統小鎮常有高低不平的古石板路（Calçada），雨天容易打滑，建議穿著鞋底抓地力良好的健行鞋，並在濕滑路面降低行走速度。",
    ],
    pitfallWarningsEn: [
      "Leaving Porto on foot follows industrial suburbs and asphalt roads. Many pilgrims take the metro (Line A) from Trindade to Matosinhos to start directly on the beach boardwalks.",
      "Remember to set your watch forward 1 hour upon crossing the Minho River into Spain (Portugal is UTC+0, Spain is UTC+1).",
      "Traditional Portuguese stone pavement (Calçada Portuguesa) becomes extremely slick when wet. Wear trail shoes with reliable wet-surface traction.",
    ],
    recommendedStartGuide: {
      hubCity: "波多國際機場 (OPO)",
      hubCityEn: "Porto Airport (OPO)",
      transferTips:
        "抵達波多機場後，可搭乘 Metro E（紫線）前往市中心 Trindade 站，再依住宿地點步行或轉乘前往波多主教座堂（Sé do Porto），作為中央線起點。若選擇海岸線，可由市區搭乘 Metro A（藍線）前往 Matosinhos 一帶，再銜接海岸步道；實際起步點與路線應依選擇的海岸線變體調整。",
      transferTipsEn:
        "From Porto Airport, take Metro Line E directly to Trindade station (approx. 27 mins). Walk to the Cathedral for the Central Route, or take Line A to Matosinhos for the Coastal Route.",
    },
  },
  {
    id: "norte",
    name: "北方之路",
    nameEn: "Camino del Norte",
    spanishName: "Camino del Norte",
    startTown: "伊倫 (Irún)",
    startTownEn: "Irún",
    startTownCountry: "西班牙",
    startTownCountryEn: "Spain",
    totalDistanceKm: 820,
    recommendedDays: "35 ～ 38 天",
    recommendedDaysEn: "35 – 38 days",
    dailyDistanceAvgKm: "約 22 ～ 24 km",
    dailyDistanceAvgKmEn: "~22 – 24 km",
    difficulty: "挑戰",
    difficultyEn: "Challenging",
    difficultyStars: 5,
    landscapeType: "比斯開灣海岸、巴斯克丘陵、坎塔布里亞海灘、阿斯圖里亞斯綠色山谷",
    landscapeTypeEn: "Bay of Biscay cliffs, Basque hills, Cantabrian beaches, Asturian green valleys",
    pavementRatio: {
      trail: 31,
      boardwalkOrCobble: 5,
      asphalt: 64,
    },
    bestMonths: "6-9 月",
    bestMonthsEn: "Jun–Sep",
    badge: "絕美海岸挑戰",
    badgeEn: "Scenic & Strenuous",
    targetAudience: "具備良好體能、能適應長距離步行與連續上下坡，喜愛海岸景觀、自然風光及西班牙北部地方美食的朝聖者。",
    targetAudienceEn: "Experienced hikers with strong physical fitness who enjoy continuous elevation changes, ocean panoramas, and northern Spanish gastronomy.",
    summary:
      "北方之路自法西邊境的伊倫出發，沿著西班牙北部一路西行，行經巴斯克地區、坎塔布里亞、阿斯圖里亞斯，最後進入加利西亞，全程約 820～831 公里，實際距離依路線變體而異。沿途可欣賞比斯開灣的壯闊海景、陡峭海岸、沙灘與翠綠山谷，但並非全程緊鄰海岸，部分路段需要深入丘陵及內陸地區。北方之路以豐富的海岸景觀、頻繁的地形起伏及較高的體能需求聞名，是兼具自然美景與體能挑戰的長途朝聖路線。",
    summaryEn:
      "Starting from the French-Spanish border town of Irún, the Camino del Norte tracks west along northern Spain across the Basque Country, Cantabria, Asturias, and into Galicia (~820 km). Famous for rugged coastal cliffs, sandy coves, and significant cumulative elevation gain.",
    keyFeatures: [
      {
        title: "海岸丘陵交錯的體能挑戰",
        description:
          "巴斯克地區前段地形起伏明顯，朝聖者經常需要在海岸與丘陵之間上下攀爬。尤其伊倫至畢爾包一帶，連續的爬升與下降相當考驗腿力與耐力；即使離開巴斯克地區，沿途仍有不少起伏路段。部分階段會出現較長距離的連續上下坡，即使每日總里程不高，也可能因累積爬升而增加疲勞。",
        titleEn: "Coastal Cliffs & Mountain Gradients",
        descriptionEn:
          "The Basque segments feature steep climbs and descents between cliffs and valleys. Consecutive ascents test endurance even on stages with modest mileage.",
      },
      {
        title: "巴斯克與阿斯圖里亞斯美食巡禮",
        description:
          "途經以 Pintxos（巴斯克風味小點）聞名的聖塞巴斯提安（San Sebastián）及畢爾包（Bilbao），並可在坎塔布里亞與阿斯圖里亞斯品嚐當地海鮮、乳酪及特色天然蘋果酒（Sidra），感受西班牙北部多元的地方飲食文化。",
        titleEn: "Basque & Asturian Culinary Journey",
        descriptionEn:
          "Passes through culinary capitals San Sebastián and Bilbao for legendary pintxos, followed by Cantabrian seafood and traditional Asturian natural cider (Sidra).",
      },
      {
        title: "穿越海灣與河口的水上接駁",
        description:
          "沿途部分路段可體驗特色水上交通，例如 Pasaia 兩岸之間的小型渡船，以及 Somo 前往桑坦德（Santander）的渡船。此外，部分路線變體會經過世界遺產比斯開橋（Puente Bizkaia），讓徒步旅程增添不同的交通體驗。這些交通方式會依實際路線選擇而有所不同，出發前應確認營運時間。",
        titleEn: "Estuary & Bay Boat Crossings",
        descriptionEn:
          "Features small water taxi crossings such as the boat across Pasaia bay, the Somo-Santander ferry, and the option to walk the iconic Vizcaya hanging transporter bridge.",
      },
    ],
    pitfallWarnings: [
      "北方之路部分路段需要長時間行走於柏油路及硬質鋪裝路面，尤其經過城鎮及道路連接路段時，容易累積足部與膝蓋疲勞。建議穿著已充分適應、支撐性與緩震性良好的健行鞋，並適時休息及調整每日步行距離。",
      "7～8 月是西班牙北部沿海旅遊旺季，熱門城鎮及床位有限的村莊可能較早客滿。建議提前確認住宿，尤其是行程固定、需要入住特定城鎮時，不宜完全依賴當天臨時找房。",
      "西班牙北部受到大西洋氣候影響，天候變化較大，即使夏季也可能遇到降雨與強風。建議攜帶輕量防水透氣外套、背包防水套及適合濕冷天候的裝備。",
    ],
    pitfallWarningsEn: [
      "Notable sections require walking on paved roads and hard asphalt, which accelerates foot and joint fatigue. Wear well-cushioned trail runners and pace yourself.",
      "July and August are peak beach tourism months in northern Spain. Albergues and coastal hotels fill quickly; plan ahead or reserve private rooms where possible.",
      "Atlantic coastal weather is unpredictable with sudden rainstorms and coastal winds even in midsummer. Pack a high-quality lightweight waterproof jacket and backpack cover.",
    ],
    recommendedStartGuide: {
      hubCity: "馬德里 / 聖塞巴斯提安 / 畢爾包",
      hubCityEn: "Madrid / San Sebastián / Bilbao",
      transferTips:
        "可從馬德里搭乘 Renfe 列車前往 Irún，實際車程與是否需要轉乘依當日班次而異；也可飛抵畢爾包機場，再前往 Bilbao Intermodal 巴士總站查詢前往 Irún 的 ALSA 班次，或先抵達聖塞巴斯提安再轉乘區域交通。建議預留轉乘時間，並於出發前確認最新交通時刻表。",
      transferTipsEn:
        "Take a Renfe Alvia train from Madrid Chamartín directly to Irún (~5.5h). Alternatively, fly into Bilbao (BIO) or San Sebastián (EAS) and take an ALSA regional bus to Irún.",
    },
  },
];

/**
 * 世界盡頭延伸線專題（依附於既有路線之延伸段）
 */
export const FINISTERRE_GUIDE = {
  name: "世界盡頭與穆希亞延伸線",
  nameEn: "Finisterre & Muxía Extension",
  spanishName: "Camino de Finisterre y Muxía",
  startTown: "聖地牙哥德孔波斯特拉",
  startTownEn: "Santiago de Compostela",
  endTown: "菲尼斯特雷 (Finisterre) / 穆希亞 (Muxía)",
  endTownEn: "Finisterre / Muxía",
  totalDistanceKm: "約 89 ～ 118 km",
  totalDistanceKmEn: "~89 – 118 km",
  recommendedDays: "3 ～ 4 天",
  recommendedDaysEn: "3 – 4 days",
  summary:
    "抵達聖地牙哥大教堂並非朝聖旅途的終點。古羅馬人相信加利西亞西岸的菲尼斯特雷燈塔是陸地的極限、太陽沉入大海之處（Finis Terrae，即世界的盡頭）。徒步者走向大海，象徵舊生命的死亡與靈魂的重生。",
  summaryEn:
    "Reaching the Cathedral of Santiago is not necessarily the final stop. The ancients believed Cape Finisterre (Finis Terrae, the End of the Earth) was the westernmost limit of the known world where the sun sank into the ocean. Walking to the Atlantic coast symbolizes the renewal of the soul and the conclusion of the pilgrimage.",
  highlights: [
    "菲尼斯特雷燈塔 0.00km 地標：坐在懸崖巨石上靜靜凝望大西洋日落，將朝聖疲憊化為心靈的圓滿。",
    "穆希亞聖殿（Santuario da Virxe da Barca）：矗立於狂暴海浪岩岸之上的聖所，據傳為聖母乘石船現身安慰聖雅各的神聖遺址。",
    "雙重專屬證書：在兩地可分別於市政廳免費申請專屬的《Fisterrana》與《Muxiana》完步證書。",
  ],
  highlightsEn: [
    "Cape Finisterre Lighthouse 0.00 km Milestone: Sit on rugged ocean cliffs to watch the Atlantic sunset, transforming the physical journey into spiritual completeness.",
    "Sanctuary of A Virxe da Barca in Muxía: An iconic seaside shrine perched atop storm-carved coastal rocks, where legend says the Virgin Mary appeared by stone boat to encourage Saint James.",
    "Dual Completion Certificates: Receive the official Fisterrana certificate in Finisterre and the Muxiana certificate in Muxía at local municipal offices upon presenting stamped credentials.",
  ],
};
