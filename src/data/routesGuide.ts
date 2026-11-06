/**
 * 朝聖路線攻略與關鍵指標資料庫
 * 嚴格對齊目前排程系統收錄之路線（法國之路、葡萄牙之路、北方之路，以及世界盡頭延伸線）
 */

import type { RouteId } from "@/types/route";

export interface RouteGuideItem {
  id: RouteId;
  name: string;
  spanishName: string;
  startTown: string;
  startTownCountry: string;
  totalDistanceKm: number;
  recommendedDays: string;
  dailyDistanceAvgKm: string;
  difficulty: "適中" | "容易" | "挑戰" | "極高挑戰";
  difficultyStars: number; // 1 ~ 5
  landscapeType: string;
  pavementRatio: {
    trail: number; // 泥土/碎石山徑 %
    boardwalkOrCobble: number; // 木棧道/石板路 %
    asphalt: number; // 柏油硬路 %
  };
  bestMonths: string;
  badge?: string;
  targetAudience: string;
  summary: string;
  keyFeatures: {
    title: string;
    description: string;
  }[];
  pitfallWarnings: string[];
  recommendedStartGuide: {
    hubCity: string;
    transferTips: string;
  };
}

export const ROUTES_GUIDE_LIST: RouteGuideItem[] = [
  {
    id: "frances",
    name: "法國之路",
    spanishName: "Camino Francés",
    startTown: "聖讓皮耶德波爾 (SJPP)",
    startTownCountry: "法國",
    totalDistanceKm: 779,
    recommendedDays: "33 ～ 35 天",
    dailyDistanceAvgKm: "約 22 ～ 26 km",
    difficulty: "適中",
    difficultyStars: 3,
    landscapeType: "高山森林、拉里奧哈葡萄園、梅塞塔麥田高原、加利西亞丘陵",
    pavementRatio: {
      trail: 62,
      boardwalkOrCobble: 8,
      asphalt: 30,
    },
    bestMonths: "5-6 月、9-10 月",
    badge: "經典路線",
    targetAudience: "第一次踏上朝聖之路、喜愛豐富社交氛圍、時間充裕（約 5 週）的徒步者。",
    summary:
      "法國之路是全球最知名、設施最齊備、文化歷史底蘊最深厚的黃金路線。沿途庇護所密度極高、補給無虞、指標清晰，從翻越庇里牛斯山的震撼到梅塞塔高原的孤寂冥想，是無可取代的人生蛻變之旅。",
    keyFeatures: [
      {
        title: "三大典型地貌層次遞進",
        description:
          "首段庇里牛斯山翻越（爬升 1,250m）、中段梅塞塔高原（超過 200 公里筆直無垠麥田，深度考驗耐力）、尾段加利西亞童話般的尤加利樹林與綠意山巒。",
      },
      {
        title: "全球朝聖者社群的大熔爐",
        description:
          "全球超過 50% 朝聖者選擇的路線。每晚在庇護所的朝聖者晚餐（Menu del Peregrino）與世界各國旅人舉杯交心，社交氛圍最濃烈。",
      },
      {
        title: "彈性極佳的分段節奏",
        description:
          "每隔 3 至 5 公里即有城鎮或小酒館（Bar），隨時可停下歇腳喝咖啡，非常適合初次嘗試長途徒步的人自主配速。若假期有限，亦可自最後 114 公里的薩里亞（Sarria）起步完成 5 天精華段。",
      },
    ],
    pitfallWarnings: [
      "每年 11/1 至隔年 3/31 法國官方強制封閉高空拿破崙越嶺線，冬季務必改走低海拔 Valcarlos 谷道路線以防暴風雪失溫。",
      "梅塞塔高原夏季氣溫常破 38°C 且數十公里毫無遮蔭，請務必清晨 5 點出發，並攜帶至少 2 公升飲水與電解質補給。",
      "最後 100 公里薩里亞（Sarria）開始人潮激增 3 倍，公立庇護所床位較緊張，旺季建議提前規劃入住時間。",
    ],
    recommendedStartGuide: {
      hubCity: "巴黎 / 馬德里 / 巴約訥",
      transferTips: "從巴黎搭乘 TGV 高鐵至 Bayonne（約 4 小時），再轉搭 TER 區域鐵路 1 小時直達起點 SJPP 車站。",
    },
  },
  {
    id: "portugues",
    name: "葡萄牙之路",
    spanishName: "Camino Portugués",
    startTown: "波多 (Porto)",
    startTownCountry: "葡萄牙",
    totalDistanceKm: 243,
    recommendedDays: "11 ～ 14 天",
    dailyDistanceAvgKm: "約 18 ～ 24 km",
    difficulty: "容易",
    difficultyStars: 2,
    landscapeType: "大西洋海風木棧道、古羅馬石板石橋、綠酒葡萄莊園、加利西亞河灣",
    pavementRatio: {
      trail: 35,
      boardwalkOrCobble: 10,
      asphalt: 55,
    },
    bestMonths: "4-10 月",
    targetAudience: "休假時間約 2 週、偏好平緩路面、喜愛海洋風光或古老葡萄園的朝聖者。",
    summary:
      "熱門度僅次於法國之路的經典路線。自世界文化遺產波多啟程，徒步者可自由選擇緊鄰大西洋的「海岸線（Senda Litoral / Costa）」或穿越中世紀古鎮的「中央線（Central）」，並於雷東德拉（Redondela）匯合北上。",
    keyFeatures: [
      {
        title: "中央線 vs. 海岸線特色",
        description:
          "中央線（約 243km）途經以公雞傳奇聞名的傳奇之城巴塞盧什（Barcelos），與羅馬起源的歷史古橋蓬特迪利馬（Ponte de Lima），林道泥徑舒適且庇護所密度高；海岸線（約 271km）則沿著大西洋海岸、木棧道與海濱步道前行。",
      },
      {
        title: "跨越國境的國際渡輪體驗",
        description:
          "海岸線朝聖者通常會在葡萄牙 Caminha 搭乘 Xacobeo Transfer 水上接駁或私人計程快艇，橫越米尼奧河（Minho River），抵達西班牙加利西亞的 A Guarda。這段約 10 分鐘的跨國渡河體驗，是海岸線最具特色的旅程之一。船班會受到季節、天候與營運安排影響，出發前應確認當日服務及預約方式。",
      },
      {
        title: "地形相對平緩、步調悠閒",
        description:
          "海岸線前段地勢相對平緩，沿途以海濱步道、木棧道及鄉村道路為主，整體爬升幅度通常低於中央線，適合喜歡悠閒步調及海景的朝聖者。不過，進入西班牙後仍會經過部分丘陵與起伏路段，尤其 Redondela 之後與中央線匯合，仍須面對一定程度的上下坡。中央線則以 Ponte de Lima 至 Rubiães 的 Alto da Portela（Labruja）爬升路段最具挑戰性。中央線則以 Ponte de Lima 至 Rubiães 的 Alto da Portela（Labruja）爬升路段最具挑戰性，沿途需要克服較明顯的上坡與下坡。兩條路線各有不同的地形特色，選擇時應考量每日步行距離、個人體能及對爬升路段的適應程度。",
      },
    ],
    pitfallWarnings: [
      "波多出城前 10 公里多為高車流量工業區硬鋪裝路，強烈建議搭乘波多輕軌藍線至 Matosinhos 出站作為海岸線實質起點。",
      "從葡萄牙跨越米尼奧河進入西班牙加利西亞時，務必將手錶調快 1 小時（葡萄牙 UTC+0 ➔ 西班牙 UTC+1），避免錯過庇護所開放登記時間。",
      "葡萄牙傳統小鎮常為高凹凸不平的古石板路（Calçada），雨天容易打滑，建議穿著防滑底鞋款。",
    ],
    recommendedStartGuide: {
      hubCity: "波多國際機場 (OPO)",
      transferTips:
        "抵達波多機場後直接搭乘波多輕軌紫線（Metro E）直達市中心波多主教座堂（中央線起點）或轉藍線直奔海岸線起點。",
    },
  },
  {
    id: "norte",
    name: "北方之路",
    spanishName: "Camino del Norte",
    startTown: "伊倫 (Irún)",
    startTownCountry: "西班牙",
    totalDistanceKm: 820,
    recommendedDays: "35 ～ 38 天",
    dailyDistanceAvgKm: "約 22 ～ 24 km",
    difficulty: "挑戰",
    difficultyStars: 5,
    landscapeType: "比斯開灣海岸、巴斯克丘陵、坎塔布里亞海灘、綠蔭山谷",
    pavementRatio: {
      trail: 31,
      boardwalkOrCobble: 5,
      asphalt: 64,
    },
    bestMonths: "6-9 月",
    targetAudience: "具備良好體能、能適應長距離步行與連續上下坡，喜愛海岸景觀、自然風光及西班牙北部地方美食的朝聖者。",
    summary:
      "自法西邊境的伊倫出發，沿著西班牙北部海岸一路西行，行經巴斯克地區、坎塔布里亞、阿斯圖里亞斯，最後進入加利西亞，全程約 820～831 公里。沿途可欣賞比斯開灣的壯闊海景、陡峭海岸與翠綠山谷，也會遇到連續起伏的丘陵地形。北方之路以豐富的海岸景觀與較高的累積爬升聞名，是兼具自然美景與體能挑戰的長途朝聖路線。",
    keyFeatures: [
      {
        title: "海岸丘陵交錯的體能挑戰",
        description:
          "巴斯克地區前段地形起伏明顯，朝聖者經常需要在海岸與丘陵之間上下攀爬。尤其伊倫至畢爾包一帶，連續的爬升與下降相當考驗腿力與耐力；即使離開巴斯克地區，沿途仍有不少起伏路段。",
      },
      {
        title: "巴斯克與阿斯圖里亞斯美食巡禮",
        description:
          "途經以 Pintxos（巴斯克風味小點）聞名的聖塞巴斯提安（San Sebastián）、畢爾包與桑坦德等城市，也能品嚐沿海海鮮及阿斯圖里亞斯特色天然蘋果酒（Sidra），感受西班牙北部多元的地方飲食文化。",
      },
      {
        title: "穿越海灣與河口的水上接駁",
        description:
          "沿途部分路段保留特色水上交通，例如 Pasaia 兩岸之間的小型渡船，以及 Somo 前往桑坦德（Santander）的渡船。此外，部分路線變體會經過世界遺產比斯開橋（Puente Bizkaia），讓徒步旅程增添不同的交通體驗。",
      },
    ],
    pitfallWarnings: [
      "沿途部分路段需要長時間行走於柏油路及硬質路面，容易累積足部與膝蓋疲勞。建議穿著已充分適應、支撐性與緩震性良好的健行鞋，並適時休息及調整每日步行距離。",
      "7～8 月是西班牙北部沿海旅遊旺季，熱門城鎮及床位有限的村莊可能較早客滿。建議提前確認住宿，尤其是行程固定、需要入住特定城鎮時，不宜完全依賴當天臨時找房。",
      "西班牙北部受到大西洋氣候影響，天候變化較大，即使夏季也可能遇到降雨與強風。建議攜帶輕量防水透氣外套、背包防水套及適合濕冷天候的裝備。",
    ],
    recommendedStartGuide: {
      hubCity: "馬德里 / 聖塞巴斯提安 / 畢爾包",
      transferTips:
        "可從馬德里搭乘 Renfe 長途列車前往 Irún，車程約 5.5～6.5 小時，實際時間依班次而異；也可飛抵畢爾包機場，再前往 Bilbao Intermodal 巴士總站搭乘 ALSA 前往 Irún，或經聖塞巴斯提安轉乘。出發前請確認最新班次及轉乘安排。",
    },
  },
];

