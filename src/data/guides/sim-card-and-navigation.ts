import type { GuideArticle } from "./types";

export const simCardAndNavigationGuide: GuideArticle = {
  slug: "sim-card-and-navigation",
  category: "gear-budget",
  title: "朝聖之路網路 eSIM、離線地圖與指標辨識",
  titleEn: "Connectivity & Navigation: eSIMs, Offline Maps & Trail Markers",
  subtitle: "手機用 eSIM 還是去西班牙買實體 SIM 卡？山區沒訊號怎麼用離線地圖導航，以及怎麼看懂黃色箭頭與扇貝殼的方向。",
  subtitleEn:
    "eSIM vs. local SIM cards in Spain and Portugal, the best offline map apps when signal drops, and how to read yellow arrows and scallop shells.",
  seoDescription:
    "朝聖之路通訊與導航指南：比較歐洲跨國 eSIM 與西班牙實體 SIM 卡（Orange / Vodafone / Movistar）、推薦離線地圖 App，以及常見路標分叉判讀方式。",
  seoDescriptionEn:
    "Stay connected and on-trail on the Camino: comparing travel eSIMs vs. local Spanish SIMs, offline GPS map apps, and reading trail markers.",
  keywords: "朝聖之路網路, 西班牙eSIM, 朝聖之路離線地圖, 黃色箭頭方向, 扇貝殼指標",
  keywordsEn: "Camino eSIM, Spain SIM card Camino, Camino offline maps, yellow arrows Camino",
  readingMinutes: 5,
  updatedAt: "2026-11-25",
  sections: [
    {
      heading: "eSIM 還是實體 SIM 卡？跨法國、西班牙、葡萄牙怎麼選",
      headingEn: "eSIM vs. Local SIM Card Across France, Spain, and Portugal",
      paragraphs: [
        "走法國之路（Camino Francés）時，許多人會先飛往巴黎，再搭火車前往法國邊境的聖讓皮耶德波爾（Saint-Jean-Pied-de-Port，SJPP），之後進入西班牙；走葡萄牙之路（Camino Portugués）則通常從葡萄牙出發，再進入西班牙。法國、西班牙與葡萄牙都屬於歐盟漫遊區（EU Roaming），但要注意，歐盟的「如在家漫遊」（Roam Like at Home）制度主要適用於符合資格的歐盟及歐洲經濟區電信方案，並非所有台灣門號或旅遊型 eSIM 都能免費跨國使用。購買前務必確認方案是否涵蓋這三個國家，以及跨國使用的流量限制。",
        "如果手機支援 eSIM，出發前先購買涵蓋法國、西班牙與葡萄牙的歐洲多國數據方案，是相當方便的選擇。抵達後即可使用行動數據導航、查詢交通或聯絡住宿，也能保留原本的台灣 SIM 卡接收銀行簡訊。若需要當地電話號碼，或偏好使用當地電信方案，也可以在巴黎、馬德里、巴塞隆納或波多等城市的 Orange、Vodafone、Movistar 門市購買預付卡。部分入門方案約 €10–20，但實際價格、流量、通話額度及歐盟漫遊範圍會依國家與方案而異，購買時應確認是否包含跨國漫遊及可使用的漫遊流量。",
      ],
      paragraphsEn: [
        "Many pilgrims walking the French Way (Camino Francés) fly into Paris before travelling by train to Saint-Jean-Pied-de-Port (SJPP), near the French-Spanish border, and then continue into Spain. The Portuguese Way (Camino Portugués), meanwhile, typically starts in Portugal and crosses into Spain. France, Spain, and Portugal are all part of the EU roaming area, but the EU's 'Roam Like at Home' rules mainly apply to eligible EU and EEA mobile plans. They do not automatically cover Taiwanese SIM cards or every travel eSIM. Before purchasing a plan, check that all three countries are included and review any roaming data limits.",
        "If your phone supports eSIM, purchasing a multi-country European data plan before departure is a convenient option. You can use mobile data for navigation, transport information, and contacting accommodation as soon as you arrive, while keeping your Taiwanese SIM active for bank verification messages. If you need a local phone number or prefer a local prepaid plan, you can also visit Orange, Vodafone, or Movistar stores in cities such as Paris, Madrid, Barcelona, or Porto. Some entry-level prepaid plans cost around €10–20, but prices, data allowances, call minutes, and EU roaming limits vary by country and plan. Always check the included roaming coverage before purchasing.",
      ],
    },
    {
      heading: "為什麼還是要裝離線地圖 App？",
      headingEn: "Why You Still Need an Offline Map App",
      paragraphs: [
        "雖然大部分城鎮的行動網路訊號良好，但在庇里牛斯山區、加利西亞部分森林路段及偏遠鄉間，仍可能遇到訊號不穩或完全沒有網路的情況。若完全依賴線上 Google Maps，不僅可能因訊號中斷而無法順利查看地圖，也可能因為路線資料不同而無法準確呈現朝聖步道。因此，出發前先下載離線地圖及 GPX 軌跡，是相當重要的準備。",
        "離線地圖可以考慮使用 **Organic Maps**，它以 OpenStreetMap 資料為基礎，支援離線地圖、徒步路線、等高線、海拔資訊，以及 GPX 軌跡匯入與檢視。地圖也包含水源、避難設施等戶外資訊，但這些地點的完整性與正確性取決於地圖資料，不能保證所有補水點或廁所都有標示。**Maps.me** 也可以作為另一種離線地圖選擇，但建議出發前先確認所需地區的地圖及功能是否符合需求。",
        "另外，可以搭配專為朝聖者設計的 **Buen Camino** 或 **Camino Ninja** App，查詢路線分段、每日距離、住宿位置及沿途服務設施。部分功能及地圖可供離線使用，但住宿資訊、營業狀態及路線異動不一定即時更新，重要資訊仍建議事先確認，並將當天路線及住宿資料下載或截圖備用。",
      ],
      paragraphsEn: [
        "Mobile coverage is generally good in towns, but you may still encounter weak or nonexistent signals in the Pyrenees, parts of Galicia's forests, and remote rural areas. Relying entirely on online Google Maps can leave you without access to maps when the connection drops. Google Maps may also fail to show the Camino trail accurately because its routing data does not always match the designated pilgrimage paths. Downloading offline maps and GPX tracks before departure is therefore an important part of your preparation.",
        "For offline navigation, consider **Organic Maps**, which uses OpenStreetMap data and supports offline maps, hiking trails, contour lines, elevation information, and GPX track imports. Its outdoor map style also displays features such as water sources and shelters, although the completeness and accuracy of these locations depend on the underlying map data. Not every fountain or public restroom will necessarily be listed. **Maps.me** is another offline mapping option, but check that its available maps and features meet your needs before departure.",
        "You can also use Camino-specific apps such as **Buen Camino** or **Camino Ninja** to check route stages, daily distances, accommodation locations, and services along the way. Some maps and features are available offline, but accommodation details, opening status, and route updates may not always be current. Confirm important information in advance and save your daily route and accommodation details for offline access.",
      ],
    },
    {
      heading: "黃色箭頭與扇貝殼怎麼看才不會走錯？",
      headingEn: "How to Read Yellow Arrows and Scallop Shell Markers",
      paragraphs: [
        "沿途最常見、也最值得信賴的方向指標是黃色箭頭（Flecha Amarilla），常見於牆壁、電線桿、路面、石頭及路標上。只要沿著箭頭尖端指示的方向前進，通常就能找到正確路線。另外，也會看到藍底黃色扇貝殼標誌，它是聖雅各朝聖之路的重要識別符號，常出現在路牌、石柱、建築物及地面上。",
        "要特別留意的是：**扇貝殼主要是朝聖之路的識別標誌，不應單靠放射狀線條判斷行走方向。**不同地區的標誌設計與擺放方式可能不同，有些會搭配黃色箭頭或其他明確的方向指示，有些則只有扇貝殼圖案。遇到岔路或方向不明時，應優先尋找黃色箭頭、具有明確方向的路標，並搭配離線地圖確認，不要只憑扇貝殼的線條猜測方向。",
        "進出 Pamplona、Burgos、León 等大城市時，街道較複雜，部分路標也可能受到車輛、建築物或店面遮擋，因此容易錯過轉彎處。沿途可能會看到嵌在地面上的銅製扇貝殼或其他城市導引標誌，但各城市的設置方式不盡相同。進出市區時建議特別留意路標，必要時打開離線地圖確認方向，避免走錯路後再折返。",
      ],
      paragraphsEn: [
        "The most useful and reliable directional markers along the Camino are the yellow arrows (flechas amarillas), commonly painted on walls, lampposts, pavements, stones, and signposts. Follow the direction indicated by the arrowhead to stay on the route. You will also encounter blue signs featuring yellow scallop shells, one of the most recognizable symbols of the Way of St. James. These appear on signposts, stone markers, buildings, and pavements.",
        "One important point: **the scallop shell is primarily a symbol identifying the Camino, not a direction indicator that should be interpreted by its radiating lines alone.** Sign designs and placements vary between regions. Some markers include a yellow arrow or another clear directional indicator, while others display only the shell symbol. At junctions or confusing sections, look for yellow arrows and clearly directional signposts, and check your offline map rather than guessing from the shell's shape.",
        "Entering and leaving major cities such as Pamplona, Burgos, and León requires extra attention. Streets are more complex, and signs may be obscured by traffic, buildings, or shopfronts, making it easier to miss a turn. You may encounter bronze scallop-shell markers embedded in pavements or other local wayfinding signs, but their placement and design vary between cities. Keep an eye out for route markers and consult your offline map when necessary to avoid taking a wrong turn.",
      ],
    },
    {
      heading: "每天早上出發前的 3 個手機設定",
      headingEn: "3 Quick Phone Habits Before Leaving Each Morning",
      paragraphs: [
        "1. 確認手機已充飽電，並將行動電源放在背包頂袋或容易拿取的位置。建議攜帶約 10,000 mAh 的行動電源，實際所需容量可依手機電池大小、每日導航時間及個人使用習慣調整。",
        "2. 在訊號微弱且不需要接聽電話或接收即時訊息的路段，可以考慮開啟飛航模式，減少手機持續搜尋基地台造成的耗電；若仍需要通訊，則可改用低耗電模式。使用飛航模式時，請確認手機的定位服務仍然開啟，並事先下載好離線地圖，才能繼續使用 GPS 定位。",
        "3. 出發前先將當天預計入住的庇護所地址、電話、訂房確認編號及入住資訊截圖，儲存在手機相簿或離線資料夾中。即使抵達時沒有網路，或住宿地點的 Wi-Fi 尚未連線，也能立即查閱所需資訊。",
      ],
      paragraphsEn: [
        "1. Start each day with a fully charged phone and keep your power bank somewhere easy to reach, such as the top pocket of your backpack. A 10,000 mAh power bank is a practical starting point, although the capacity you need depends on your phone's battery, daily navigation time, and usage habits.",
        "2. On sections with weak mobile coverage where you do not need calls or incoming messages, consider switching to airplane mode to reduce battery drain caused by continuous network searching. If you still need to stay connected, use low-power mode instead. When using airplane mode, make sure location services remain enabled and your offline maps have already been downloaded so GPS positioning can continue to work.",
        "3. Before setting off, save screenshots of your evening albergue's address, phone number, booking reference, and check-in instructions. Keep them in your photo gallery or an offline folder so you can access the information even without mobile data or Wi-Fi.",
      ],
    },
  ],
  pitfallTitle: "通訊與找路常遇到的 3 個問題",
  pitfallTitleEn: "3 Common Connectivity & Navigation Pitfalls",
  pitfallPoints: [
    "購買了只有數據功能、沒有一般語音通話功能的 eSIM，臨時需要打電話預訂私立庇護所或聯絡計程車時才發現無法直接撥號。出發前應確認 eSIM 是否包含語音通話及當地電話號碼，也可以事先確認住宿方是否提供 WhatsApp、電子郵件或其他線上聯絡方式。",
    "太依賴 Google Maps 導航：Google Maps 並非專為朝聖步道設計，部分鄉間路段可能無法完整呈現官方朝聖路線，甚至可能建議走一般道路。應以沿途黃色箭頭及朝聖專用 App 的路線資訊為主要參考，Google Maps 則作為查詢城鎮位置及一般交通資訊的輔助工具。",
    "進出大城市時沒有留意路標：市區街道複雜，扇貝殼標誌也不一定具有方向指示功能。遇到分叉路或不確定方向時，先停下來查看黃色箭頭及離線地圖，比走錯路後再花時間折返更有效率。",
  ],
  pitfallPointsEn: [
    "Buying a data-only eSIM without realizing that it cannot make regular voice calls. If you suddenly need to call a private albergue or arrange a taxi, you may not be able to dial a local number. Before departure, check whether your eSIM includes voice calls and a local phone number. You can also confirm whether your accommodation accepts WhatsApp, email, or other online contact methods.",
    "Relying too heavily on Google Maps: Google Maps is not specifically designed for Camino trails, and some rural sections may not accurately display the designated pilgrimage route. It may suggest ordinary roads instead. Use yellow arrows and Camino-specific apps as your primary navigation references, while keeping Google Maps as a supplementary tool for finding towns and checking general transport information.",
    "Missing route markers when entering or leaving major cities: Urban streets can be confusing, and scallop-shell symbols do not always indicate a direction. When you reach a junction or feel unsure about the route, stop and check the yellow arrows and your offline map. A quick check is much easier than backtracking after taking a wrong turn.",
  ],
  relatedTool: {
    path: "/transport/frances",
    label: "查看起點交通與接駁方式",
    labelEn: "Check Trailhead Transit Guides",
    description:
      "出發前先確認各地火車、巴士與機場接駁資訊，並將訂票紀錄、站點位置及重要交通資訊儲存為離線截圖，方便途中查閱。",
    descriptionEn:
      "Review rail, bus, and airport transfer information before departure, and save booking confirmations, station locations, and essential transport details for offline access.",
  },
};
