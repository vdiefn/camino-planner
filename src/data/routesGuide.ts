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
    totalDistanceKm: 764,
    recommendedDays: "33 ～ 35 天",
    dailyDistanceAvgKm: "約 22 ～ 24 km",
    difficulty: "適中",
    difficultyStars: 3,
    landscapeType: "庇里牛斯山、拉里奧哈葡萄園、梅塞塔麥田高原、加利西亞丘陵與尤加利樹林",
    pavementRatio: {
      trail: 62,
      boardwalkOrCobble: 8,
      asphalt: 30,
    },
    bestMonths: "5-6 月、9-10 月",
    badge: "經典路線",
    targetAudience: "第一次踏上朝聖之路、喜愛豐富社交氛圍、時間充裕（約 5 週）的徒步者。",
    summary:
      "法國之路是聖雅各朝聖之路中最知名、歷史底蘊最深厚且沿途朝聖設施相當完善的經典路線。沿途城鎮、庇護所與補給設施相對密集，指標清晰，從翻越庇里牛斯山的壯闊景觀，到梅塞塔高原的遼闊平原，再到加利西亞的綠意山丘，呈現豐富多變的自然景觀與文化體驗。",
    keyFeatures: [
      {
        title: "三大典型地貌層次遞進",
        description:
          "首段翻越庇里牛斯山，拿破崙路線具有明顯的爬升挑戰；中段穿越梅塞塔高原，以開闊農田、麥田與廣闊平原為主，部分路段長時間缺乏遮蔭；尾段進入加利西亞，沿途可見尤加利樹林、森林小徑與綠意盎然的丘陵。",
      },
      {
        title: "全球朝聖者社群的大熔爐",
        description:
          "法國之路是全球最受歡迎的朝聖路線，長年位居各條聖雅各朝聖路線的首位。沿途朝聖者來自世界各地，庇護所、朝聖者晚餐（Menú del Peregrino）與公共休息空間形成濃厚的國際交流氛圍。",
      },
      {
        title: "彈性極佳的分段節奏",
        description:
          "沿線城鎮、村莊及朝聖者服務設施相對密集，多數路段可找到休息及補給點，適合初次嘗試長途徒步的人自主配速。不過，梅塞塔部分路段的城鎮間距較長，出發前仍應確認飲水及餐飲供應。若假期有限，亦可自最後 114 公里的薩里亞（Sarria）起步，通常約 5 天即可抵達聖地牙哥。",
      },
    ],
    pitfallWarnings: [
      "冬季期間，Saint-Jean-Pied-de-Port 至 Roncesvalles 的高海拔拿破崙路線（Route Napoléon）會受到季節性管制，通常於 11 月 1 日至隔年 3 月 31 日禁止通行，實際管制日期應以當年度官方公告為準。冬季出發應改走 Valcarlos 低海拔替代路線，切勿因天候不佳而冒險翻越山區。",
      "梅塞塔高原夏季氣溫可能超過 38°C，部分路段數十公里缺乏遮蔭。建議避開正午高溫時段，清晨提早出發，並依天候、路段及個人飲水需求攜帶至少 2 公升飲水與電解質補給。",
      "最後 100 公里自薩里亞（Sarria）起步的朝聖者明顯增加，尤其在春夏旺季及聖雅各年，住宿需求較高。公立庇護所通常採先到先得制度，旺季應預留住宿安排的彈性，避免完全依賴當天臨時找房。",
    ],
    recommendedStartGuide: {
      hubCity: "巴黎 / 馬德里 / 巴約訥",
      transferTips:
        "從巴黎搭乘 TGV 高鐵前往 Bayonne，車程約 4 小時，再轉乘 TER 區域列車前往 Saint-Jean-Pied-de-Port，車程約 1 小時至 1 小時 30 分鐘，實際時間依班次及營運狀況而異。冬季或鐵路施工期間，部分班次可能改以巴士接駁，出發前應確認 SNCF Connect 最新時刻表。",
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
    landscapeType: "大西洋海岸、木棧道、古羅馬與中世紀石橋、綠酒葡萄莊園、加利西亞河灣",
    pavementRatio: {
      trail: 35,
      boardwalkOrCobble: 10,
      asphalt: 55,
    },
    bestMonths: "4-10 月",
    targetAudience: "休假時間約 2 週、偏好相對平緩路面、喜愛海洋風光或古老葡萄園的朝聖者。",
    summary:
      "葡萄牙之路是熱門度僅次於法國之路的經典朝聖路線。自葡萄牙波多（Porto）啟程，徒步者可選擇穿越鄉村、中世紀古鎮與歷史古橋的中央線（Caminho Central），或沿著大西洋海岸前進的海岸線（Caminho da Costa）。兩條路線在西班牙雷東德拉（Redondela）附近匯合後，繼續北上前往聖地牙哥。中央線全程約 243 公里，海岸線則約 271 公里。",
    keyFeatures: [
      {
        title: "中央線 vs. 海岸線特色",
        description:
          "中央線（約 243 km）途經以公雞傳說聞名的巴塞盧什（Barcelos），以及擁有羅馬時期歷史淵源與中世紀古橋的蓬特迪利馬（Ponte de Lima）。沿途穿越鄉村、林地及傳統石板街道，朝聖設施相對完善；海岸線（約 271 km）則沿著大西洋海岸、沙灘、木棧道與海濱步道前行，能欣賞不同於內陸路線的海洋景觀。",
      },
      {
        title: "跨越國境的國際水上接駁體驗",
        description:
          "海岸線朝聖者通常會在葡萄牙 Caminha 預約水上計程車（例如 Xacobeo Transfer），橫越米尼奧河（Minho River）抵達西班牙加利西亞的 A Guarda。航程約 10 分鐘，但服務並非全年固定營運，會受到季節、天候、水位及營運安排影響，出發前應確認當日服務及預約方式。",
      },
      {
        title: "地形相對平緩、步調悠閒",
        description:
          "海岸線前段地勢相對平緩，沿途以海濱步道、木棧道及鄉村道路為主，整體爬升幅度通常低於中央線，適合喜歡悠閒步調及海景的朝聖者。不過，進入西班牙後仍會經過部分丘陵與起伏路段，尤其 Redondela 之後與中央線匯合，仍須面對一定程度的上下坡。中央線則以 Ponte de Lima 至 Rubiães 之間的 Alto da Portela（Labruja）爬升路段最具挑戰性，沿途需要克服較明顯的上坡與下坡。選擇時應考量每日步行距離、個人體能及對爬升路段的適應程度。",
      },
    ],
    pitfallWarnings: [
      "波多市區出城初段需要穿越市區道路及部分車流較多的路段，尤其中央線部分路段有較多柏油路面。若希望減少市區硬鋪裝路及車流干擾，可研究搭乘大眾運輸前往 Matosinhos，再銜接海岸步道，但這會改變原本的步行起點與實際里程。",
      "從葡萄牙跨越米尼奧河進入西班牙加利西亞時，記得將手錶調快 1 小時。葡萄牙與西班牙全年相差 1 小時，但兩國均會實施夏令時間，實際 UTC 時區會隨季節調整，避免錯過庇護所登記及預約時間。",
      "葡萄牙傳統小鎮常有高低不平的古石板路（Calçada），雨天容易打滑，建議穿著鞋底抓地力良好的健行鞋，並在濕滑路面降低行走速度。",
    ],
    recommendedStartGuide: {
      hubCity: "波多國際機場 (OPO)",
      transferTips:
        "抵達波多機場後，可搭乘 Metro E（紫線）前往市中心 Trindade 站，再依住宿地點步行或轉乘前往波多主教座堂（Sé do Porto），作為中央線起點。若選擇海岸線，可由市區搭乘 Metro A（藍線）前往 Matosinhos 一帶，再銜接海岸步道；實際起步點與路線應依選擇的海岸線變體調整。",
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
    landscapeType: "比斯開灣海岸、巴斯克丘陵、坎塔布里亞海灘、阿斯圖里亞斯綠色山谷",
    pavementRatio: {
      trail: 31,
      boardwalkOrCobble: 5,
      asphalt: 64,
    },
    bestMonths: "6-9 月",
    targetAudience: "具備良好體能、能適應長距離步行與連續上下坡，喜愛海岸景觀、自然風光及西班牙北部地方美食的朝聖者。",
    summary:
      "北方之路自法西邊境的伊倫出發，沿著西班牙北部一路西行，行經巴斯克地區、坎塔布里亞、阿斯圖里亞斯，最後進入加利西亞，全程約 820～831 公里，實際距離依路線變體而異。沿途可欣賞比斯開灣的壯闊海景、陡峭海岸、沙灘與翠綠山谷，但並非全程緊鄰海岸，部分路段需要深入丘陵及內陸地區。北方之路以豐富的海岸景觀、頻繁的地形起伏及較高的體能需求聞名，是兼具自然美景與體能挑戰的長途朝聖路線。",
    keyFeatures: [
      {
        title: "海岸丘陵交錯的體能挑戰",
        description:
          "巴斯克地區前段地形起伏明顯，朝聖者經常需要在海岸與丘陵之間上下攀爬。尤其伊倫至畢爾包一帶，連續的爬升與下降相當考驗腿力與耐力；即使離開巴斯克地區，沿途仍有不少起伏路段。部分階段會出現較長距離的連續上下坡，即使每日總里程不高，也可能因累積爬升而增加疲勞。",
      },
      {
        title: "巴斯克與阿斯圖里亞斯美食巡禮",
        description:
          "途經以 Pintxos（巴斯克風味小點）聞名的聖塞巴斯提安（San Sebastián）及畢爾包（Bilbao），並可在坎塔布里亞與阿斯圖里亞斯品嚐當地海鮮、乳酪及特色天然蘋果酒（Sidra），感受西班牙北部多元的地方飲食文化。",
      },
      {
        title: "穿越海灣與河口的水上接駁",
        description:
          "沿途部分路段可體驗特色水上交通，例如 Pasaia 兩岸之間的小型渡船，以及 Somo 前往桑坦德（Santander）的渡船。此外，部分路線變體會經過世界遺產比斯開橋（Puente Bizkaia），讓徒步旅程增添不同的交通體驗。這些交通方式會依實際路線選擇而有所不同，出發前應確認營運時間。",
      },
    ],
    pitfallWarnings: [
      "北方之路部分路段需要長時間行走於柏油路及硬質鋪裝路面，尤其經過城鎮及道路連接路段時，容易累積足部與膝蓋疲勞。建議穿著已充分適應、支撐性與緩震性良好的健行鞋，並適時休息及調整每日步行距離。",
      "7～8 月是西班牙北部沿海旅遊旺季，熱門城鎮及床位有限的村莊可能較早客滿。建議提前確認住宿，尤其是行程固定、需要入住特定城鎮時，不宜完全依賴當天臨時找房。",
      "西班牙北部受到大西洋氣候影響，天候變化較大，即使夏季也可能遇到降雨與強風。建議攜帶輕量防水透氣外套、背包防水套及適合濕冷天候的裝備。",
    ],
    recommendedStartGuide: {
      hubCity: "馬德里 / 聖塞巴斯提安 / 畢爾包",
      transferTips:
        "可從馬德里搭乘 Renfe 列車前往 Irún，實際車程與是否需要轉乘依當日班次而異；也可飛抵畢爾包機場，再前往 Bilbao Intermodal 巴士總站查詢前往 Irún 的 ALSA 班次，或先抵達聖塞巴斯提安再轉乘區域交通。建議預留轉乘時間，並於出發前確認最新交通時刻表。",
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
