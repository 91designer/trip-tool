// -------------------------------------------------------------
// ⚙️ CONFIGURATION & IMMUTABLE DEFAULT DATASETS
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
    { id: "day1-checkin", category: "view", name: "✈️ 成田機場入境 ➔ 淺草飯店 Check-in", sub: "下午 • 成田機場 / 淺草飯店", desc: "搭乘 Skyliner 直達淺草飯店辦理入住，展開東京 6 日冒險之旅。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "淺草站", lat: 35.7107, lng: 139.7967 },
    { id: "day1-asakusa-night", category: "shrine", name: "🏮 淺草雷門與仲見世通夜間散策", sub: "傍晚~夜間 • 台東區淺草 2-3-1", desc: "避開白天喧囂，欣賞夜間點燈下莊嚴優美的雷門大燈籠與五重塔。", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80", mapQuery: "淺草寺", lat: 35.7148, lng: 139.7967 },
    { id: "day1-open-bus", category: "view", name: "🚌 東京雙層敞篷觀光巴士夜景巡禮", sub: "夜間 • 敞篷觀光巴士", desc: "搭乘雙層敞篷觀光巴士，全景俯瞰東京夜景與東京鐵塔光影。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "東京觀光巴士", lat: 35.6812, lng: 139.7671 },
    { id: "day1-yakiniku-kamo", category: "food", name: "🥩 燒肉晚宴 / 宵夜：鴨 to 葱", sub: "晚餐~宵夜 • 御徒町 / 上野附近", desc: "極上燒肉饗宴，或品嚐上野超人氣拉麵名店「鴨 to 葱」清爽鴨湯拉麵。", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80", mapQuery: "鴨 to 葱", lat: 35.7075, lng: 139.7747 },
    { id: "day1-toyosu-onsen", category: "park", name: "♨️ 千客萬來 豐洲萬葉俱樂部", sub: "24 小時夜間泡湯 • 江東區豐洲 6-5-1", desc: "享受箱根/湯河原溫泉直送，夜間頂樓足湯俯瞰東京灣夢幻夜景。", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80", mapQuery: "東京豐洲萬葉俱樂部", lat: 35.6453, lng: 139.7806 },

    // DAY 2 (09/05 六)
    { id: "day2-shiomi-shrine", category: "shrine", name: "⛩️ 東京潮見龍宮社參拜", sub: "上午 • 江東區潮見 1-28-6", desc: "隱身於東京灣區的特色神社，供奉龍宮大神，氣氛幽靜獨特。", img: "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=400&q=80", mapQuery: "東京潮見龍宮社", lat: 35.6582, lng: 139.8173 },
    { id: "day2-odaiba-statue", category: "view", name: "🏙️ 台場海濱公園與自由女神像散步", sub: "中午 • 港區台場", desc: "打卡自由女神像與彩虹大橋，享受東京灣畔海風與絕景。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "台場自由女神像", lat: 35.6277, lng: 139.7788 },
    { id: "day2-tyffonium-vr", category: "park", name: "🔮 台場 Tyffonium VR 沉浸體驗", sub: "預約 13:30–14:00 • DiverCity Tokyo", desc: "體驗次世代魔幻沉浸式 VR 探索，身歷其境的感官冒險旅程。", img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=400&q=80", mapQuery: "Tyffonium Odaiba", lat: 35.6253, lng: 139.7755 },
    { id: "day2-aqua-park", category: "park", name: "🐬 品川水族館 (Maxell Aqua Park)", sub: "19:00 海豚秀 • 19:45 水幕秀 • 港區高輪", desc: "結合絢麗光影音效與海洋生物，觀賞絕美夜間海豚秀與奇幻水幕燈光秀。", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80", mapQuery: "Maxell Aqua Park Shinagawa", lat: 35.6285, lng: 139.7386 },

    // DAY 3 (09/06 日)
    { id: "day3-kyudo-exp", category: "view", name: "🏹 日式弓道體驗", sub: "預約 08:45–11:15 • 千代田區", desc: "換上日式道服，體驗傳統日本弓道的精神與射箭儀式。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "千代田區 弓道", lat: 35.6940, lng: 139.7538 },
    { id: "day3-ippodo-matcha", category: "matcha", name: "🍵 一保堂茶鋪（丸之內店）", sub: "採買抹茶粉 • 千代田區丸之內", desc: "京都三百年老字號茶鋪，選購頂級濃茶與手作日式抹茶粉。", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80", mapQuery: "一保堂茶鋪 丸之內店", lat: 35.6780, lng: 139.7615 },
    { id: "day3-lunch-hanada", category: "food", name: "🍜 午餐：麵處花田 / Izumo 鰻魚飯", sub: "午餐 • 池袋 / 丸之內", desc: "品嚐池袋超濃郁味噌拉麵「麵處花田」或巨無霸玉子燒鰻魚飯 Izumo。", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80", mapQuery: "麵處花田 池袋", lat: 35.7315, lng: 139.7155 },
    { id: "day3-ikebukuro-sunshine", category: "shopping", name: "🛍️ 池袋太陽城購物巡禮", sub: "下午 • 池袋 Sunshine City", desc: "Workman 防風外套、寶可夢中心 Mega Tokyo、萬代官方扭蛋總店與 Animate 本店爆買。", img: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=400&q=80", mapQuery: "Sunshine City Ikebukuro", lat: 35.7289, lng: 139.7193 },

    // DAY 4 (09/07 一)
    { id: "day4-ghibli-museum", category: "park", name: "🍃 三鷹之森吉卜力美術館", sub: "預約 11:00 入場 • 三鷹市下連雀", desc: "宮崎駿動畫的夢幻城堡，親眼目睹巨型天空之城機器人與龍貓巴士。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "三鷹之森吉卜力美術館", lat: 35.6963, lng: 139.5704 },
    { id: "day4-kichijoji-hikiniku", category: "food", name: "🌳 井之頭公園 ➔ 吉祥寺散策（挽肉與米）", sub: "午餐 • 武藏野市吉祥寺", desc: "綠意公園散步，逛吉祥寺特色選品店，享用現烤「挽肉與米」和牛漢堡排。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "井之頭恩賜公園", lat: 35.6997, lng: 139.5762 },
    { id: "day4-omotesando-shopping", category: "shopping", name: "👟 原宿與表參道潮流採買", sub: "下午 • 澀谷區神宮前", desc: "On / HOKA 跑鞋旗艦店、LE LABO 質感香水、AMAM DACOTAN 爆款排隊生麵包。", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80", mapQuery: "表參道", lat: 35.6672, lng: 139.7063 },

    // DAY 5 (09/08 二)
    { id: "day5-edo-museum", category: "view", name: "🏛️ 江戶東京建築園參觀", sub: "上午 • 小金井市關野町 1-7-5", desc: "漫步復古昭和與江戶開港懷舊建築群，體驗千與千尋場景靈感地。", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80", mapQuery: "江戶東京建築園", lat: 35.7163, lng: 139.5126 },
    { id: "day5-ginza-nihonbashi", category: "matcha", name: "🍵 日本橋與銀座巡禮", sub: "下午 • bakery bank / 丸久小山園 / LE LABO", desc: "bakery bank 質感甜點、選購丸久小山園頂級抹茶粉、LE LABO GINZA SIX 專櫃。", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80", mapQuery: "GINZA SIX", lat: 35.6715, lng: 139.7650 },
    { id: "day5-art-aquarium", category: "view", name: "🎨 銀座金魚美術館 (ART AQUARIUM)", sub: "16:30–18:00 • 銀座三越 8F", desc: "夢幻金魚燈光藝術展，結合日式傳統美學與現代沉浸燈光秀。", img: "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=400&q=80", mapQuery: "ART AQUARIUM GINZA", lat: 35.6715, lng: 139.7650 },
    { id: "day5-dinner-ginza", category: "food", name: "🥩 晚餐：銀座豬排 / 花山烏龍麵 / 人形町今半", sub: "晚餐 • 銀座 / 日本橋", desc: "享受極致寬麵花山烏龍麵、酥脆厚切豬排或百年壽喜燒老店人形町今半。", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80", mapQuery: "花山烏龍麵 銀座", lat: 35.6702, lng: 139.7675 },

    // DAY 6 (09/09 三)
    { id: "day6-kimono-asakusa", category: "shrine", name: "👘 淺草月見和服/浴衣 ➔ 淺草神社", sub: "預約 09:00 • 淺草神社合照", desc: "換上精緻日式浴衣/和服，前往淺草神社與被官稻荷神社參拜拍照。", img: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=400&q=80", mapQuery: "淺草神社", lat: 35.7153, lng: 139.7968 },
    { id: "day6-owl-cafe", category: "park", name: "🦉 秋葉原貓頭鷹咖啡館 (Akiba Fukurou)", sub: "上午 • 千代田區神田練塀町", desc: "療癒系互動體驗，近距離接觸與餵食可愛貓頭鷹。", img: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=400&q=80", mapQuery: "Akiba Fukurou", lat: 35.6997, lng: 139.7745 },
    { id: "day6-koami-shrine", category: "shrine", name: "💰 日本橋 小網神社強運洗錢", sub: "中午 • 中央區日本橋小網町 16-23", desc: "東京超強運洗錢神社！參拜洗錢井（銭洗いの井）求財運與厄除。", img: "https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=400&q=80", mapQuery: "小網神社", lat: 35.6853, lng: 139.7801 },
    { id: "day6-skytree-pokemon", category: "shopping", name: "🗼 晴空塔商圈與最後採買", sub: "下午 • 東京晴空塔 Solamachi", desc: "寶可夢中心晴空塔店、採買祇園辻利頂級抹茶粉與伴手禮。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "東京晴空塔", lat: 35.7101, lng: 139.8107 },
    { id: "day6-airport-return", category: "view", name: "✈️ 歸還浴衣 ➔ 京成 Access 直達成田機場", sub: "傍晚 • 押上站 ➔ 成田機場 22:15 MM627", desc: "歸還浴衣，於押上站搭乘京成 Skyaccess 直達成田機場，搭乘 22:15 MM627 航班返台。", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", mapQuery: "押上站", lat: 35.7107, lng: 139.8130 }
];

const DAY_TITLES = {
    1: "🗓️ 09/04 (五) Day 1：落地入境 ➔ 淺草夜巡 ➔ 觀光巴士 ➔ 豐洲溫泉",
    2: "🗓️ 09/05 (六) Day 2：潮見龍宮社 ➔ 台場 VR ➔ 品川水族館夜間秀",
    3: "🗓️ 09/06 (日) Day 3：弓道體驗 ➔ 池袋太陽城爆買",
    4: "🗓️ 09/07 (一) Day 4：吉卜力美術館 ➔ 吉祥寺 ➔ 表參道與原宿",
    5: "🗓️ 09/08 (二) Day 5：江戶東京建築園 ➔ 銀座/日本橋 ➔ 金魚美術館",
    6: "🗓️ 09/09 (三) Day 6：淺草浴衣 ➔ 貓頭鷹咖啡 ➔ 洗錢神社 ➔ 晴空塔 ➔ 返台"
};

function getDefaultItinerary() {
    return {
        1: [DEFAULT_PLACES[0], DEFAULT_PLACES[1], DEFAULT_PLACES[2], DEFAULT_PLACES[3], DEFAULT_PLACES[4]],
        2: [DEFAULT_PLACES[5], DEFAULT_PLACES[6], DEFAULT_PLACES[7], DEFAULT_PLACES[8]],
        3: [DEFAULT_PLACES[9], DEFAULT_PLACES[10], DEFAULT_PLACES[11], DEFAULT_PLACES[12]],
        4: [DEFAULT_PLACES[13], DEFAULT_PLACES[14], DEFAULT_PLACES[15]],
        5: [DEFAULT_PLACES[16], DEFAULT_PLACES[17], DEFAULT_PLACES[18], DEFAULT_PLACES[19]],
        6: [DEFAULT_PLACES[20], DEFAULT_PLACES[21], DEFAULT_PLACES[22], DEFAULT_PLACES[23], DEFAULT_PLACES[24]]
    };
}

// 🔒 安全與唯讀不可變之官方原廠預設範本 (MASTER BASELINE - IMMUTABLE)
const OFFICIAL_DEFAULT_PLACES = Object.freeze(JSON.parse(JSON.stringify(DEFAULT_PLACES)));

function getOfficialDefaultItinerary() {
    return JSON.parse(JSON.stringify(getDefaultItinerary()));
}

window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
window.itinerary = getOfficialDefaultItinerary();
window.wishlist = [];

let currentCategory = 'all';
let currentDay = 1;
