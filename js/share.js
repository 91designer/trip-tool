// -------------------------------------------------------------
// 🔗 ITINERARY MULTI-CHANNEL SHARE ENGINE & CLOUD SERVER LINK
// -------------------------------------------------------------

function openShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.remove('hidden');
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.add('hidden');
}

// ⚡ 短網址縮短服務 API 轉換器 (TinyURL / Client-side fallback)
async function getShortUrl(longUrl) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            const shortUrl = await res.text();
            if (shortUrl && shortUrl.startsWith('http')) return shortUrl.trim();
        }
    } catch(e) {
        console.warn("Short URL service bypassed, using standard URL:", e);
    }
    return longUrl;
}

// 1. Google 雲端硬碟 (Google Sheet) 伺服器一鍵連線短網址
async function copyGoogleDriveCloudLink() {
    try {
        const sheetId = (typeof extractSheetId === 'function') ? extractSheetId(googleSheetId) : googleSheetId;
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const cloudUrl = `${baseUrl}?sheet=${sheetId}`;
        
        const finalUrl = await getShortUrl(cloudUrl);

        navigator.clipboard.writeText(finalUrl).then(() => {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert(`成功複製 Google 雲端伺服器連線短網址！\n\n網址：${finalUrl}\n\n只要將此短連結傳給朋友，朋友點開即會自動連線至您的 Google 雲端硬碟試算表，自動載入最新行程與地圖！`, '🌐');
            }
        }).catch(() => {
            prompt('請複製下方 Google 雲端連線短網址傳給朋友：', finalUrl);
        });
    } catch(e) {
        console.error("Cloud URL error:", e);
    }
}

// 2. 獨立生成與複製完整資料快照短網址 (URL Hash Share)
async function copyShareableLink() {
    try {
        const payload = {
            places: window.placesDatabase,
            itinerary: window.itinerary,
            v: 1
        };
        const jsonStr = JSON.stringify(payload);
        const encodedStr = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
        const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encodedStr}`;

        const finalUrl = await getShortUrl(shareUrl);

        navigator.clipboard.writeText(finalUrl).then(() => {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert(`已成功將專屬行程數據快照短網址複製至剪貼簿！\n\n網址：${finalUrl}\n\n包含您所有自訂的 6 日景點與路線，可以直接傳送給夥伴開啟！`, '🔗');
            }
        }).catch(() => {
            prompt('請複製下方短網址分享給朋友：', finalUrl);
        });
    } catch(e) {
        console.error("Failed to generate share URL:", e);
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('行程資料較龐大，建議使用「🌐 複製 Google 雲端連線網址」或「📋 複製文字版行程」進行分享！', '💡');
        }
    }
}

// 3. 複製 LINE / Messenger 友善文字版行程
function copyTextItinerary() {
    try {
        let text = `⛩️【東京 6 日冒險攻略 RPG Guide - 我的冒險行程】\n`;
        text += `------------------------------------\n`;

        for (let d = 1; d <= 6; d++) {
            const title = (DAY_TITLES && DAY_TITLES[d]) ? DAY_TITLES[d] : `Day ${d}`;
            text += `\n${title}\n`;
            const places = window.itinerary[d] || [];
            if (places.length === 0) {
                text += `  (尚無排定行程)\n`;
            } else {
                places.forEach((p, idx) => {
                    const catIcon = (CATEGORY_ICONS && CATEGORY_ICONS[p.category]) ? CATEGORY_ICONS[p.category] : '📍';
                    text += `  ${idx + 1}. ${catIcon} ${p.name}\n`;
                    if (p.sub) text += `     └ ${p.sub}\n`;
                });
            }
        }
        text += `\n------------------------------------\n`;
        text += `✨ 祝冒險順利！整理自 東京冒險攻略手冊 RPG Guide`;

        navigator.clipboard.writeText(text).then(() => {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('已成功將文字版行程複製至剪貼簿！可以直接貼上至 LINE、微信或 Messenger 群組與夥伴討論！', '📋');
            }
        }).catch(() => {
            prompt('請複製下方文字行程：', text);
        });
    } catch (e) {
        console.error("Text export error:", e);
    }
}

// 4. 自動偵測與解析 URL Query (?sheet=...) 或 Hash (#share=...)
function checkAndLoadSharedUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const querySheetId = urlParams.get('sheet') || urlParams.get('id');

    if (querySheetId) {
        googleSheetId = querySheetId;
        if (typeof saveData === 'function') saveData();
        if (typeof syncFromGoogleSheet === 'function') {
            syncFromGoogleSheet(false);
        }
        return;
    }

    if (window.location.hash && window.location.hash.includes('#share=')) {
        try {
            const hashVal = window.location.hash.split('#share=')[1];
            if (!hashVal) return;

            const decodedStr = decodeURIComponent(escape(atob(decodeURIComponent(hashVal))));
            const payload = JSON.parse(decodedStr);

            if (payload && payload.places && payload.itinerary) {
                window.placesDatabase = payload.places;
                window.itinerary = payload.itinerary;

                if (typeof saveData === 'function') saveData();
                if (typeof renderPlaces === 'function') renderPlaces();
                if (typeof renderItinerary === 'function') renderItinerary();
                if (typeof renderMapMarkers === 'function') renderMapMarkers();

                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('🎉 已成功從分享連結載入夥伴的東京 6 日冒險行程與地圖路線！', '🗺️');
                }
            }
        } catch(e) {
            console.warn("Invalid shared URL hash:", e);
        }
    }
}

// 開啟頁面時自動偵測
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkAndLoadSharedUrl, 300);
});
