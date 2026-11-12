/**
 * 聖雅各朝聖之路歷史淵源與文化資料庫
 */

export interface HistoryChapter {
  id: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  period: string;
  periodEn?: string;
  summary: string;
  summaryEn?: string;
  details: string[];
  detailsEn?: string[];
  quote?: {
    text: string;
    textEn?: string;
    author: string;
    authorEn?: string;
  };
}

export interface CulturalSymbol {
  id: string;
  name: string;
  nameEn?: string;
  spanishName: string;
  meaning: string;
  meaningEn?: string;
  origin: string;
  originEn?: string;
  practicalTip: string;
  practicalTipEn?: string;
}

export interface CredencialInfo {
  title: string;
  titleEn?: string;
  paragraphs: string[];
  paragraphsEn?: string[];
  rules: string[];
  rulesEn?: string[];
}

/**
 * 六大歷史里程碑篇章
 */
export const HISTORY_CHAPTERS: HistoryChapter[] = [
  {
    id: "legend-and-stars",
    title: "繁星原野與聖骨發現",
    titleEn: "Field of Stars and the Discovery of the Relics",
    subtitle: "Campus Stellae 的奇蹟傳說",
    subtitleEn: "The Miraculous Legend of Campus Stellae",
    period: "西元 1 世紀傳說 ～ 9 世紀初（約西元 820 年前後）",
    periodEn: "1st-century legend to early 9th century (c. 820 AD)",
    summary:
      "根據基督教傳統，相傳十二使徒之一的聖雅各（Saint James / Santiago）曾前往伊比利半島傳教，殉道後由弟子將遺體運回加利西亞安葬。數百年後，一位隱士據傳在星光指引下發現墓穴，揭開了聖雅各朝聖文化的歷史序幕。",
    summaryEn:
      "According to Christian tradition, Saint James the Apostle preached in the Iberian Peninsula and was buried in Galicia following his martyrdom. Centuries later, a hermit was guided by heavenly starlight to uncover the tomb, inaugurating the storied heritage of the Camino de Santiago.",
    details: [
      "根據西班牙基督教傳統，聖雅各在耶路撒冷殉道後，其弟子阿塔納西奧（Atanasio）與西奧多羅（Teodoro）將遺體安置於石船中。傳說石船奇蹟般地漂流至加利西亞，抵達伊利亞弗拉維亞（Iria Flavia，即現今 Padrón 一帶）。這段故事屬於宗教傳說，並非經歷史文獻證實的事件。",
      "約西元 9 世紀初，一位名叫裴拉約（Pelayo）的隱士，據傳在森林深處看見天空中閃耀著奇異的星光，並聽見天使的歌詠。他將此事通報伊利亞弗拉維亞主教提奧多米洛（Teodomiro），引導主教前往探查。",
      "主教前往探查後，發現一處古代墓穴，並將其中的遺骸認定為聖雅各及其兩位弟子的遺骨。這項發現一般被認為發生於西元 820 年前後，成為孔波斯特拉發展為朝聖中心的重要起點。Compostela 的名稱傳統上常被解釋為源自拉丁文 Campus Stellae（繁星原野），與星光指引發現墓穴的傳說相互呼應；不過，這種說法屬於民間詞源解釋，並非已獲學界確認的詞源。",
    ],
    detailsEn: [
      "According to Spanish Christian tradition, after Saint James was martyred in Jerusalem, his disciples Atanasio and Teodoro transported his body in a stone boat. Legend recounts that the boat miraculously drifted to Galicia, arriving at Iria Flavia (near modern Padrón). This narrative belongs to religious lore rather than documented historical fact.",
      "In the early 9th century, a hermit named Pelayo reportedly witnessed supernatural lights shining above the forest and heard celestial choirs. He reported this wonder to Bishop Teodomiro of Iria Flavia, who then led an expedition to investigate.",
      "Upon investigation, the bishop discovered an ancient crypt and identified the remains as those of Saint James and two disciples. This discovery, traditionally dated around 820 AD, established Compostela as a preeminent pilgrimage center. The name Compostela is popularly associated with the Latin Campus Stellae (Field of Stars), though modern linguists consider this folk etymology rather than confirmed truth.",
    ],
  },
  {
    id: "first-pilgrim",
    title: "最早有記載的朝聖者阿方索二世",
    titleEn: "Alfonso II: The First Documented Pilgrim",
    subtitle: "原始之路的起源與第一座聖所建立",
    subtitleEn: "Birth of Camino Primitivo and the First Sanctuary",
    period: "西元 9 世紀初（約西元 820 年代）",
    periodEn: "Early 9th century (c. 820s AD)",
    summary:
      "阿斯圖里亞斯王國國王阿方索二世（Alfonso II）在聖雅各墓穴發現後，親自前往加利西亞朝聖，成為歷史上最早有記載、前往墓穴的重要朝聖者之一，也被視為原始之路（Camino Primitivo）的重要起源人物。",
    summaryEn:
      "King Alfonso II of Asturias became the first documented monarch to embark on pilgrimage to the newly discovered tomb in Galicia, pioneering the Camino Primitivo (Original Way) and erecting the first royal sanctuary.",
    details: [
      "得知聖雅各墓穴重現的消息後，阿斯圖里亞斯國王阿方索二世自當時王廷所在地奧維耶多（Oviedo）出發，前往加利西亞探訪墓穴。這趟旅程被視為現存歷史記錄中，早期前往聖雅各墓穴朝聖的重要活動之一。",
      "國王從奧維耶多前往聖雅各墓穴所經過的路線，成為今日原始之路（Camino Primitivo）的歷史基礎。這條路線從奧維耶多出發，穿越阿斯圖里亞斯與加利西亞的山區，最終抵達聖地牙哥德孔波斯特拉。",
      "阿方索二世支持在墓穴所在地建立供奉聖雅各的早期聖所，並透過王室支持促進聖雅各崇拜的發展。這項舉措奠定了往後朝聖活動的宗教與政治基礎，也讓孔波斯特拉逐漸成為重要的基督教朝聖中心。",
    ],
    detailsEn: [
      "Upon receiving news of the tomb's discovery, King Alfonso II set out from his court in Oviedo to pay homage in Galicia. His journey is regarded as the earliest recorded royal pilgrimage to Santiago.",
      "The path traversed by the king from Oviedo across the rugged Asturian and Galician mountains established the historic route known today as the Camino Primitivo (Original Way).",
      "Alfonso II financed and established an early church over the sepulcher. Royal patronage catalyzed veneration for Saint James, laying the religious and political cornerstone that transformed Compostela into a major European destination.",
    ],
  },
  {
    id: "medieval-golden-age",
    title: "中世紀的黃金朝聖熱潮",
    titleEn: "The Golden Age of Medieval Pilgrimage",
    subtitle: "三大基督教朝聖聖地與《加理斯都聖書》",
    subtitleEn: "Major Holy Sites and the Codex Calixtinus",
    period: "西元 11 世紀 ～ 13 世紀",
    periodEn: "11th to 13th Century",
    summary:
      "聖地牙哥德孔波斯特拉逐漸成為中世紀歐洲最重要的基督教朝聖中心之一，與耶路撒冷、羅馬並列重要朝聖聖地。來自歐洲各地的信徒沿著不同路線前往加利西亞，帶動沿途城鎮發展、商業活動、宗教傳播與跨文化交流。",
    summaryEn:
      "Santiago de Compostela flourished into one of medieval Christendom's three greatest pilgrimage centers alongside Rome and Jerusalem, sparking extensive urban development, commerce, and cross-cultural exchange throughout Europe.",
    details: [
      "根據聖地牙哥教會沿用的傳統說法，西元 1122 年，教宗卡利克斯特二世（Callixtus II）授予孔波斯特拉禧年特權，規定當聖雅各瞻禮日（7 月 25 日）恰逢星期日的年份，可舉行聖雅各禧年（Año Santo Jacobeo）。西元 1179 年，教宗亞歷山大三世（Alexander III）透過《Regis Aeterni》通諭確認相關特權。不過，這項制度的早期歷史依據仍存在學術討論，現存可確認的聖年紀錄則出現在 15 世紀。",
      "西元 12 世紀編纂的《加理斯都聖書》（Codex Calixtinus），尤其是其中的第五卷《朝聖指南》（Liber Peregrinationis），記錄了前往聖地牙哥的路線、沿途城鎮、教堂、風土民情及朝聖相關資訊，被視為歐洲中世紀重要的早期朝聖旅行指南之一。其編纂過程涉及多位作者與資料來源，不宜將全書簡單歸於單一作者。",
      "隨著朝聖人潮增加，沿途的修道院、教堂、醫院與慈善機構逐漸建立照顧朝聖者的服務網絡，提供住宿、飲食及醫療協助。不同國籍、語言與文化背景的旅人，在共同的朝聖目標下形成跨越國界的交流網絡，對中世紀歐洲的宗教、社會與文化發展產生深遠影響。",
    ],
    detailsEn: [
      "According to diocesan tradition, Pope Callixtus II granted Compostela Holy Year privileges in 1122, designating an Año Santo Jacobeo whenever the feast of St. James (July 25) falls on a Sunday. Pope Alexander III confirmed these concessions in 1179 via the bull Regis Aeterni, cementing its status across the continent.",
      "Compiled in the 12th century, the Codex Calixtinus—particularly its fifth book, Liber Peregrinationis—documented travel routes, towns, sanctuaries, and regional customs, becoming one of Europe's earliest comprehensive travel guides.",
      "As pilgrim influx surged, an extensive hospitality network of monasteries, hospitals, and charitable confraternities emerged. Travelers of diverse languages and nationalities forged transnational bonds, exerting a lasting impact on European culture.",
    ],
  },
  {
    id: "decline-and-obscurity",
    title: "宗教分裂與戰亂低谷",
    titleEn: "Decline, Reformation, and Hiding of the Relics",
    subtitle: "黑死病、宗教改革與聖骨移藏",
    subtitleEn: "The Black Death, Religious Wars, and Re-discovery",
    period: "西元 14 世紀 ～ 19 世紀",
    periodEn: "14th to 19th Century",
    summary:
      "黑死病、歐洲戰亂及宗教改革等因素，使中世紀盛行的朝聖活動逐漸衰退。1589 年，為避免聖雅各遺骸在英格蘭艦隊遠征期間遭到掠奪或破壞，教會將其秘密移藏，直到 19 世紀才重新發現。",
    summaryEn:
      "The Black Death, prolonged conflicts, and the Protestant Reformation severely dampened pilgrimage traffic. In 1589, amid English naval raids, the relics were secretly hidden away and remained concealed until archaeological unearthing in the 19th century.",
    details: [
      "14 世紀中葉席捲歐洲的黑死病造成大量人口死亡，社會與經濟秩序受到嚴重衝擊；英法百年戰爭等長期軍事衝突，也使部分朝聖路線變得危險，影響跨國朝聖活動。這些因素共同促成朝聖活動逐漸衰退，但並未使朝聖傳統完全中斷。",
      "16 世紀歐洲宗教改革興起，部分新教改革者對聖人崇拜、聖髑敬禮及朝聖制度提出質疑。加上政治、經濟與社會環境變化，前往孔波斯特拉的朝聖活動逐漸失去中世紀時期的盛況。",
      "西元 1589 年，英國海軍將領法蘭西斯・德瑞克（Francis Drake）參與英格蘭對西班牙的軍事遠征，艦隊進逼西班牙西北部沿岸。為避免聖雅各遺骸遭到掠奪或破壞，教會將其秘密移藏。直到西元 1879 年，相關遺骸才在考古調查中重新被發現，並經教會調查後，由教宗良十三世（Leo XIII）於 1884 年發布《Deus Omnipotens》通諭，正式確認其身分。",
    ],
    detailsEn: [
      "The Black Death in the mid-14th century and hostilities like the Hundred Years' War rendered travel perilous across Europe, leading to an extended downturn in pilgrimage numbers.",
      "The 16th-century Protestant Reformation critiqued the veneration of relics and indulgence pilgrimages, diminishing Compostela's prominence during the early modern era.",
      "In 1589, amidst Sir Francis Drake's naval raids along the Galician coast, church authorities concealed the relics within the cathedral walls to prevent desecration. They were rediscovered in 1879 during archaeological excavations, and Pope Leo XIII verified their authenticity in 1884 via the bull Deus Omnipotens.",
    ],
  },
  {
    id: "modern-renaissance",
    title: "現代文藝復興與黃色箭頭",
    titleEn: "Modern Renaissance and the Yellow Arrow",
    subtitle: "埃利亞斯・瓦利尼亞神父的劃時代遺產",
    subtitleEn: "The Visionary Legacy of Father Elías Valiña",
    period: "西元 20 世紀（1980 年代起）",
    periodEn: "20th Century (from 1980s onward)",
    summary:
      "一位來自加利西亞的鄉村神父，投入大量時間考證、整理與復原古老朝聖路線，並以醒目的黃色箭頭重新建立沿途指引，喚醒了逐漸沉寂的朝聖古道，為現代朝聖之路的復興奠定重要基礎。",
    summaryEn:
      "A parish priest from Galicia dedicated years to historical research and physical route restoration, painting vibrant yellow arrows that revitalized the ancient trails and sparked the modern Camino revival.",
    details: [
      "20 世紀中葉，許多古老朝聖路線逐漸荒廢，部分路段雜草叢生、指標不明。加利西亞塞布雷羅（O Cebreiro）的本堂神父埃利亞斯・瓦利尼亞（Don Elías Valiña），長期投入聖雅各朝聖之路的歷史研究、路線考證與復原工作，也積極推動沿途環境整理與路線標示。",
      "西元 1984 年，瓦利尼亞神父開始在法國之路沿線繪製醒目的黃色箭頭，從法國方向一路標示至聖地牙哥，協助朝聖者辨認方向。黃色箭頭逐漸成為現代聖雅各朝聖之路最具代表性的路線指引標誌之一，讓不同國籍的旅人更容易辨識行進方向。",
      "西元 1987 年，歐洲理事會將聖雅各朝聖之路指定為第一條「歐洲文化路線」（European Cultural Route），肯定其跨國文化交流與歷史價值。西元 1993 年，西班牙境內的聖雅各朝聖之路正式列入 UNESCO 世界文化遺產名錄；2015 年，北部朝聖路線進一步擴充列入，涵蓋北方之路、原始之路等路線，讓更多歷史路線獲得國際文化遺產保護。",
    ],
    detailsEn: [
      "By the mid-20th century, many Camino sections had fallen into neglect or disrepair. Father Elías Valiña, parish priest of O Cebreiro, devoted himself to researching, mapping, and restoring the historical paths.",
      "In 1984, Father Valiña began painting bright yellow arrows along the Camino Francés from the French border to Santiago. The yellow arrow has since become the universally recognized beacon for international walkers.",
      "In 1987, the Council of Europe declared the Camino de Santiago the first 'European Cultural Route'. In 1993, the Spanish section was inscribed as a UNESCO World Heritage site, subsequently expanded in 2015 to include the Northern and Primitive routes.",
    ],
  },
  {
    id: "global-spiritual-path",
    title: "現代的意義：超越宗教的朝聖體驗",
    titleEn: "Contemporary Meaning: A Universal Spiritual Journey",
    subtitle: "心靈沉澱、自我探索與跨文化交流",
    subtitleEn: "Mindfulness, Self-Discovery, and Human Connection",
    period: "西元 21 世紀 ～ 當代",
    periodEn: "21st Century to Present",
    summary:
      "今日走在朝聖之路上的旅人，已不再局限於宗教信仰。有人為了文化探索，有人為了體能挑戰，也有人希望透過日復一日的步行，暫時遠離日常生活，在旅程中重新尋找內心的平靜與方向。",
    summaryEn:
      "Today's walkers come from every corner of the earth and every walk of life. Beyond religious roots, the Camino has evolved into a transformative sanctuary for reflection, wellness, and intercultural camaraderie.",
    details: [
      "近年來，聖雅各朝聖之路持續吸引來自世界各地的朝聖者，每年有數十萬人抵達聖地牙哥並領取完步證書（Compostela），展現出跨越國界與文化的全球影響力。除了傳統宗教朝聖者，也有許多人為了文化體驗、自然探索、體能挑戰、自我對話與人生沉澱而踏上旅程。須注意，完步證書的統計人數並不等於所有實際走過朝聖之路的人數。",
      "暫時遠離日常生活的忙碌，將注意力放回每天的步行、飲食與休息，讓生活回歸簡單而純粹的節奏。沿途與不同國籍的旅人相遇，在互相協助、分享故事與共同克服困難的過程中，重新感受人與人之間的連結，也有機會重新整理自己的生活與價值。",
    ],
    detailsEn: [
      "Hundreds of thousands of travelers arrive in Santiago each year to receive the Compostela certificate. In addition to traditional pilgrims, hikers seek outdoor adventure, mental decompression, life transitions, and self-discovery.",
      "Stepping away from everyday hustle, pilgrims embrace a rhythm centered on walking, nourishing meals, and rest. Encounters on the way foster genuine empathy, openness, and lifelong friendships across cultural boundaries.",
    ],
  },
];

