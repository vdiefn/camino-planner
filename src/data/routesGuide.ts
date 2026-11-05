/**
 * 朝聖路線攻略與關鍵指標資料庫
 * 嚴格對齊目前排程系統收錄之路線（法國之路、葡萄牙之路、北方之路，以及世界盡頭延伸線）
 */

import type { RouteId } from '@/types/route'

export interface RouteGuideItem {
  id: RouteId
  name: string
  spanishName: string
  startTown: string
  startTownCountry: string
  totalDistanceKm: number
  recommendedDays: string
  dailyDistanceAvgKm: string
  difficulty: '適中' | '容易' | '挑戰' | '極高挑戰'
  difficultyStars: number // 1 ~ 5
  landscapeType: string
  pavementRatio: {
    trail: number // 泥土/碎石山徑 %
    boardwalkOrCobble: number // 木棧道/石板路 %
    asphalt: number // 柏油硬路 %
  }
  bestMonths: string
  badge?: string
  targetAudience: string
  summary: string
  keyFeatures: {
    title: string
    description: string
  }[]
  pitfallWarnings: string[]
  recommendedStartGuide: {
    hubCity: string
    transferTips: string
  }
}

export const ROUTES_GUIDE_LIST: RouteGuideItem[] = [
  {
    id: 'frances',
    name: '法國之路',
    spanishName: 'Camino Francés',
    startTown: '聖讓皮耶德波爾 (SJPP)',
    startTownCountry: '法國',
    totalDistanceKm: 779,
    recommendedDays: '33 ～ 35 天',
    dailyDistanceAvgKm: '約 22 ～ 26 km',
    difficulty: '適中',
    difficultyStars: 3,
    landscapeType: '高山森林、拉里奧哈葡萄園、梅塞塔麥田高原、加利西亞丘陵',
    pavementRatio: {
      trail: 65,
      boardwalkOrCobble: 15,
      asphalt: 20,
    },
    bestMonths: '5 月 ～ 6 月、9 月 ～ 10 月（避開 7-8 月高原酷暑與 12-2 月高山積雪）',
    badge: '歷史經典・首走首選',
    targetAudience: '第一次踏上朝聖之路、喜愛豐富社交氛圍、時間充裕（約 5 週）的徒步者。',
    summary:
      '法國之路是全球最知名、設施最齊備、文化歷史底蘊最深厚的黃金路線。沿途庇護所密度極高、補給無虞、指標清晰，從翻越庇里牛斯山的震撼到梅塞塔高原的孤寂冥想，是無可取代的人生蛻變之旅。',
    keyFeatures: [
      {
        title: '三大典型地貌層次遞進',
        description:
          '首段庇里牛斯山翻越（爬升 1,250m）、中段梅塞塔高原（超過 200 公里筆直無垠麥田，深度考驗耐力）、尾段加利西亞童話般的尤加利樹林與綠意山巒。',
      },
      {
        title: '全球朝聖者社群的大熔爐',
        description:
          '全球超過 50% 朝聖者選擇的路線。每晚在庇護所的朝聖者晚餐（Menu del Peregrino）與世界各國旅人舉杯交心，社交氛圍最濃烈。',
      },
      {
        title: '彈性極佳的分段節奏',
        description:
          '每隔 3 至 5 公里即有城鎮或小酒館（Bar），隨時可停下歇腳喝咖啡，非常適合初次嘗試長途徒步的人自主配速。若假期有限，亦可自最後 114 公里的薩里亞（Sarria）起步完成 5 天精華段。',
      },
    ],
    pitfallWarnings: [
      '每年 11/1 至隔年 3/31 法國官方強制封閉高空拿破崙越嶺線，冬季務必改走低海拔 Valcarlos 谷道路線以防暴風雪失溫。',
      '梅塞塔高原夏季氣溫常破 38°C 且數十公里毫無遮蔭，請務必清晨 5 點出發，並攜帶至少 2 公升飲水與電解質補給。',
      '最後 100 公里薩里亞（Sarria）開始人潮激增 3 倍，公立庇護所床位較緊張，旺季建議提前規劃入住時間。',
    ],
    recommendedStartGuide: {
      hubCity: '巴黎 / 馬德里 / 巴約訥',
      transferTips:
        '從巴黎搭乘 TGV 高鐵至 Bayonne（約 4 小時），再轉搭 TER 區域鐵路 1 小時直達起點 SJPP 車站。',
    },
  },
  {
    id: 'portugues',
    name: '葡萄牙之路',
    spanishName: 'Camino Portugués',
    startTown: '波多 (Porto)',
    startTownCountry: '葡萄牙',
    totalDistanceKm: 243,
    recommendedDays: '11 ～ 14 天',
    dailyDistanceAvgKm: '約 18 ～ 24 km',
    difficulty: '容易',
    difficultyStars: 2,
    landscapeType: '大西洋海風木棧道、古羅馬石板石橋、綠酒葡萄莊園、加利西亞河灣',
    pavementRatio: {
      trail: 40,
      boardwalkOrCobble: 35,
      asphalt: 25,
    },
    bestMonths: '4 月 ～ 10 月（夏季海風吹拂相對涼爽宜人）',
    badge: '雙線自由切換・平緩親民',
    targetAudience: '休假時間約 2 週、偏好平緩路面、喜愛海洋風光或古老葡萄園的朝聖者。',
    summary:
      '熱門度僅次於法國之路的經典路線。自世界文化遺產波多啟程，徒步者可自由選擇緊鄰大西洋的「海岸線（Senda Litoral / Costa）」或穿越中世紀古鎮的「中央線（Central）」，並於雷東德拉（Redondela）匯合北上。',
    keyFeatures: [
      {
        title: '中央線 vs. 海岸線特色',
        description:
          '中央線（約 243km）途經公雞傳奇之城巴塞盧什（Barcelos）與古羅馬石橋蓬特迪利馬（Ponte de Lima），林道泥徑舒適且庇護所密度高；海岸線（約 271km）則享受大西洋海浪拍打木棧道的開闊與海鮮饗宴。',
      },
      {
        title: '跨越國境的國際渡輪體驗',
        description:
          '海岸線徒步者需在 Caminha 搭乘 Xacobeo 渡輪或計程快艇橫越米尼奧河（Minho River）進入西班牙 A Guarda，享受極具儀式感的跨國渡河體驗。',
      },
      {
        title: '地形平緩、步調悠閒',
        description:
          '除中央線的拉夫拉杜拉山嶺（Alto de Portela）外，全線幾乎無劇烈爬升坡度，對膝蓋負擔極小，是各年齡層皆能輕鬆駕馭的優質入門步道。',
      },
    ],
    pitfallWarnings: [
      '波多出城前 10 公里多為高車流量工業區硬鋪裝路，強烈建議搭乘波多輕軌藍線至 Matosinhos 出站作為海岸線實質起點。',
      '從葡萄牙跨越米尼奧河進入西班牙加利西亞時，務必將手錶調快 1 小時（葡萄牙 UTC+0 ➔ 西班牙 UTC+1），避免錯過庇護所開放登記時間。',
      '葡萄牙傳統小鎮常為高凹凸不平的古石板路（Calçada），雨天容易打滑，建議穿著防滑底鞋款。',
    ],
    recommendedStartGuide: {
      hubCity: '波多國際機場 (OPO)',
      transferTips:
        '抵達波多機場後直接搭乘波多輕軌紫線（Metro E）直達市中心波多主教座堂（中央線起點）或轉藍線直奔海岸線起點。',
    },
  },
  {
    id: 'norte',
    name: '北方之路',
    spanishName: 'Camino del Norte',
    startTown: '伊倫 (Irún)',
    startTownCountry: '西班牙',
    totalDistanceKm: 820,
    recommendedDays: '35 ～ 38 天',
    dailyDistanceAvgKm: '約 22 ～ 27 km',
    difficulty: '極高挑戰',
    difficultyStars: 5,
    landscapeType: '比斯開灣懸崖海岸、巴斯克峻嶺、坎塔布里亞海灘、綠蔭深谷',
    pavementRatio: {
      trail: 45,
      boardwalkOrCobble: 10,
      asphalt: 45,
    },
    bestMonths: '6 月 ～ 9 月（避開北部大西洋沿岸漫長的多雨潮濕季）',
    badge: '山海絕景・終極考驗',
    targetAudience: '體能充沛、有長途登山健行經驗、喜愛壯闊山海景觀與米其林頂級美食的冒險家。',
    summary:
      '自法西邊境伊倫出發，沿著西班牙北海岸一路西行超過 820 公里。鋸齒狀的懸崖爬升、比斯開灣的蔚藍浪花、傳統古渡船接駁，是公認風景最壯麗但也最考驗體力與耐受度的挑戰級路線。',
    keyFeatures: [
      {
        title: '鋸齒狀沿海地勢的體能洗禮',
        description:
          '巴斯克地區每日需頻繁在海平面與海拔三四百公尺的濱海山丘間劇烈起伏，累計總爬升顯著超越法國之路，是鍛鍊心志與腿力的極致試煉。',
      },
      {
        title: '巴斯克與阿斯圖里亞斯美食巡禮',
        description:
          '途經世界美食之都聖塞巴斯提安（San Sebastián）、畢爾包與桑坦德，沿途品嚐頂級西班牙下酒菜（Pintxos）、現烤海鮮與阿斯圖里亞斯天然蘋果酒（Sidra）。',
      },
      {
        title: '穿梭海灣的傳統渡船接駁',
        description:
          '保留了 Pasaia 峽灣小划艇接駁、世界遺產 Portugalete 鐵甲運河吊橋，以及 Somo 直達桑坦德港口的百年客輪航程，徒步歷程多元有趣。',
      },
    ],
    pitfallWarnings: [
      '沿線公路路段（柏油路）比例相對偏高，長距離硬地衝擊容易引發腳掌水泡與足底筋膜炎，務必選用避震良好的健行厚底鞋。',
      '7 至 8 月為西班牙本土度假勝地旺季，沿海城鎮私立旅宿價格高昂且極易滿房，建議提早 1 至 2 天預訂或避開濱海住宿。',
      '西班牙北部天候多變，大西洋海鋒面帶來突發性陣雨頻率高，頂級防風防水風雨衣與背包防水套為強制必備裝備。',
    ],
    recommendedStartGuide: {
      hubCity: '馬德里 / 聖塞巴斯提安 / 畢爾包',
      transferTips:
        '自馬德里搭乘 Renfe 高鐵/長途列車約 5 小時直達 Irún 車站；或飛抵畢爾包機場後轉搭 ALSA 長途巴士直達起點。',
    },
  },
]

