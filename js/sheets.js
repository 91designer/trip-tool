// -------------------------------------------------------------
// 📊 GOOGLE SHEET MULTI-TIER FETCH & RESILIENT PARSER ENGINE
// -------------------------------------------------------------

function extractSheetId(input) {
    if (!input) return googleSheetId;
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) return match[1];
    return input.trim();
}

async function syncFromGoogleSheet(isSilent = false) {
    if (!isSilent && typeof playSfx === 'function') playSfx('click');

    const activeSheetId = extractSheetId(googleSheetId);
    
    try {
        // Method 1: Try Google Visualization API via JSONP
        const jsonpSuccess = await fetchViaJSONP(activeSheetId, isSilent);
        if (jsonpSuccess) return;

        // Method 2: Try CORS Proxy
        const proxySuccess = await fetchViaCORSProxy(activeSheetId, isSilent);
        if (proxySuccess) return;

        if (!isSilent) {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('無法從線上拉取 Google 試算表，請確認共用權限為「知道連結的任何人皆可檢視」，或使用 ⚙️ 按鈕直接貼上內容！', '⚠️');
            }
            if (typeof openSheetSettingsModal === 'function') openSheetSettingsModal();
        }
    } catch (err) {
        console.error("Sync error:", err);
        if (!isSilent && typeof showCustomAlert === 'function') {
            showCustomAlert('同步過程發生非預期錯誤，已自動保護您的現有行程資料！', '🛡️');
        }
    }
}