/**
 * 朝聖文化四大核心象徵
 */
export const CULTURAL_SYMBOLS: CulturalSymbol[] = [
  {
    id: "scallop-shell",
    name: "扇貝殼",
    nameEn: "Scallop Shell",
    spanishName: "La Vieira",
    meaning: "匯聚歸一的生命方向與朝聖者的身分象徵",
    meaningEn: "Convergence of life paths and the timeless emblem of the pilgrim",
    origin:
      "扇貝殼是聖雅各朝聖之路最具代表性的傳統象徵之一。關於其起源，流傳著多種宗教傳說，其中一則描述聖雅各的弟子運送其遺體前往加利西亞途中，一名騎士與馬匹奇蹟般地從海中生還，身上覆滿扇貝殼。歷史上，扇貝殼至少從 12 世紀起便已成為聖雅各朝聖的重要標誌，中世紀朝聖者也會將其帶回家鄉，作為完成朝聖的紀念。其放射狀紋路則常被解讀為象徵歐洲各地的朝聖路線，最終匯聚至同一終點聖地牙哥。",
    originEn:
      "One of the most enduring symbols of the Camino, dating back to at least the 12th century. The shell's grooves symbolize various pilgrimage routes across Europe converging at a single destination in Santiago. Historically, returning pilgrims wore it as proof of completion.",
    practicalTip: "出發前可將扇貝殼掛在背包外側，作為朝聖者身分的象徵。沿途也可留意路標上的扇貝殼圖案，辨識朝聖路線。",
    practicalTipEn:
      "Tie a scallop shell to your backpack to identify yourself as a pilgrim, and look out for shell motifs on waymarkers throughout the trail.",
  },
  {
    id: "yellow-arrow",
    name: "黃色箭頭",
    nameEn: "Yellow Arrow",
    spanishName: "La Flecha Amarilla",
    meaning: "迷惘時的安心指引",
    meaningEn: "Reassuring guidance whenever you feel uncertain",
    origin:
      "由加利西亞塞布雷羅的埃利亞斯・瓦利尼亞神父（Don Elías Valiña）於 1984 年開始推廣與繪製。醒目的黃色箭頭最初用於標示法國之路，逐步建立從法國通往聖地牙哥的路線指引。其簡單、清晰且容易辨識的設計，能協助朝聖者在道路、森林、村莊及岔路口確認方向，如今已成為國際間最具代表性的朝聖路線標誌之一。",
    originEn:
      "Initiated in 1984 by Father Elías Valiña of O Cebreiro. Its straightforward, high-visibility design safely guides travelers through complex crossroads, forest tracks, and village turns across Spain.",
    practicalTip: "遇到岔路時，先確認黃色箭頭或扇貝殼標誌。若方向不明，可搭配朝聖地圖或 GPS 軌跡確認，避免走錯路。",
    practicalTipEn:
      "At junctions, pause and look for a yellow arrow or shell sign. When in doubt, cross-check with offline GPS tracks to avoid detours.",
  },
  {
    id: "credencial",
    name: "朝聖護照與印章",
    nameEn: "Pilgrim Credential & Stamps",
    spanishName: "La Credencial del Peregrino",
    meaning: "徒步旅程的印記與完步證明",
    meaningEn: "A tangible chronicle of your footstep journey and proof of completion",
    origin:
      "朝聖護照的歷史背景可追溯至中世紀，當時朝聖者會使用身分及通行相關文件，以證明朝聖者身分並獲得沿途協助。現代的 Credencial 則是正式的朝聖旅程紀錄文件，用來記錄朝聖路線、日期與沿途蒐集的印章（Sellos），也是申請聖地牙哥完步證書（Compostela）及入住部分朝聖者庇護所的重要憑證。",
    originEn:
      "Evolving from medieval letters of safe conduct, the modern Credencial is an official pilgrim passport used to collect stamps (sellos) at albergues, churches, and cafes, qualifying holders for shelter and the Compostela certificate.",
    practicalTip:
      "出發前可向官方或授權組織取得 Credencial，沿途蒐集印章。申請 Compostela 時，徒步須完成最後 100 公里，騎行須完成最後 200 公里，且每天至少取得 2 枚印章。",
    practicalTipEn:
      "Obtain your Credencial before embarking. To qualify for the Compostela, complete at least the final 100 km walking (or 200 km cycling) with at least 2 dated stamps per day.",
  },
  {
    id: "calabaza",
    name: "葫蘆水壺與手杖",
    nameEn: "Walking Staff & Gourd",
    spanishName: "Bordón y Calabaza",
    meaning: "簡樸生活與堅定前行的象徵",
    meaningEn: "Simplicity, steadfast endurance, and pilgrim tradition",
    origin:
      "中世紀朝聖者經常手持名為 Bordón 的長木手杖，作為行走時的輔助工具，協助支撐身體及通過崎嶇路段。天然乾燥並掏空的葫蘆（Calabaza）則可製成輕便容器，用來攜帶飲用水或酒類。手杖與葫蘆逐漸成為傳統朝聖者裝備的重要組成，也經常出現在聖雅各朝聖者的宗教雕像與藝術圖像中。",
    originEn:
      "Medieval pilgrims carried a wooden staff (bordón) for walking support and defense, along with a hollowed gourd (calabaza) for carrying water or wine. These items frequently adorn classical depictions of Saint James.",
    practicalTip: "現代朝聖者多使用登山杖、水瓶或水袋取代傳統裝備。若想保留傳統特色，也可在背包上掛迷你葫蘆吊飾。",
    practicalTipEn:
      "Modern pilgrims generally use trekking poles and reusable hydration reservoirs, but small gourd trinkets remain popular backpack keepsakes.",
  },
];