/**
 * 世界盡頭延伸線專題（依附於既有路線之延伸段）
 */
export const FINISTERRE_GUIDE = {
  name: '世界盡頭與穆希亞延伸線',
  spanishName: 'Camino de Finisterre y Muxía',
  startTown: '聖地牙哥德孔波斯特拉',
  endTown: '菲尼斯特雷 (Finisterre) / 穆希亞 (Muxía)',
  totalDistanceKm: '約 89 ～ 118 km',
  recommendedDays: '3 ～ 4 天',
  summary:
    '抵達聖地牙哥大教堂並非朝聖旅途的終點。古羅馬人相信加利西亞西岸的菲尼斯特雷燈塔是陸地的極限、太陽沉入大海之處（Finis Terrae，即世界的盡頭）。徒步者走向大海，象徵舊生命的死亡與靈魂的重生。',
  highlights: [
    '菲尼斯特雷燈塔 0.00km 地標：坐在懸崖巨石上靜靜凝望大西洋日落，將朝聖疲憊化為心靈的圓滿。',
    '穆希亞聖殿（Santuario da Virxe da Barca）：矗立於狂暴海浪岩岸之上的聖所，據傳為聖母乘石船現身安慰聖雅各的神聖遺址。',
    '雙重專屬證書：在兩地可分別於市政廳免費申請專屬的《Fisterrana》與《Muxiana》完步證書。',
  ],
}