function fetchViaJSONP(sheetId, isSilent) {
    return new Promise((resolve) => {
        const callbackName = 'gVizCallback_' + Math.floor(Math.random() * 100000);
        let isResolved = false;

        const timeout = setTimeout(() => {
            if (!isResolved) {
                cleanup();
                resolve(false);
            }
        }, 5000);

        function cleanup() {
            try {
                delete window[callbackName];
                const script = document.getElementById(callbackName);
                if (script) script.remove();
            } catch(e){}
        }

        window[callbackName] = function(response) {
            isResolved = true;
            clearTimeout(timeout);
            cleanup();

            if (!response || !response.table) {
                resolve(false);
                return;
            }

            try {
                const table = response.table;
                const headers = (table.cols || []).map(c => (c.label || c.id || '').trim().toLowerCase());
                
                const rows = (table.rows || []).map(r => {
                    if (!r || !r.c) return [];
                    return r.c.map(cell => cell ? (cell.v !== null && cell.v !== undefined ? String(cell.v) : (cell.f || '')) : '');
                });

                const parsedData = processParsedSheetData(headers, rows);
                if (parsedData.count > 0) {
                    if (!isSilent) {
                        if (typeof playSfx === 'function') playSfx('fanfare');
                        if (typeof showCustomAlert === 'function') {
                            const sampleText = parsedData.names.slice(0, 3).join('、 ') + (parsedData.names.length > 3 ? '...等' : '');
                            showCustomAlert(`成功同步試算表！已載入 ${parsedData.count} 筆景點：\n${sampleText}`, '🎉');
                        }
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.warn("JSONP parse error:", e);
                resolve(false);
            }
        };

        try {
            const script = document.createElement('script');
            script.id = callbackName;
            script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}`;
            script.onerror = () => {
                if (!isResolved) {
                    clearTimeout(timeout);
                    cleanup();
                    resolve(false);
                }
            };
            document.head.appendChild(script);
        } catch (e) {
            clearTimeout(timeout);
            cleanup();
            resolve(false);
        }
    });
}

async function fetchViaCORSProxy(sheetId, isSilent) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`
    ];

    for (const proxyUrl of proxies) {
        try {
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const csvText = await res.text();
                if (csvText && !csvText.includes('<!DOCTYPE html>') && csvText.length > 20) {
                    const parsedRows = parseCSV(csvText);
                    if (parsedRows.length >= 1) {
                        const headers = parsedRows[0].map(h => h.trim().toLowerCase());
                        const rows = parsedRows.length > 1 ? parsedRows.slice(1) : parsedRows;
                        const parsedData = processParsedSheetData(headers, rows);
                        if (parsedData.count > 0) {
                            if (!isSilent) {
                                if (typeof playSfx === 'function') playSfx('fanfare');
                                if (typeof showCustomAlert === 'function') {
                                    const sampleText = parsedData.names.slice(0, 3).join('、 ') + (parsedData.names.length > 3 ? '...等' : '');
                                    showCustomAlert(`[代理同步成功] 已成功整合 ${parsedData.count} 筆景點：\n${sampleText}`, '🎉');
                                }
                            }
                            return true;
                        }
                    }
                }
            }
        } catch(e) {
            console.warn("Proxy fetch error:", e);
        }
    }
    return false;
}

// 智慧與寬鬆防呆表格解析機器 (1. 堅持使用真實地點名稱; 2. 徹底隔離/安全化 Sheet 代碼避免影響系統執行)
function processParsedSheetData(headers, rows) {
    if (!rows || rows.length === 0) return { count: 0, names: [] };

    try {
        let codeIdx = headers.findIndex(h => /^代碼$|^編號$|^id$|^code$/i.test(h));
        let catIdx = headers.findIndex(h => /類別|分類|屬性|標籤|cat|category|type|tag/i.test(h));
        let nameIdx = headers.findIndex(h => /(?:景點|店名|地點|名稱|標題|title|項目|主線|^name$)/i.test(h));
        
        // 若 nameIdx 誤對應到 code 欄位，強制重置 nameIdx
        if (nameIdx !== -1 && nameIdx === codeIdx) nameIdx = -1;

        let subIdx = headers.findIndex(h => /時間|地址|sub|地點|位置|時段/i.test(h));
        let descIdx = headers.findIndex(h => /描述|desc|特色|備註|說明|內容/i.test(h));
        let queryIdx = headers.findIndex(h => /搜尋|query|google|地圖/i.test(h));
        let dayIdx = headers.findIndex(h => /天|day|日|日程|天數/i.test(h));
        let latIdx = headers.findIndex(h => /緯度|lat/i.test(h));
        let lngIdx = headers.findIndex(h => /經度|lng/i.test(h));
        let imgIdx = headers.findIndex(h => /圖|img|image|照片/i.test(h));

        // 如果第一列內容包含關鍵字，識別為表頭
        if (nameIdx === -1 && rows.length > 0) {
            const firstRowStr = (rows[0] || []).join(' ').toLowerCase();
            if (/名稱|景點|店名|地點|項目|地址|時間|天數|類別|分類|category/.test(firstRowStr)) {
                const newHeaders = rows[0].map(c => String(c).trim().toLowerCase());
                codeIdx = newHeaders.findIndex(h => /^代碼$|^編號$|^id$|^code$/i.test(h));
                catIdx = newHeaders.findIndex(h => /類別|分類|屬性|標籤|cat|category|type|tag/i.test(h));
                nameIdx = newHeaders.findIndex(h => /(?:景點|店名|地點|名稱|標題|title|項目|主線|^name$)/i.test(h));
                if (nameIdx !== -1 && nameIdx === codeIdx) nameIdx = -1;

                subIdx = newHeaders.findIndex(h => /時間|地址|sub|地點|位置|時段/i.test(h));
                descIdx = newHeaders.findIndex(h => /描述|desc|特色|備註|說明|內容/i.test(h));
                queryIdx = newHeaders.findIndex(h => /搜尋|query|google|地圖/i.test(h));
                dayIdx = newHeaders.findIndex(h => /天|day|日|日程|天數/i.test(h));
                latIdx = newHeaders.findIndex(h => /緯度|lat/i.test(h));
                lngIdx = newHeaders.findIndex(h => /經度|lng/i.test(h));
                imgIdx = newHeaders.findIndex(h => /圖|img|image|照片/i.test(h));
                rows = rows.slice(1);
            }
        }

        const headerIsData = (nameIdx === -1 && catIdx === -1 && dayIdx === -1 && subIdx === -1);
        const allRows = headerIsData ? [headers, ...rows] : rows;

        const fetchedPlaces = [];
        const sheetItinerary = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

        const TOKYO_SPOTS = [
            { keywords: ['淺草', '雷門', '仲見世'], lat: 35.7148, lng: 139.7967 },
            { keywords: ['銀座', 'ginza'], lat: 35.6715, lng: 139.7650 },
            { keywords: ['豐洲', '萬葉'], lat: 35.6453, lng: 139.7806 },
            { keywords: ['品川', 'aqua'], lat: 35.6285, lng: 139.7386 },
            { keywords: ['台場', 'immersive', '台場海濱'], lat: 35.6277, lng: 139.7788 },
            { keywords: ['潮見', '龍宮'], lat: 35.6582, lng: 139.8173 },
            { keywords: ['錦絲町', '錦糸町'], lat: 35.6961, lng: 139.8143 },
            { keywords: ['哈利波特', '練馬', '豐島園'], lat: 35.7431, lng: 139.6465 },
            { keywords: ['池袋', '太陽城', 'sunshine', 'animate'], lat: 35.7289, lng: 139.7193 },
            { keywords: ['迪士尼', 'disney', '舞濱'], lat: 35.6329, lng: 139.8804 },
            { keywords: ['三鷹', '吉卜力', '宮崎駿'], lat: 35.6963, lng: 139.5704 },
            { keywords: ['井之頭', '吉祥寺'], lat: 35.6997, lng: 139.5762 },
            { keywords: ['建築園', '小金井'], lat: 35.7163, lng: 139.5126 },
            { keywords: ['小網神社', '日本橋'], lat: 35.6853, lng: 139.7801 },
            { keywords: ['寶可夢咖啡', 'pokemon cafe'], lat: 35.6808, lng: 139.7731 },
            { keywords: ['晴空塔', '押上', 'skytree'], lat: 35.7101, lng: 139.8107 },
            { keywords: ['新宿'], lat: 35.6938, lng: 139.7034 },
            { keywords: ['澀谷', 'shibuya'], lat: 35.6580, lng: 139.7016 },
            { keywords: ['秋葉原'], lat: 35.6983, lng: 139.7731 },
            { keywords: ['成田', 'nrt'], lat: 35.7720, lng: 140.3929 }
        ];

        function mapSheetCategoryStrictly(rawCategoryStr) {
            if (!rawCategoryStr) return 'view';
            const s = String(rawCategoryStr).trim().toLowerCase();

            if (/神|社|宮|鳥居|洗錢|拜|厄除|稻荷|shrine/i.test(s)) return 'shrine';
            if (/茶|抹茶|百匯|刨冰|大福|拿鐵|甜點|matcha/i.test(s)) return 'matcha';
            if (/燒肉|和牛|牛舌|文字燒|漢堡排|拉麵|味噌|肉|餐|食|饌|蓋飯|鰻魚|屋形船|牛肉|居酒屋|美食|food/i.test(s)) return 'food';
            if (/樂園|迪士尼|水族館|影城|沉浸|溫泉|萬葉|球場|賽車|vr|park|體驗|service/i.test(s)) return 'park';
            if (/購|買|扭蛋|商店|太陽城|animate|寶可夢|旗艦店|商圈|採買|百貨|shopping/i.test(s)) return 'shopping';
            if (/景|view|📷|展|館|朝聖|觀光|anime|聖地/i.test(s)) return 'view';

            return 'view';
        }

        for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i];
            if (!row || row.length === 0) continue;

            let name = '';
            let category = 'view';
            let sub = '';
            let desc = '';
            let dayNum = 0;
            let lat = null;
            let lng = null;
            let img = '';
            let rawCode = (codeIdx !== -1 && row[codeIdx]) ? String(row[codeIdx]).trim() : '';

            // 1. 確保名稱優先取用真實地點/景點名稱 (若 nameIdx 為 codeIdx 或是空白則過濾)
            if (nameIdx !== -1 && nameIdx !== codeIdx && row[nameIdx]) {
                const candName = String(row[nameIdx]).trim();
                const isCodePattern = /^(?:place|custom|day\d|wish|spot|item|code|id|[a-z0-9_-]{3,20}$)/i.test(candName) && !/[\u4e00-\u9fa5]/.test(candName);
                if (!isCodePattern) {
                    name = candName;
                }
            }

            // 若 name 仍空白或對應到代碼，自動搜尋真正地點名稱（跳過代碼欄位與代碼特徵）
            if (!name) {
                for (let c = 0; c < row.length; c++) {
                    if (c === codeIdx) continue; // 徹底隔離 Sheet 代碼欄位
                    const text = String(row[c]).trim();

                    const isCodePattern = /^(?:place|custom|day\d|wish|spot|item|code|id|[a-z0-9_-]{3,20}$)/i.test(text) && !/[\u4e00-\u9fa5]/.test(text);
                    const isDayPattern = /^(?:d|day|第)?\s*[1-6]$/i.test(text);
                    const isNum = !isNaN(parseFloat(text));

                    if (text && !isCodePattern && !isDayPattern && !isNum) {
                        name = text;
                        break;
                    }
                }
            }

            if (!name || name.length < 2) continue; // 找不到有效地點名稱則安全跳過

            // 2. 100% 依據試算表【類別】欄位內容分類，完全不依據店名猜測！
            if (catIdx !== -1 && row[catIdx] && String(row[catIdx]).trim()) {
                category = mapSheetCategoryStrictly(row[catIdx]);
            } else {
                category = 'view';
            }

            if (subIdx !== -1 && row[subIdx] && subIdx !== codeIdx) sub = String(row[subIdx]).trim();
            else {
                const otherCells = row.filter((c, idx) => idx !== nameIdx && idx !== catIdx && idx !== dayIdx && idx !== codeIdx && String(c).trim() !== name);
                if (otherCells[0]) sub = String(otherCells[0]).trim();
                if (otherCells[1]) desc = String(otherCells[1]).trim();
            }

            if (descIdx !== -1 && row[descIdx] && descIdx !== codeIdx) desc = String(row[descIdx]).trim();

            row.forEach((cell, cellIdx) => {
                if (cellIdx === codeIdx) return;
                const str = String(cell).trim();
                if (!str) return;

                const dayMatch = str.match(/(?:d|day|第|d-?)\s*([1-6])/i) || (cellIdx === dayIdx ? str.match(/([1-6])/) : null);
                if (dayMatch && !dayNum) {
                    dayNum = parseInt(dayMatch[1]);
                }

                const num = parseFloat(str);
                if (!isNaN(num)) {
                    if (num > 30 && num < 40 && !lat) lat = num;
                    if (num > 130 && num < 145 && !lng) lng = num;
                }

                if (/^https?:\/\/.*\.(jpeg|jpg|gif|png|webp)/i.test(str) && !img) {
                    img = str;
                }
            });

            if (!lat || !lng) {
                const fullText = (name + ' ' + sub + ' ' + desc).toLowerCase();
                const matchedSpot = TOKYO_SPOTS.find(spot => spot.keywords.some(kw => fullText.includes(kw.toLowerCase())));
                if (matchedSpot) {
                    lat = matchedSpot.lat;
                    lng = matchedSpot.lng;
                } else {
                    lat = 35.6812 + (Math.random() - 0.5) * 0.05;
                    lng = 139.7671 + (Math.random() - 0.5) * 0.05;
                }
            }

            // 系統自動生成/維護防呆代碼，確保執行流暢
            const safeCode = rawCode || ('SPOT_' + Math.floor(100000 + Math.random() * 900000));

            const placeItem = {
                id: 'sheet-place-' + i + '-' + Date.now(),
                code: safeCode,
                category: category,
                name: name,
                sub: sub,
                desc: desc,
                mapQuery: name,
                img: img || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
                lat: lat,
                lng: lng
            };

            fetchedPlaces.push(placeItem);

            // 🛍️ 採購與購物商品不自動放入主線行程 (放置於素材庫供使用者選擇)
            if (dayNum >= 1 && dayNum <= 6 && category !== 'shopping') {
                sheetItinerary[dayNum].push(placeItem);
            }
        }

        if (fetchedPlaces.length > 0) {
            if (!Array.isArray(window.placesDatabase)) window.placesDatabase = [];

            fetchedPlaces.forEach(newSpot => {
                const existingIdx = window.placesDatabase.findIndex(p => p.name.trim().toLowerCase() === newSpot.name.trim().toLowerCase());
                if (existingIdx === -1) {
                    window.placesDatabase.unshift(newSpot);
                } else {
                    window.placesDatabase[existingIdx] = {
                        ...window.placesDatabase[existingIdx],
                        code: newSpot.code || window.placesDatabase[existingIdx].code,
                        sub: newSpot.sub || window.placesDatabase[existingIdx].sub,
                        desc: newSpot.desc || window.placesDatabase[existingIdx].desc,
                        lat: newSpot.lat || window.placesDatabase[existingIdx].lat,
                        lng: newSpot.lng || window.placesDatabase[existingIdx].lng
                    };
                }
            });

            // 🔄 僅在 Google 試算表項目與既有主線行程名稱相符時更新備註 (不自動注入未規劃之雜項)
            for (let d = 1; d <= 6; d++) {
                if (window.itinerary[d]) {
                    window.itinerary[d] = window.itinerary[d].map(itItem => {
                        const matchedSheetSpot = fetchedPlaces.find(sp => sp.name.trim().toLowerCase() === itItem.name.trim().toLowerCase());
                        if (matchedSheetSpot) {
                            return {
                                ...itItem,
                                sub: matchedSheetSpot.sub || itItem.sub,
                                desc: matchedSheetSpot.desc || itItem.desc,
                                lat: matchedSheetSpot.lat || itItem.lat,
                                lng: matchedSheetSpot.lng || itItem.lng
                            };
                        }
                        return itItem;
                    });
                }
            }

            if (typeof currentCategory !== 'undefined') currentCategory = 'all';
            if (typeof filterCategory === 'function') filterCategory('all');
            if (typeof saveData === 'function') saveData();
            if (typeof renderPlaces === 'function') renderPlaces();
            if (typeof renderItinerary === 'function') renderItinerary();
            if (typeof renderMapMarkers === 'function') renderMapMarkers();

            const container = document.getElementById('placesContainer');
            if (container) container.scrollTop = 0;

            const namesList = fetchedPlaces.map(p => p.name);
            return { count: fetchedPlaces.length, names: namesList };
        }
        return { count: 0, names: [] };
    } catch (e) {
        console.error("Error in processParsedSheetData:", e);
        return { count: 0, names: [] };
    }
}