/**
 * 世界盡頭延伸線專題（依附於既有路線之延伸段）
 */
export const FINISTERRE_GUIDE = {
  name: "世界盡頭與穆希亞延伸線",
  spanishName: "Camino de Finisterre y Muxía",
  startTown: "聖地牙哥德孔波斯特拉",
  endTown: "菲尼斯特雷 (Finisterre) / 穆希亞 (Muxía)",
  totalDistanceKm: "約 89 ～ 118 km",
  recommendedDays: "3 ～ 4 天",
  summary:
    "抵達聖地牙哥大教堂並非朝聖旅途的終點。古羅馬人相信加利西亞西岸的菲尼斯特雷燈塔是陸地的極限、太陽沉入大海之處（Finis Terrae，即世界的盡頭）。徒步者走向大海，象徵舊生命的死亡與靈魂的重生。",
  highlights: [
    "菲尼斯特雷燈塔 0.00km 地標：坐在懸崖巨石上靜靜凝望大西洋日落，將朝聖疲憊化為心靈的圓滿。",
    "穆希亞聖殿（Santuario da Virxe da Barca）：矗立於狂暴海浪岩岸之上的聖所，據傳為聖母乘石船現身安慰聖雅各的神聖遺址。",
    "雙重專屬證書：在兩地可分別於市政廳免費申請專屬的《Fisterrana》與《Muxiana》完步證書。",
  ],
};
