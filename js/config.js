// -------------------------------------------------------------
// ⚙️ CONFIGURATION & IMMUTABLE DEFAULT DATASETS (2026-09-08 Day 3 Chainsaw Man & Day 5 Update)
// -------------------------------------------------------------

let googleSheetId = '1FDs9cPR0WjZv_HitON78zJS_dKNHzN46jrRtpV13ldQ';
let googleAppsScriptUrl = '';
let googleDriveFolderUrl = 'https://drive.google.com/drive/folders/1MZkiA956v0goxCa7Zu4HzP1EfZZ1yKeW?usp=drive_link';

const CATEGORY_ICONS = {
    shrine: '⛩️',
    matcha: '🍵',
    food: '🥩',
    view: '📷',
    park: '🎡',
    shopping: '🛍️'
};

const DEFAULT_PLACES = [
    // DAY 1 (09/04 五)
    { id: "day1-checkin", category: "view", name: "✈️ 成田機場入境 ➔ 前往淺草/打花茶屋 Check-in", sub: "15:20 抵達 NRT T1 • 樂桃 MM626", desc: "搭乘 10:50 樂桃 MM626 於 15:20 抵達東京成田 T1，搭乘京成 Access/Skyliner 前往淺草/打花茶屋辦理入住。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "成田機場第1航廈", lat: 35.7720, lng: 140.3929 },
    { id: "day1-asakusa-night", category: "shrine", name: "🏮 淺草雷門與仲見世通夜間散策", sub: "傍晚~夜間 • 台東區淺草", desc: "避開白天喧囂，欣賞夜間點燈下莊嚴優美的雷門大燈籠與五重塔。", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80", mapQuery: "淺草寺雷門", lat: 35.7148, lng: 139.7967 },
    { id: "day1-open-bus", category: "view", name: "🚌 東京雙層敞篷觀光巴士夜景巡禮", sub: "夜間 • 敞篷觀光巴士", desc: "搭乘雙層敞篷觀光巴士，全景俯瞰東京夜景與東京鐵塔光影。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "東京觀光巴士", lat: 35.6812, lng: 139.7671 },
    { id: "day1-yakiniku-kamo", category: "food", name: "🥩 燒肉晚宴 / 宵夜：鴨 to 葱", sub: "晚餐~宵夜 • 御徒町/上野附近", desc: "極上燒肉饗宴，或品嚐上野超人氣拉麵名店「鴨 to 葱」清爽鴨湯拉麵。", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80", mapQuery: "鴨 to 葱", lat: 35.7075, lng: 139.7747 },
    { id: "day1-toyosu-onsen", category: "park", name: "♨️ 千客萬來 豐洲萬葉俱樂部 24 小時夜間泡湯", sub: "24 小時夜間泡湯 • 江東區豐洲 6-5-1", desc: "享受箱根/湯河原溫泉直送，夜間頂樓足湯俯瞰東京灣夢幻夜景。", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80", mapQuery: "東京豐洲萬葉俱樂部", lat: 35.6453, lng: 139.7806 },

    // DAY 2 (09/05 六)
    { id: "day2-shiomi-shrine", category: "shrine", name: "⛩️ 潮見龍宮社參拜", sub: "上午 • 江東區潮見 1-28-6", desc: "隱身於東京灣區的特色神社，供奉龍宮大神，氣氛幽靜獨特。", img: "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=400&q=80", mapQuery: "東京潮見龍宮社", lat: 35.6582, lng: 139.8173 },
    { id: "day2-odaiba-statue", category: "view", name: "🏙️ 台場海濱公園與自由女神像散步", sub: "中午 • 港區台場", desc: "打卡自由女神像與彩虹大橋，享受東京灣畔海風與絕景。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "台場自由女神像", lat: 35.6277, lng: 139.7788 },
    { id: "day2-tyffonium-vr", category: "park", name: "🔮 台場 Tyffonium VR 沉浸體驗（預約 13:30–14:00）", sub: "預約 13:30–14:00 • DiverCity Tokyo", desc: "體驗次世代魔幻沉浸式 VR 探索，身歷其境的感官冒險旅程。", img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=400&q=80", mapQuery: "Tyffonium Odaiba", lat: 35.6253, lng: 139.7755 },
    { id: "day2-aqua-park", category: "park", name: "🐬 品川水族館（Maxell Aqua Park）觀賞 19:00 夜間海豚秀與 19:45 水幕秀", sub: "19:00 海豚秀 • 19:45 水幕秀 • 港區高輪", desc: "結合絢麗光影音效與海洋生物，觀賞絕美夜間海豚秀與奇幻水幕燈光秀。", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80", mapQuery: "Maxell Aqua Park Shinagawa", lat: 35.6285, lng: 139.7386 },

    // DAY 3 (09/06 日) - 最新《鏈鋸人》朝聖 & 弓道 & 哈利波特時間軸
    { id: "day3-kyudo-exp", category: "view", name: "🏹 日式弓道體驗（預約 08:30 集合，幡谷站）", sub: "08:30 集合 • 京王新線 幡谷站 (幡ヶ谷駅) 檢票口前", desc: "08:30 於京王新線「幡谷站（幡ヶ谷駅）」檢票口前集合！換上日式道服，體驗傳統日本弓道的精神與射箭儀式（體驗至 11:15，結束後散步前往神保町/喫茶エル）。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "幡ヶ谷駅", lat: 35.6763, lng: 139.6764 },
    { id: "day3-chainsaw-man", category: "view", name: "🪚 《鏈鋸人》神保町朝聖漫步（喫茶エル ➔ 1-34 ➔ 2-8 ➔ 2-2-1）", sub: "11:25–12:25 • 千代田區神保町/猿樂町", desc: "弓道體驗後最順散步路線：步行至喫茶エル（松井大樓 1F 拍照）➔ 步行 3 分鐘至神保町 1-34 ➔ 步行 2 分鐘至神保町 2-8 ➔ 步行 2 分鐘至神保町 2-2-1。結束後直接於神保町站搭地鐵直達「豐島園站」前往哈利波特影城。順道可採買一保堂抹茶粉。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "喫茶エル 神保町", lat: 35.6958, lng: 139.7578 },
    { id: "day3-harry-potter", category: "park", name: "🪄 東京華納兄弟哈利波特影城（預約 13:00–13:30）", sub: "13:00–17:30 影城體驗 • 練馬區豐島園", desc: "12:25 搭地鐵直達「豐島園站」，體驗霍格華茲大禮堂、九又四分之三月台、禁忌森林、斜角巷與品嚐奶油啤酒（270 分鐘）。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "東京哈利波特影城", lat: 35.7431, lng: 139.6465 },
    { id: "day3-ikebukuro-sunshine", category: "shopping", name: "🛍️ 池袋太陽城 Sunshine City 深度爆買", sub: "18:00–20:30 • 池袋 Sunshine City", desc: "17:30 搭西武線直達「池袋站」，爆買 Workman Girl 機能外套 (2F)、寶可夢中心 Mega Tokyo (2F)、萬代官方扭蛋總店 (3F) 與 Animate 池袋本店。", img: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=400&q=80", mapQuery: "Sunshine City Ikebukuro", lat: 35.7289, lng: 139.7193 },
    { id: "day3-dinner-ikebukuro", category: "food", name: "🍜 晚宴：池袋知名美食晚宴（麵處花田 / Izumo 鰻魚飯）", sub: "20:30~ 晚餐 • 池袋商圈", desc: "享用池袋超濃郁味噌拉麵「麵處花田」或巨無霸玉子燒鰻魚飯 Izumo 享用豐盛晚宴。", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80", mapQuery: "麵處花田 池袋", lat: 35.7315, lng: 139.7155 },

    // DAY 4 (09/07 一)
    { id: "day4-ghibli-museum", category: "park", name: "🍃 三鷹之森吉卜力美術館（預約 11:00 入場）", sub: "預約 11:00 入場 • 三鷹市下連雀", desc: "宮崎駿動畫的夢幻城堡，親眼目睹巨型天空之城機器人與龍貓巴士。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "三鷹之森吉卜力美術館", lat: 35.6963, lng: 139.5704 },
    { id: "day4-kichijoji-hikiniku", category: "food", name: "🌳 穿越井之頭公園至吉祥寺商圈散策（午餐：挽肉與米）", sub: "午餐 • 武藏野市吉祥寺", desc: "綠意公園散步，逛吉祥寺特色選品店，享用現烤「挽肉與米」和牛漢堡排。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "井之頭恩賜公園", lat: 35.6997, lng: 139.5762 },
    { id: "day4-omotesando-shopping", category: "shopping", name: "👟 原宿與表參道採買（On / HOKA 跑鞋旗艦店、LE LABO 香水、AMAM DACOTAN 麵包）", sub: "下午 • 澀谷區神宮前", desc: "On / HOKA 跑鞋旗艦店、LE LABO 質感香水、AMAM DACOTAN 爆款排隊生麵包。", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80", mapQuery: "表參道", lat: 35.6672, lng: 139.7063 },

    // DAY 5 (09/08 二) - 淺草浴衣 & 貓頭鷹咖啡 & 洗錢神社 & 晴空塔
    { id: "day5-kimono-asakusa", category: "shrine", name: "👘 淺草月見和服/浴衣換裝與淺草神社合照（預約 09:00）", sub: "預約 09:00 • 淺草神社合照", desc: "換上精緻日式浴衣/和服，前往淺草神社與被官稻荷神社參拜拍照。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "淺草神社", lat: 35.7153, lng: 139.7968 },
    { id: "day5-owl-cafe", category: "park", name: "🦉 秋葉原貓頭鷹咖啡館（Akiba Fukurou）", sub: "上午 • 千代田區神田練塀町", desc: "療癒系互動體驗，近距離接觸與餵食可愛貓頭鷹。", img: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=400&q=80", mapQuery: "Akiba Fukurou", lat: 35.6997, lng: 139.7745 },
    { id: "day5-koami-shrine", category: "shrine", name: "💰 日本橋小網神社強運洗錢", sub: "中午 • 中央區日本橋小網町 16-23", desc: "東京超強運洗錢神社！參拜洗錢井（銭洗いの井）求財運與厄除。", img: "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=400&q=80", mapQuery: "小網神社", lat: 35.6853, lng: 139.7801 },
    { id: "day5-skytree-pokemon", category: "shopping", name: "🗼 晴空塔商圈（寶可夢中心、祇園辻利抹茶粉）", sub: "下午 • 東京晴空塔 Solamachi", desc: "寶可夢中心晴空塔店、採買祇園辻利頂級抹茶粉與伴手禮。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "東京晴空塔", lat: 35.7101, lng: 139.8107 },

    // DAY 6 (09/09 三) - 江戶東京建築園 & 銀座採買 & 金魚美術館 ➔ 成田返台
    { id: "day6-edo-museum", category: "view", name: "🏛️ 江戶東京建築園參觀（小金井公園）", sub: "10:00–12:30 • 小金井市關野町 1-7-5", desc: "漫步復古昭和與江戶開港懷舊建築群，體驗千與千尋場景靈感地（搭 JR 中央線直達東京/日本橋 30 分鐘）。", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80", mapQuery: "江戶東京建築園", lat: 35.7163, lng: 139.5126 },
    { id: "day6-ginza-nihonbashi", category: "shopping", name: "🍵 日本橋 & 銀座質感採買與巡禮（bakery bank / 丸久小山園 / LE LABO / IQOS）", sub: "13:10–16:15 • 日本橋 & 銀座二丁目", desc: "bakery bank / Pâtisserie ease 頂級甜點、丸久小山園（銀座三越 B2F 抹茶粉）、LE LABO GINZA SIX 店、IQOS 銀座店（銀座二丁目）。", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80", mapQuery: "GINZA SIX", lat: 35.6715, lng: 139.7650 },
    { id: "day6-art-aquarium", category: "view", name: "🎨 銀座金魚美術館 ART AQUARIUM GINZA", sub: "16:30–18:00 • 銀座三越 8F", desc: "夢幻金魚燈光藝術展，結合日式傳統美學與現代沉浸燈光秀（銀座三越 8F）。", img: "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=400&q=80", mapQuery: "ART AQUARIUM GINZA", lat: 35.6715, lng: 139.7650 },
    { id: "day6-airport-return", category: "view", name: "✈️ 結束銀座巡禮，搭車直達成田機場，22:15 MM627 班機返台", sub: "22:15 MM627 • 成田 T1 ➔ 桃園 TPE T1", desc: "結束銀座採買與展覽，於東京/日本橋/押上搭乘京成 Access 直達成田 T1，搭乘 22:15 樂桃 MM627 航班返台 (01:00 抵達 TPE)。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "成田機場第1航廈", lat: 35.7720, lng: 140.3929 }
];

const DAY_TITLES = {
    1: "🗓️ 09/04 (五) Day 1：落地入境 ➔ 淺草夜巡 ➔ 觀光巴士 ➔ 豐洲溫泉",
    2: "🗓️ 09/05 (六) Day 2：潮見龍宮社 ➔ 台場 VR ➔ 品川水族館夜間秀",
    3: "🗓️ 09/06 (日) Day 3：弓道體驗 ➔ 鏈鋸人朝聖 ➔ 哈利波特影城 ➔ 池袋太陽城爆買",
    4: "🗓️ 09/07 (一) Day 4：吉卜力美術館 ➔ 吉祥寺 ➔ 表參道與原宿",
    5: "🗓️ 09/08 (二) Day 5：淺草浴衣 ➔ 貓頭鷹咖啡 ➔ 洗錢神社 ➔ 晴空塔",
    6: "🗓️ 09/09 (三) Day 6：江戶東京建築園 ➔ 銀座採買 ➔ 金魚美術館 ➔ 成田機場返台"
};

// 🗡️ 支線任務預設清單 (依 D1~D6 時間順序精確排列)
const DEFAULT_WISHLIST = [
    { text: "🎟️ [D1 泡湯預訂] 千客萬來 豐洲萬葉俱樂部 泡湯體驗券", done: false },
    { text: "🎟️ [D2 體驗預約] 台場 Tyffonium VR 沉浸體驗 (預約 13:30–14:00)", done: false },
    { text: "🎟️ [D2 門票預訂] 品川水族館 Maxell Aqua Park 夜間秀門票", done: false },
    { text: "🎟️ [D3 體驗預約] 日式弓道體驗 (08:30 京王新線幡谷站檢票口前集合)", done: false },
    { text: "🎟️ [D3 聖地巡禮] 《鏈鋸人》神保町朝聖 (喫茶エル / 街景打卡)", done: false },
    { text: "🎟️ [D3 門票預約] 東京華納兄弟哈利波特影城 (預約 13:00–13:30)", done: false },
    { text: "🎟️ [D4 門票預約] 三鷹之森吉卜力美術館 (預約 11:00 入場)", done: false },
    { text: "🎟️ [D4 整理券/預約] 吉祥寺 挽肉與米 現烤和牛漢堡排", done: false },
    { text: "🎟️ [D5 體驗預約] 淺草月見和服/浴衣換裝 (預約 09:00)", done: false },
    { text: "🎟️ [D5 門票預約] 秋葉原貓頭鷹咖啡館 (Akiba Fukurou)", done: false },
    { text: "🎟️ [D6 門票預訂] 銀座金魚美術館 ART AQUARIUM 門票 (16:30–18:00)", done: false },
    { text: "🎟️ [D6 質感採買] IQOS 銀座店 / LE LABO GINZA SIX / 丸久小山園", done: false }
];

function getDefaultItinerary() {
    return {
        1: [DEFAULT_PLACES[0], DEFAULT_PLACES[1], DEFAULT_PLACES[2], DEFAULT_PLACES[3], DEFAULT_PLACES[4]],
        2: [DEFAULT_PLACES[5], DEFAULT_PLACES[6], DEFAULT_PLACES[7], DEFAULT_PLACES[8]],
        3: [DEFAULT_PLACES[9], DEFAULT_PLACES[10], DEFAULT_PLACES[11], DEFAULT_PLACES[12], DEFAULT_PLACES[13]],
        4: [DEFAULT_PLACES[14], DEFAULT_PLACES[15], DEFAULT_PLACES[16]],
        5: [DEFAULT_PLACES[17], DEFAULT_PLACES[18], DEFAULT_PLACES[19], DEFAULT_PLACES[20]],
        6: [DEFAULT_PLACES[21], DEFAULT_PLACES[22], DEFAULT_PLACES[23], DEFAULT_PLACES[24]]
    };
}

// 🔒 安全與唯讀不可變之官方原廠預設範本 (MASTER BASELINE - IMMUTABLE)
const OFFICIAL_DEFAULT_PLACES = Object.freeze(JSON.parse(JSON.stringify(DEFAULT_PLACES)));

function getOfficialDefaultItinerary() {
    return JSON.parse(JSON.stringify(getDefaultItinerary()));
}

function getOfficialDefaultWishlist() {
    return JSON.parse(JSON.stringify(DEFAULT_WISHLIST));
}

// ✈️ 🏨 機票與住宿可編輯預設資料 (FLIGHT & ACCOMMODATION DATASET)
const DEFAULT_FLIGHT_HOTEL_INFO = {
    flightTitle: "樂桃航空來回機票",
    flightOutbound: "🛫 去程 09/04 (五)：10:50 TPE 桃園 T1 ➔ 15:20 NRT 成田 T1 (MM626)",
    flightInbound: "🛬 回程 09/09 (三)：22:15 NRT 成田 T1 ➔ 01:00+1 TPE 桃園 T1 (MM627)",
    hotelName: "東京都葛飾區打花茶屋 (お花茶屋)",
    hotelSub: "入住 09/04–09/09 (5 晚) • 京成本線極速直達",
    hotelMapUrl: "https://goo.gl/maps/a9e5uZQNwStHhWUK8?g_st=al"
};

function getOfficialDefaultFlightHotelInfo() {
    return JSON.parse(JSON.stringify(DEFAULT_FLIGHT_HOTEL_INFO));
}

// 📅 ⏳ 旅遊日期與總天數可編輯資料 (TRIP CONFIG DATASET)
const DEFAULT_TRIP_CONFIG = {
    startDate: '2026-09-04',
    totalDays: 6,
    customDayTitles: {}
};

function getOfficialDefaultTripConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_TRIP_CONFIG));
}

// 🛍️ 採購與代購支線任務預設資料 (SHOPPING & PROXY PURCHASES DATASET)
const DEFAULT_SHOPPING_LIST = [
    { id: 'shop-0', name: '💊 ORIHIRO DHA+EPA 魚油軟膠囊 180粒', requester: 'BRYAN代購', priceJpy: 2200, done: false },
    { id: 'shop-roger-1', name: '💊 DHC 強效瑪卡 20日分 60粒', requester: 'roger代購', priceJpy: 2200, done: false },
    { id: 'shop-ypl-1', name: '💊 大正百保能 GOLD A 綜合感冒藥微粒 (粉末) 44包', requester: '尤培霖代購', priceJpy: 1580, done: false },
    { id: 'shop-ypl-2', name: '🌀 TAKARA TOMY BEYBLADE X BX-00 鈷藍龍 2-60C 黑色限定版', requester: '尤培霖代購', priceJpy: 2420, done: false },
    { id: 'shop-ypl-3', name: '🌀 TAKARA TOMY BEYBLADE X BX-34 鈷藍龍 2-60C', requester: '尤培霖代購', priceJpy: 1980, done: false },
    { id: 'shop-ypl-4', name: '🌀 TAKARA TOMY BEYBLADE X BX-23 鳳凰飛翼 9-60GF', requester: '尤培霖代購', priceJpy: 1980, done: false },
    { id: 'shop-ypl-5', name: '🌀 TAKARA TOMY BEYBLADE X UX-11 衝擊巨龍 9-60LR', requester: '尤培霖代購', priceJpy: 2420, done: false }
];

function getOfficialDefaultShoppingList() {
    return JSON.parse(JSON.stringify(DEFAULT_SHOPPING_LIST));
}

window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
window.itinerary = getOfficialDefaultItinerary();
window.wishlist = getOfficialDefaultWishlist();
window.flightHotelInfo = getOfficialDefaultFlightHotelInfo();
window.tripConfig = getOfficialDefaultTripConfig();
window.shoppingList = getOfficialDefaultShoppingList();

let currentCategory = 'all';
let currentDay = 1;