function parseCSV(text) {
    const lines = [];
    let row = [];
    let inQuotes = false;
    let current = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if ((char === ',' || char === '\t') && !inQuotes) {
            row.push(current.trim());
            current = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            row.push(current.trim());
            if (row.some(cell => cell.length > 0)) lines.push(row);
            row = [];
            current = '';
        } else {
            current += char;
        }
    }
    if (current || row.length > 0) {
        row.push(current.trim());
        if (row.some(cell => cell.length > 0)) lines.push(row);
    }
    return lines;
}

// AUTO-PUSH NEW PLACE TO GOOGLE SHEET (2. 自動寫入 Sheet 並自動生成代碼)
async function postNewPlaceToGoogleSheet(place, targetDay = 0) {
    const appsScriptUrl = googleAppsScriptUrl || localStorage.getItem('tokyo_quest_apps_script_url');
    if (!appsScriptUrl) {
        console.log("No Apps Script Web App URL configured for writing.");
        return false;
    }

    try {
        // 2. 系統自動生成景點代碼 (Code)
        const autoCode = place.code || ('SPOT_' + Math.floor(100000 + Math.random() * 900000));
        place.code = autoCode;

        const payload = {
            code: autoCode,
            category: place.category || 'view',
            name: place.name || '',
            sub: place.sub || '',
            desc: place.desc || '',
            day: targetDay ? `Day ${targetDay}` : '',
            mapQuery: place.mapQuery || place.name || '',
            lat: place.lat || '',
            lng: place.lng || ''
        };

        await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("Pushed new place with auto-generated code to Google Apps Script Web App successfully.");
        return true;
    } catch (e) {
        console.warn("Failed to push new place to Google Sheet:", e);
        return false;
    }
}