/**
 * 完步證書與護照歷史規範
 */
export const CREDENCIAL_INFO: CredencialInfo = {
  title: "朝聖者護照（Credencial）與完步證書（Compostela）",
  titleEn: "Pilgrim Passport (Credencial) & Compostela Certificate",
  paragraphs: [
    "朝聖者護照（Credencial）是記錄朝聖旅程的重要文件，沿途可在庇護所、教堂、咖啡館、市政機關及其他提供印章的地點蒐集印記（Sellos），作為旅程紀錄及申請完步證書的依據。部分朝聖者庇護所（Albergues）也會要求出示有效的朝聖護照，作為入住資格的確認。請注意，只有由聖地牙哥大教堂朝聖者接待辦公室或其授權組織發放的正式 Credencial，才符合申請 Compostela 的文件要求。",
    "完步證書（Compostela）是由聖地牙哥大教堂頒發的正式朝聖完成證明，證書以拉丁文記載朝聖者姓名，確認其基於宗教或靈性動機，完成符合官方認證條件的朝聖旅程。Credencial 是出發前取得、沿途使用的旅程紀錄文件；Compostela 則是在完成朝聖後，抵達聖地牙哥才能申請的證書，兩者的用途與取得時間不同。",
  ],
  paragraphsEn: [
    "The Pilgrim Credential (Credencial) is the official record of your Camino journey. Collect stamps (sellos) along the way at albergues, churches, cafes, and town halls. Many pilgrim hostels require a valid Credencial for admission. Note that only credentials issued by the Cathedral of Santiago or authorized pilgrim associations qualify for the official Compostela certificate.",
    "The Compostela is the official certificate granted by the Cathedral of Santiago in Latin, acknowledging that the pilgrim completed the route with religious or spiritual devotion. The Credencial is carried throughout the walk, while the Compostela is issued upon arrival in Santiago at the Pilgrim's Reception Office.",
  ],
  rules: [
    "朝聖護照取得方式：出發前可親自前往聖地牙哥大教堂朝聖者接待辦公室（Oficina de Acogida al Peregrino），或向大教堂授權的朝聖者協會、朝聖組織及相關發放單位取得 Credencial。海外朝聖者也可向所在地的聖雅各朝聖之路友好協會（Asociación de Amigos del Camino de Santiago）詢問取得方式。購買或領取前，應確認發放單位是否獲得官方授權。",
    "朝聖護照使用方式：Credencial 為個人使用的旅程紀錄文件，應沿途在庇護所、教堂、咖啡館及其他提供印章的場所蒐集印記，並確認印章日期清晰可辨。除了作為申請 Compostela 的依據，也是部分朝聖者庇護所確認朝聖者身分及入住資格的文件。",
    "步行或騎馬者：須沿國際朝聖者接待辦公室認可的朝聖路線，完成抵達聖地牙哥前至少最後 100 公里的旅程，且最後一段必須包含抵達聖地牙哥大教堂的路程。例如法國之路可自 Sarria 出發，葡萄牙之路可自 Tui 或 Valença 出發。若從西班牙境外開始徒步，仍須在西班牙境內完成至少 70 公里的路程。",
    "自行車騎行者：須沿官方認可的朝聖路線，完成抵達聖地牙哥前至少最後 200 公里的旅程，並符合相同的路線連續性要求。例如法國之路可自 Ponferrada 出發。",
    "印章規定：徒步及騎馬者在最後 100 公里、自行車騎行者在最後 200 公里，均須每天取得至少 2 枚附有日期的印章，以證明旅程的連續性。印章可向庇護所、教堂、市政機關及其他沿途提供印章的場所取得。若採分段方式完成最低規定距離，每一階段的起點與終點都必須蓋章並註明日期，且各階段須依時間及地理順序接續完成，不可跳過路段。",
    "完步證書申請方式：完成符合條件的朝聖旅程後，須親自前往聖地牙哥大教堂的朝聖者接待辦公室（Oficina de Acogida al Peregrino，地址：Rúa Carretas 33）辦理。依官方現行流程，朝聖者須先掃描現場 QR Code 登記個人資料，取得排隊號碼，再依序出示 Credencial 及相關資料領取 Compostela。證書免費核發，但旺季或人潮較多時，不保證能在當天完成領取。",
  ],
  rulesEn: [
    "Obtaining a Credencial: Available before departure from the Pilgrim's Reception Office in Santiago, authorized pilgrim associations worldwide, or designated cathedrals and albergues at major starting points. Ensure your credential comes from an officially recognized issuing body.",
    "Using the Credencial: A personal travel document stamped along your route at albergues, churches, and establishments. Ensure each stamp has a legible date. Serves as eligibility verification for pilgrim shelters.",
    "Walkers & Horseback Riders: Must complete at least the final 100 km on an officially recognized Camino route leading continuously to the Cathedral of Santiago (e.g., Sarria on the French Way, Tui on the Portuguese Way). If starting outside Spain, at least 70 km must be completed within Spain.",
    "Cyclists: Must complete at least the final 200 km on an officially recognized route with uninterrupted continuity (e.g., Ponferrada on the French Way).",
    "Stamp Requirements: Walkers/horse riders over the final 100 km and cyclists over the final 200 km must obtain at least 2 dated stamps each day. If walking in separate stages over time, every stage's start and end must be stamped and dated chronologically.",
    "Applying for the Compostela: Upon completing your Camino, visit the Pilgrim's Reception Office (Oficina de Acogida al Peregrino, Rúa Carretas 33, Santiago). Scan the onsite QR code to register and obtain a queue ticket before presenting your Credencial. The certificate is free of charge, though peak periods may involve wait times.",
  ],
};
