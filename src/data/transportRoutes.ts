import type { TransportRoute } from "@/types/camino";

export const transportRoutes: TransportRoute[] = [
  // =========================================================================
  // --- 1. 法國之路起點：聖讓皮耶德波爾 (SJPP - Saint-Jean-Pied-de-Port) ---
  // =========================================================================
  {
    id: "ROUTE_FRANCES_PARIS",
    targetRoute: "frances",
    destinationName: "聖讓皮耶德波爾 (SJPP)",
    originCity: "PARIS",
    title: "巴黎出發：TGV 高鐵 + TER 區域列車",
    totalDurationHours: 7.5,
    totalCostEur: { min: 65, max: 150 },
    operatingMonths: "全年可搭乘，實際班次依日期及鐵路營運狀況而異",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "RER B + 巴黎地鐵",
        from: "巴黎戴高樂機場 (CDG) / 巴黎市區",
        to: "巴黎蒙帕納斯車站 (Paris Montparnasse)",
        durationMinutes: 60,
        estimatedCostEur: { min: 0, max: 15 },
        warningTip:
          "若從 CDG 機場出發，可搭乘 RER B 再轉乘巴黎地鐵前往蒙帕納斯；若已在巴黎市區，則依所在位置選擇交通方式。實際時間會受到出發地、轉乘及交通狀況影響，建議預留充足時間，並至少於 TGV 發車前 30 分鐘抵達車站。",
      },
      {
        stepOrder: 2,
        type: "TRAIN",
        carrierName: "SNCF TGV INOUI / OUIGO",
        from: "巴黎蒙帕納斯 (Paris Montparnasse)",
        to: "巴約訥 (Bayonne)",
        durationMinutes: 240,
        estimatedCostEur: { min: 35, max: 120 },
        bookingUrl: "https://www.sncf-connect.com/",
        warningTip:
          "巴黎至 Bayonne 的直達高速列車車程約 4 小時，實際時間及票價依班次、日期與購票時間而異。TGV INOUI 及 OUIGO 均應事先確認座位與行李規定，建議提早購票，但實際開賣時間及優惠票數量依 SNCF 公告為準。",
      },
      {
        stepOrder: 3,
        type: "TRAIN",
        carrierName: "SNCF TER Nouvelle-Aquitaine",
        from: "巴約訥 (Bayonne)",
        to: "聖讓皮耶德波爾 (Saint-Jean-Pied-de-Port)",
        durationMinutes: 65,
        estimatedCostEur: { min: 11, max: 15 },
        bookingUrl: "https://www.sncf-connect.com/",
        warningTip:
          "Bayonne 車站可轉乘 TER 前往 SJPP，車程約 1 小時。請事先確認 TGV 抵達時間與 TER 發車時間，預留足夠轉乘時間。若遇鐵路工程或營運異動，部分班次可能改由接駁巴士（Autocar）代替，應以 SNCF 當日公告為準。",
      },
    ],
  },
  {
    id: "ROUTE_FRANCES_MADRID",
    targetRoute: "frances",
    destinationName: "聖讓皮耶德波爾 (SJPP)",
    originCity: "MADRID",
    title: "馬德里出發：Renfe 國鐵 + 季節性直達巴士",
    totalDurationHours: 6.5,
    totalCostEur: { min: 50, max: 120 },
    operatingMonths: "Pamplona 至 SJPP 直達巴士約 3月至10月營運，實際日期及班次須事先確認",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "Renfe Alvia",
        from: "馬德里阿托查車站 (Madrid Puerta de Atocha)",
        to: "潘普洛納 (Pamplona)",
        durationMinutes: 190,
        estimatedCostEur: { min: 25, max: 75 },
        bookingUrl: "https://www.renfe.com/",
        warningTip:
          "搭乘 Renfe 長途列車前往 Pamplona，實際車程、出發車站及票價依日期與班次而異。若從馬德里機場 (MAD) 出發，須先安排機場至 Atocha 車站的交通；符合 Renfe 規定的長途車票可能包含 Combinado Cercanías 市郊列車轉乘優惠，使用前應確認票券資格及適用路線。",
      },
      {
        stepOrder: 2,
        type: "BUS",
        carrierName: "ALSA 季節性直達巴士",
        from: "潘普洛納巴士總站 (Pamplona Estación de Autobuses)",
        to: "聖讓皮耶德波爾 (Saint-Jean-Pied-de-Port)",
        durationMinutes: 105,
        estimatedCostEur: { min: 18, max: 25 },
        bookingUrl: "https://www.alsa.es/",
        warningTip:
          "依潘普洛納市政府旅遊資訊，Pamplona 至 SJPP 直達巴士約於 3月至10月營運，每日通常有 12:00 班次，車程約 1 小時 45 分鐘，公布票價約 €22。11/1 至 3/15 停駛，其他日期也應先確認當年度班表。若沒有直達班次，可考慮搭車至 Roncesvalles 再安排計程車，或預約 Pamplona 至 SJPP 的計程車。",
      },
    ],
  },
  {
    id: "ROUTE_FRANCES_BARCELONA",
    targetRoute: "frances",
    destinationName: "聖讓皮耶德波爾 (SJPP)",
    originCity: "BARCELONA",
    title: "巴塞隆納出發：Renfe 國鐵 + 季節性直達巴士",
    totalDurationHours: 7.5,
    totalCostEur: { min: 60, max: 130 },
    operatingMonths: "Pamplona 至 SJPP 直達巴士約 3月至10月營運，實際日期及班次須事先確認",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "Renfe 長途列車",
        from: "巴塞隆納桑斯車站 (Barcelona Sants)",
        to: "潘普洛納 (Pamplona)",
        durationMinutes: 240,
        estimatedCostEur: { min: 35, max: 85 },
        bookingUrl: "https://www.renfe.com/",
        warningTip:
          "Barcelona Sants 至 Pamplona 可搭乘 Renfe 長途列車，實際車程、班次及票價依日期而異。建議先查詢列車抵達時間，再確認能否銜接 Pamplona 至 SJPP 的季節性直達巴士，避免因轉乘時間不足而錯過當日班次。",
      },
      {
        stepOrder: 2,
        type: "BUS",
        carrierName: "ALSA 季節性直達巴士",
        from: "潘普洛納巴士總站 (Pamplona Estación de Autobuses)",
        to: "聖讓皮耶德波爾 (Saint-Jean-Pied-de-Port)",
        durationMinutes: 105,
        estimatedCostEur: { min: 18, max: 25 },
        bookingUrl: "https://www.alsa.es/",
        warningTip:
          "Pamplona 至 SJPP 直達巴士約於 3月至10月營運，通常為每日中午班次，車程約 1 小時 45 分鐘。巴塞隆納出發的火車不一定能順利銜接，請以出發日期的 Renfe 與 ALSA 班表確認。若無法銜接，可考慮在 Pamplona 過夜，或事先安排計程車前往 SJPP。",
      },
    ],
  },

  // =========================================================================
  // --- 2. 葡萄牙之路起點：波多 (Porto - Sé do Porto 大教堂) ---
  // =========================================================================
  {
    id: "ROUTE_PORTUGUES_PORTO_AIRPORT",
    targetRoute: "portugues",
    destinationName: "波多主教座堂 (Porto)",
    originCity: "PORTO_AIRPORT",
    title: "波多機場出發：地鐵 E 線（紫線）直達 Trindade",
    totalDurationHours: 0.75,
    totalCostEur: { min: 2.3, max: 2.8 },
    operatingMonths: "全年營運（班距約 20～30 分鐘，依時段及日期而異）",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "Metro do Porto（波多地鐵 E 線／紫線）",
        from: "波多機場 (Aeroporto Francisco Sá Carneiro - OPO)",
        to: "特林達德站 (Trindade)",
        durationMinutes: 28,
        estimatedCostEur: { min: 2.3, max: 2.8 },
        bookingUrl: "https://en.metrodoporto.pt/",
        warningTip:
          "機場航廈外設有地鐵站，可搭乘 E 線前往市中心 Trindade 站，車程約 27～30 分鐘。2026 年 Andante Z4 單程票價為 €2.30，若購買 Andante 藍卡，另需支付 €0.50 卡片費；部分指定車站亦支援感應式信用卡付款。進站前務必確認票券有效區域，並於黃色感應機完成驗票。地鐵班距約 20～30 分鐘，請依實際時刻表安排。",
      },
      {
        stepOrder: 2,
        type: "WALK",
        carrierName: "徒步前往波多主教座堂",
        from: "特林達德站 (Trindade)",
        to: "波多主教座堂 (Sé do Porto)",
        durationMinutes: 15,
        estimatedCostEur: { min: 0, max: 0 },
        warningTip:
          "E 線並不直接停靠 São Bento 車站，從 Trindade 下車後可步行前往波多主教座堂，約需 15 分鐘，沿途部分路段有坡度及石板路。波多主教座堂是葡萄牙中央之路常見的出發地點之一，可向主教座堂或朝聖者資訊窗口詢問朝聖憑證（Credencial）的領取方式及蓋章服務。",
      },
    ],
  },
  {
    id: "ROUTE_PORTUGUES_LISBON",
    targetRoute: "portugues",
    destinationName: "波多主教座堂 (Porto)",
    originCity: "LISBON",
    title: "里斯本出發：CP 國鐵 Alfa Pendular / Intercidades 北上",
    totalDurationHours: 3.5,
    totalCostEur: { min: 16.9, max: 47.3 },
    operatingMonths: "全年營運（實際班次及票價依日期查詢）",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "里斯本地鐵紅線 (Linha Vermelha)",
        from: "里斯本機場 (Aeroporto - LIS)",
        to: "東方車站 (Lisboa Oriente)",
        durationMinutes: 6,
        estimatedCostEur: { min: 1.92, max: 2.3 },
        warningTip:
          "從里斯本機場可直接搭乘紅線前往 Oriente 車站，官方路線資訊顯示車程約 6 分鐘。可使用感應式信用卡或手機付款，也可依需求購買地鐵票。若從里斯本市區其他地點出發，請依實際位置重新規劃前往 Oriente 的交通時間。",
      },
      {
        stepOrder: 2,
        type: "TRAIN",
        carrierName: "CP Alfa Pendular (AP) / Intercidades (IC)",
        from: "東方車站 (Lisboa Oriente)",
        to: "波多坎帕尼亞車站 (Porto Campanhã)",
        durationMinutes: 175,
        estimatedCostEur: { min: 15, max: 45 },
        bookingUrl: "https://www.cp.pt/",
        warningTip:
          "搭乘葡萄牙國鐵 CP 的 Alfa Pendular 或 Intercidades 前往 Porto Campanhã，車程約 2 小時 50 分鐘至 3 小時，依車種及班次而異。CP 提供 Promo 早鳥優惠，通常可於出發前最多 60 天購票，提前購買可能享有最高 65% 折扣，但優惠座位有限，實際折扣及票價依班次與剩餘座位而異。建議事先於 CP 官網查詢及購票。",
      },
      {
        stepOrder: 3,
        type: "TRAIN",
        carrierName: "CP Urbanos 波多市區通勤鐵路",
        from: "波多坎帕尼亞車站 (Porto Campanhã)",
        to: "聖本篤車站 (São Bento)",
        durationMinutes: 5,
        estimatedCostEur: { min: 0, max: 0 },
        warningTip:
          "若購買的 CP 長途車票目的地為 Porto Campanhã 或符合 CP 規定的相關車站，可免費搭乘波多市區通勤列車前往 São Bento，無須另外購票。購票時可確認車票目的地是否包含此轉乘資格，並依車站指示尋找 CP Urbanos 月台。",
      },
      {
        stepOrder: 4,
        type: "WALK",
        carrierName: "徒步前往波多主教座堂",
        from: "聖本篤車站 (São Bento)",
        to: "波多主教座堂 (Sé do Porto)",
        durationMinutes: 8,
        estimatedCostEur: { min: 0, max: 0 },
        warningTip:
          "從 São Bento 車站步行前往波多主教座堂約需 8～10 分鐘，沿途有坡道及石板路。若攜帶大型背包或行李，建議預留較充裕的步行時間。",
      },
    ],
  },
  {
    id: "ROUTE_PORTUGUES_MADRID",
    targetRoute: "portugues",
    destinationName: "波多主教座堂 (Porto)",
    originCity: "MADRID",
    title: "馬德里出發：直飛波多 + 機場地鐵接駁",
    totalDurationHours: 2.0,
    totalCostEur: { min: 27.3, max: 72.8 },
    operatingMonths: "全年可查詢直飛航班，實際航班日期及班次依航空公司公告",
    steps: [
      {
        stepOrder: 1,
        type: "FLIGHT",
        carrierName: "Iberia / Ryanair / Air Europa",
        from: "馬德里巴拉哈斯機場 (MAD)",
        to: "波多機場 (OPO)",
        durationMinutes: 80,
        estimatedCostEur: { min: 25, max: 70 },
        warningTip:
          "馬德里至波多有直飛航班，飛行時間約 1 小時 15 分鐘至 1 小時 25 分鐘，實際航空公司、航班日期及票價依訂位系統查詢。若搭乘廉價航空，請留意手提行李及托運行李規定。葡萄牙時間比西班牙本土時間慢 1 小時，安排接駁及住宿時間時應注意時差。若不搭飛機，也可考慮 ALSA 長途巴士，最快班次約需 6 小時 29 分鐘，實際車程依班次而異。",
      },
      {
        stepOrder: 2,
        type: "TRAIN",
        carrierName: "Metro do Porto（波多地鐵 E 線／紫線）",
        from: "波多機場 (OPO)",
        to: "特林達德站 (Trindade)",
        durationMinutes: 28,
        estimatedCostEur: { min: 2.3, max: 2.8 },
        bookingUrl: "https://en.metrodoporto.pt/",
        warningTip:
          "抵達波多機場後，可直接搭乘地鐵 E 線前往 Trindade 站，車程約 27～30 分鐘。2026 年 Andante Z4 單程票價為 €2.30，若購買 Andante 藍卡，另需支付 €0.50 卡片費；部分指定車站亦支援感應式信用卡付款。E 線不會直接停靠 São Bento，抵達 Trindade 後須再步行或轉乘其他交通工具前往波多主教座堂。",
      },
      {
        stepOrder: 3,
        type: "WALK",
        carrierName: "徒步前往波多主教座堂",
        from: "特林達德站 (Trindade)",
        to: "波多主教座堂 (Sé do Porto)",
        durationMinutes: 15,
        estimatedCostEur: { min: 0, max: 0 },
        warningTip:
          "從 Trindade 步行前往波多主教座堂約需 15 分鐘，部分路段有坡度及石板路。若攜帶大型背包或行李，請預留額外步行時間。",
      },
    ],
  },

  // =========================================================================
  // --- 3. 北方之路起點：伊倫 (Irún / Hendaye 法西邊境) ---
  // =========================================================================
  {
    id: "ROUTE_NORTE_PARIS",
    targetRoute: "norte",
    destinationName: "伊倫 (Irún)",
    originCity: "PARIS",
    title: "巴黎出發：TGV 前往 Hendaye + Euskotren 跨境接駁至 Irún",
    totalDurationHours: 5.5,
    totalCostEur: { min: 45, max: 130 },
    operatingMonths: "全年營運，實際班次依日期而異",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "SNCF TGV INOUI / OUIGO",
        from: "巴黎蒙帕納斯 (Paris Montparnasse)",
        to: "昂達伊站 (Hendaye)",
        durationMinutes: 300,
        estimatedCostEur: { min: 39, max: 120 },
        bookingUrl: "https://www.sncf-connect.com/",
        warningTip:
          "巴黎至 Hendaye 有直達高速列車，最快約 4 小時 37 分鐘，實際車程依班次而異，部分車次可能需要轉車。建議提早查詢並預訂，票價會隨出發日期及剩餘座位變動。",
      },
      {
        stepOrder: 2,
        type: "TRAIN",
        carrierName: "Euskotren Topo（E2 線）",
        from: "昂達伊站前廣場 (Hendaye Euskotren)",
        to: "伊倫 (Irún，依班次選擇 Ficoba 或其他適合站點)",
        durationMinutes: 5,
        estimatedCostEur: { min: 1.9, max: 2.9 },
        bookingUrl: "https://www.euskotren.eus/",
        warningTip:
          "Euskotren 車站位於 Hendaye SNCF 國鐵站旁，可搭乘 E2 線跨越法西邊境進入西班牙 Irún。請先確認下車站點與住宿或起點的距離；車票可於車站售票機或售票處購買，無須預約。實際班距及票價請以 Euskotren 當日資訊為準。",
      },
    ],
  },
  {
    id: "ROUTE_NORTE_MADRID",
    targetRoute: "norte",
    destinationName: "伊倫 (Irún)",
    originCity: "MADRID",
    title: "馬德里出發：Renfe Alvia / Intercity 直達 Irún",
    totalDurationHours: 6.5,
    totalCostEur: { min: 28, max: 100 },
    operatingMonths: "全年營運，實際班次依日期而異",
    steps: [
      {
        stepOrder: 1,
        type: "TRAIN",
        carrierName: "Renfe Cercanías C1",
        from: "馬德里巴拉哈斯機場 T4 (MAD) / 馬德里市區",
        to: "馬德里查馬丁車站 (Madrid Chamartín)",
        durationMinutes: 20,
        estimatedCostEur: { min: 2.6, max: 2.6 },
        warningTip:
          "若從機場出發，可由 T4 搭乘 Cercanías C1 前往 Chamartín；其他航廈須先確認前往 T4 的接駁方式。部分符合資格的 Renfe 長途車票附有 Combinado Cercanías，可憑票面資訊換取免費區間車票；並非所有長途車票都適用，購票時請確認票種及使用條件。",
      },
      {
        stepOrder: 2,
        type: "TRAIN",
        carrierName: "Renfe Alvia / Intercity",
        from: "馬德里查馬丁車站 (Madrid Chamartín)",
        to: "伊倫車站 (Estación de Irún)",
        durationMinutes: 360,
        estimatedCostEur: { min: 25, max: 100 },
        bookingUrl: "https://www.renfe.com/",
        warningTip:
          "馬德里 Chamartín 有直達 Irún 的長途列車，包含 Alvia 或 Intercity 等車種；車程依班次約 5 小時 40 分至 6 小時以上，並非每天都有相同班次。建議直接以出發日期查詢 Renfe 時刻表及票價。若選擇 ALSA 長途巴士，請另外確認出發車站、轉乘安排及抵達時間。",
      },
    ],
  },
  {
    id: "ROUTE_NORTE_SAN_SEBASTIAN",
    targetRoute: "norte",
    destinationName: "伊倫 (Irún)",
    originCity: "SAN_SEBASTIAN_AIRPORT",
    title: "聖塞巴斯提安機場出發：Lurraldebus 巴士前往 Irún",
    totalDurationHours: 0.5,
    totalCostEur: { min: 2.5, max: 5 },
    operatingMonths: "依巴士路線及日期營運，出發前請確認班表",
    steps: [
      {
        stepOrder: 1,
        type: "BUS",
        carrierName: "Lurraldebus / Ekialdebus",
        from: "聖塞巴斯提安機場 (EAS)",
        to: "伊倫 (Irún)",
        durationMinutes: 20,
        estimatedCostEur: { min: 2.5, max: 5 },
        bookingUrl: "https://www.lurraldebus.eus/",
        warningTip:
          "聖塞巴斯提安機場位於 Hondarribia，距離 Irún 很近。可查詢 Lurraldebus / Ekialdebus 往返機場、Hondarribia 與 Irún 的路線，但班次、停靠站及營運日期可能調整，不能假設 E20 或 E21 每天都有直達班次。請依抵達日期確認最新路線與時刻表。",
      },
      {
        stepOrder: 2,
        type: "WALK",
        carrierName: "徒步前往朝聖者庇護所",
        from: "伊倫市區巴士站 (Irún)",
        to: "伊倫朝聖者庇護所 (Albergue de Peregrinos de Irún)",
        durationMinutes: 10,
        estimatedCostEur: { min: 0, max: 0 },
        warningTip:
          "Jakobi 朝聖者協會公布的庇護所地址為 Calle Lesaka 1，並非 Lucas de Berroa 18。開放期間為 2 月 1 日至 11 月 30 日，接待時間為 16:00–22:00，僅接待朝聖者且不接受預約。抵達前請再次確認當年度開放資訊及巴士下車站點。",
      },
    ],
  },
];