function updateDriveFolderLinks() {
    const folderUrl = googleDriveFolderUrl || 'https://drive.google.com/drive/folders/1MZkiA956v0goxCa7Zu4HzP1EfZZ1yKeW?usp=drive_link';
    const headerBtn = document.getElementById('googleDriveFolderBtn');
    const modalBtn = document.getElementById('modalDriveFolderLink');
    if (headerBtn) headerBtn.href = folderUrl;
    if (modalBtn) modalBtn.href = folderUrl;
}

// SHEET SETTINGS MODAL FUNCTIONS
function openSheetSettingsModal() {
    const modal = document.getElementById('sheetSettingsModal');
    const input = document.getElementById('sheetUrlInput');
    const scriptUrlInput = document.getElementById('scriptUrlInput');
    const driveUrlInput = document.getElementById('driveFolderUrlInput');
    const link = document.getElementById('sheetDirectLink');

    if (input) input.value = googleSheetId;
    if (scriptUrlInput) scriptUrlInput.value = googleAppsScriptUrl || '';
    if (driveUrlInput) driveUrlInput.value = googleDriveFolderUrl || 'https://drive.google.com/drive/folders/1MZkiA956v0goxCa7Zu4HzP1EfZZ1yKeW?usp=drive_link';
    if (link) link.href = `https://docs.google.com/spreadsheets/d/${extractSheetId(googleSheetId)}/edit`;

    updateDriveFolderLinks();
    if (modal) modal.classList.remove('hidden');
}

function closeSheetSettingsModal() {
    document.getElementById('sheetSettingsModal')?.classList.add('hidden');
}

function testAndSaveSheetUrl() {
    const val = document.getElementById('sheetUrlInput')?.value.trim();
    const scriptVal = document.getElementById('scriptUrlInput')?.value.trim();
    const driveVal = document.getElementById('driveFolderUrlInput')?.value.trim();
    
    if (val) googleSheetId = extractSheetId(val);
    if (scriptVal !== undefined) googleAppsScriptUrl = scriptVal;
    if (driveVal) googleDriveFolderUrl = driveVal;
    
    updateDriveFolderLinks();
    if (typeof saveData === 'function') saveData();
    closeSheetSettingsModal();
    if (val) syncFromGoogleSheet(false);
}

function importManualCsv() {
    const text = document.getElementById('manualCsvInput').value.trim();
    if (!text) {
        if (typeof showCustomAlert === 'function') showCustomAlert('請先在輸入框中貼上內容！', '⚠️');
        return;
    }

    const rows = parseCSV(text);
    if (rows.length < 1) {
        if (typeof showCustomAlert === 'function') showCustomAlert('無法解析貼上的內容！', '❌');
        return;
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const dataRows = rows.length > 1 ? rows.slice(1) : rows;
    const parsedData = processParsedSheetData(headers, dataRows);

    if (parsedData.count > 0) {
        if (typeof playSfx === 'function') playSfx('fanfare');
        closeSheetSettingsModal();
        const sampleText = parsedData.names.slice(0, 3).join('、 ') + (parsedData.names.length > 3 ? '...等' : '');
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(`成功解析並整合 ${parsedData.count} 筆景點：\n${sampleText}`, '🎉');
        }
    } else {
        if (typeof showCustomAlert === 'function') showCustomAlert('貼上之內容找不到有效景點名稱！', '⚠️');
    }
}
