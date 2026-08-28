// -------------------------------------------------------------
// 🎮 UI CONTROLS & RENDERING (WITH DRAG & DROP & SANITIZED NAMES)
// -------------------------------------------------------------

let draggedItemIndex = null;

function scrollToSection(id) {
    if (typeof playSfx === 'function') playSfx('click');
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 🛡️ 名稱安全過濾器 (確保素材庫與行程 100% 使用自然中文/日文景點名稱，絕不顯示代碼)
function getCleanPlaceName(place) {
    if (!place) return '未命名景點';
    const nameStr = (place.name || '').trim();
    
    // 判斷是否為系統代碼 (例如: SPOT_XXXX, day1-checkin, code123)
    const isCode = /^(?:SPOT_[A-Z0-9]+|day\d+[-_]?\w*|place\d*|code\d*|item\d*)$/i.test(nameStr) && !/[\u4e00-\u9fa5]/.test(nameStr);
    
    if (isCode || !nameStr) {
        if (place.sub && /[\u4e00-\u9fa5]/.test(place.sub)) {
            return place.sub;
        }
        if (typeof OFFICIAL_DEFAULT_PLACES !== 'undefined') {
            const masterItem = OFFICIAL_DEFAULT_PLACES.find(p => String(p.id) === String(place.id));
            if (masterItem && masterItem.name) return masterItem.name;
        }
        return '東京熱門景點';
    }
    return nameStr;
}

function getDayTitle(dayNum) {
    if (window.tripConfig && window.tripConfig.customDayTitles && window.tripConfig.customDayTitles[dayNum]) {
        return window.tripConfig.customDayTitles[dayNum];
    }
    if (typeof DAY_TITLES !== 'undefined' && DAY_TITLES[dayNum]) {
        return DAY_TITLES[dayNum];
    }
    
    const startDateStr = (window.tripConfig && window.tripConfig.startDate) ? window.tripConfig.startDate : '2026-09-04';
    try {
        const parts = startDateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            date.setDate(date.getDate() + (dayNum - 1));
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const weekDay = weekDays[date.getDay()];
            return `🗓️ ${month}/${day} (${weekDay}) Day ${dayNum} 冒險行程`;
        }
    } catch(e){}
    return `🗓️ Day ${dayNum} 冒險行程`;
}

function renderDayTabs() {
    const container = document.getElementById('dayTabsContainer');
    if (!container) return;

    const totalDays = (window.tripConfig && window.tripConfig.totalDays) ? window.tripConfig.totalDays : 6;

    let html = '';
    for (let d = 1; d <= totalDays; d++) {
        const isActive = d === currentDay;
        const btnClass = isActive 
            ? 'px-2.5 py-1 bg-amber-500 text-slate-950 font-bold border border-amber-300 rounded shrink-0'
            : 'px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-600 rounded hover:bg-slate-700 shrink-0';
        html += `<button onclick="playSfx('click'); selectDay(${d})" id="dayBtn-${d}" class="${btnClass}">D${d}</button>`;
    }
    container.innerHTML = html;
}

function selectDay(day) {
    currentDay = day;
    const totalDays = (window.tripConfig && window.tripConfig.totalDays) ? window.tripConfig.totalDays : 6;
    for (let d = 1; d <= totalDays; d++) {
        const btn = document.getElementById(`dayBtn-${d}`);
        if (btn) {
            btn.className = (d === day) 
                ? "px-2.5 py-1 bg-amber-500 text-slate-950 font-bold border border-amber-300 rounded shrink-0" 
                : "px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-600 rounded hover:bg-slate-700 shrink-0";
        }
    }
    
    const titleEl = document.getElementById('currentDayTitle');
    if (titleEl) {
        titleEl.textContent = getDayTitle(day);
    }

    renderItinerary();
    renderMapMarkers();
}

function filterCategory(cat) {
    currentCategory = cat;
    ['all', 'shrine', 'matcha', 'food', 'view', 'park', 'shopping'].forEach(c => {
        const btn = document.getElementById(`btn-cat-${c}`);
        if (btn) {
            if (c === cat) {
                btn.className = "pixel-btn text-[11px] py-1 px-2 border-amber-400 text-amber-300 font-bold";
            } else {
                btn.className = "pixel-btn text-[11px] py-1 px-2";
            }
        }
    });
    renderPlaces();
}

// 🎒 冒險圖鑑與素材庫繪製 (支援關鍵字搜尋、代碼淨化與圖片備援)
function renderPlaces() {
    const container = document.getElementById('placesContainer');
    if (!container) return;

    const searchInput = document.getElementById('placeSearchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filtered = currentCategory === 'all' 
        ? window.placesDatabase 
        : window.placesDatabase.filter(p => p.category === currentCategory);

    if (query) {
        filtered = filtered.filter(p => {
            const cleanName = getCleanPlaceName(p).toLowerCase();
            return cleanName.includes(query) ||
                (p.sub && p.sub.toLowerCase().includes(query)) ||
                (p.desc && p.desc.toLowerCase().includes(query));
        });
    }

    const countEl = document.getElementById('placeTotalCount');
    if (countEl) countEl.textContent = `${filtered.length} ITEMS`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-500 font-pixel-jp text-xs">⚔️ 尚無符合條件的景點或素材</div>`;
        return;
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80';

    container.innerHTML = filtered.map(place => {
        const displayName = getCleanPlaceName(place);
        const categoryIcon = (CATEGORY_ICONS && CATEGORY_ICONS[place.category]) ? CATEGORY_ICONS[place.category] : '📍';
        const mapSearchUrl = typeof getGoogleMapsUrl === 'function' 
            ? getGoogleMapsUrl(place) 
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery || displayName)}`;
        const safeId = String(place.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const imgSrc = place.img || fallbackImg;

        return `
            <div class="pixel-box p-2.5 rounded flex flex-col gap-2 hover:border-slate-500 transition">
                <div class="flex gap-2.5 cursor-pointer" onclick="focusMapOnPlace('${safeId}')" title="點擊在動態地圖上定位">
                    <img src="${imgSrc}" alt="${displayName}" loading="lazy" class="w-16 h-16 object-cover rounded border border-slate-700 bg-slate-900 shrink-0" onerror="this.onerror=null; this.src='${fallbackImg}';">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1">
                            <h3 class="font-bold text-amber-300 text-xs md:text-sm font-pixel-jp truncate">${displayName}</h3>
                            <span class="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-pixel-en shrink-0">${categoryIcon}</span>
                        </div>
                        <p class="text-[11px] text-sky-300 truncate mt-0.5">${place.sub || ''}</p>
                        <p class="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">${place.desc || ''}</p>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-800 text-xs flex-wrap gap-1">
                    <div class="flex items-center gap-2">
                        <button onclick="focusMapOnPlace('${safeId}')" class="text-sky-300 hover:text-sky-200 hover:underline flex items-center gap-1 text-[11px] font-pixel-jp" title="在地圖上聚焦此景點">
                            <i class="fa-solid fa-crosshairs text-sky-400"></i> 定位
                        </button>
                        <a href="${mapSearchUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-pixel-jp">
                            <i class="fa-solid fa-location-arrow"></i> 導航
                        </a>
                    </div>
                    <div class="flex items-center gap-1 font-pixel-en text-[10px] overflow-x-auto">
                        <span class="text-slate-400 mr-0.5 shrink-0">裝備至:</span>
                        ${Array.from({length: (window.tripConfig && window.tripConfig.totalDays) ? window.tripConfig.totalDays : 6}, (_, i) => i + 1).map(d => `<button onclick="addToItinerary('${safeId}', ${d})" class="px-1 py-0.5 bg-sky-950 border border-sky-600 text-sky-300 rounded hover:bg-sky-800 shrink-0">D${d}</button>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 🔄 ITINERARY DRAG & DROP & REORDERING HANDLERS
// -------------------------------------------------------------

function moveItineraryItem(fromIndex, toIndex) {
    const list = window.itinerary[currentDay];
    if (!list || fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return;
    const [movedItem] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, movedItem);
    saveData();
    renderItinerary();
    renderMapMarkers();
    if (typeof playSfx === 'function') playSfx('click');
}

function handleItineraryDragStart(e, index) {
    draggedItemIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-40', 'border-amber-400');
}

function handleItineraryDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleItineraryDrop(e, dropIndex) {
    e.preventDefault();
    if (draggedItemIndex !== null && draggedItemIndex !== dropIndex) {
        moveItineraryItem(draggedItemIndex, dropIndex);
    }
}

function handleItineraryDragEnd(e) {
    draggedItemIndex = null;
    e.currentTarget.classList.remove('opacity-40', 'border-amber-400');
}

function updateItineraryNote(index, newNote) {
    const dayItems = window.itinerary[currentDay];
    if (!dayItems || !dayItems[index]) return;
    dayItems[index].sub = newNote;
    saveData();
}

// 📜 主線行程與拖曳排序繪製
function renderItinerary() {
    const container = document.getElementById('itineraryContainer');
    if (!container) return;

    const dayItems = window.itinerary[currentDay] || [];
    const countEl = document.getElementById('dayItemCount');
    if (countEl) countEl.textContent = `${dayItems.length} QUESTS`;

    const titleEl = document.getElementById('currentDayTitle');
    if (titleEl) {
        titleEl.textContent = DAY_TITLES[currentDay] || `🗓️ 第 ${currentDay} 天冒險計畫`;
    }

    if (dayItems.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-500 font-pixel-jp text-xs border-2 border-dashed border-slate-800 rounded">
                🛡️ 第 ${currentDay} 天尚未裝備任何景點，請從左側素材庫或地圖新增！
            </div>
        `;
        return;
    }

    container.innerHTML = dayItems.map((item, index) => {
        const displayName = getCleanPlaceName(item);
        const safeId = String(item.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const mapSearchUrl = typeof getGoogleMapsUrl === 'function' 
            ? getGoogleMapsUrl(item) 
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery || displayName)}`;

        const isFirst = index === 0;
        const isLast = index === dayItems.length - 1;
        const safeSub = (item.sub || '').replace(/"/g, '&quot;');

        return `
            <div draggable="true" 
                ondragstart="handleItineraryDragStart(event, ${index})" 
                ondragover="handleItineraryDragOver(event)" 
                ondrop="handleItineraryDrop(event, ${index})" 
                ondragend="handleItineraryDragEnd(event)" 
                class="bg-slate-900 border border-sky-800/80 p-2 rounded flex items-center justify-between gap-2 hover:border-sky-500 transition cursor-grab active:cursor-grabbing group">
                
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span class="text-slate-500 group-hover:text-amber-400 font-bold select-none text-sm cursor-grab" title="按住拖曳排序">⣿</span>
                    
                    <span class="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-pixel-en font-bold text-[10px] flex items-center justify-center shrink-0">
                        ${index + 1}
                    </span>

                    <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-amber-300 text-xs font-pixel-jp truncate cursor-pointer hover:text-amber-200" onclick="focusMapOnPlace('${safeId}')" title="點擊在地圖上定位此景點">${displayName}</h4>
                        <input type="text" 
                            value="${safeSub}" 
                            placeholder="✏️ 點擊自由輸入備註/時間安排..." 
                            oninput="updateItineraryNote(${index}, this.value)"
                            onchange="updateItineraryNote(${index}, this.value)"
                            onclick="event.stopPropagation()"
                            class="itinerary-note-input mt-0.5"
                            title="主線行程藍色備註（可自由點擊編輯）">
                    </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0 text-xs font-pixel-jp">
                    <div class="flex flex-col gap-0.5">
                        <button onclick="moveItineraryItem(${index}, ${index - 1})" class="${isFirst ? 'opacity-20 cursor-not-allowed' : 'hover:text-amber-300 text-slate-400'} p-0.5 text-[9px]" ${isFirst ? 'disabled' : ''} title="向上移動">
                            <i class="fa-solid fa-chevron-up"></i>
                        </button>
                        <button onclick="moveItineraryItem(${index}, ${index + 1})" class="${isLast ? 'opacity-20 cursor-not-allowed' : 'hover:text-amber-300 text-slate-400'} p-0.5 text-[9px]" ${isLast ? 'disabled' : ''} title="向下移動">
                            <i class="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>

                    <button onclick="focusMapOnPlace('${safeId}')" class="pixel-btn text-[10px] py-0.5 px-1.5 text-sky-300" title="在地圖上定位">
                        🎯 定位
                    </button>
                    <a href="${mapSearchUrl}" target="_blank" rel="noopener noreferrer" class="pixel-btn text-[10px] py-0.5 px-1.5 text-emerald-400">
                        📍 導航
                    </a>
                    <button onclick="removeFromItinerary('${safeId}')" class="text-slate-500 hover:text-rose-400 text-xs px-1" title="從行程移除">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function addToItinerary(placeId, day) {
    const place = window.placesDatabase.find(p => String(p.id) === String(placeId));
    if (!place) return;

    if (!window.itinerary[day]) window.itinerary[day] = [];
    
    if (!window.itinerary[day].some(p => String(p.id) === String(placeId))) {
        window.itinerary[day].push(place);
        saveData();
        renderItinerary();
        renderMapMarkers();
        playSfx('equip');
        showCustomAlert(`已將「${getCleanPlaceName(place)}」裝備至 第 ${day} 天行程！`, '⚔️');
    } else {
        showCustomAlert(`「${getCleanPlaceName(place)}」已在 第 ${day} 天行程中！`, '⚠️');
    }
}

function removeFromItinerary(placeId) {
    if (!window.itinerary[currentDay]) return;
    window.itinerary[currentDay] = window.itinerary[currentDay].filter(p => String(p.id) !== String(placeId));
    saveData();
    renderItinerary();
    renderMapMarkers();
    playSfx('delete');
}

// -------------------------------------------------------------
// ➕ MODAL CONTROLS: ADD NEW PLACE / SPOT (發現新景點修復)
// -------------------------------------------------------------

function openAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    if (modal) modal.classList.remove('hidden');
}

function closeAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    if (modal) modal.classList.add('hidden');
}

async function saveNewPlace() {
    const nameInput = document.getElementById('newName');
    const catInput = document.getElementById('newCategory');
    const subInput = document.getElementById('newSub');
    const descInput = document.getElementById('newDesc');
    const dayInput = document.getElementById('newDay') || document.getElementById('newDayTarget');
    const queryInput = document.getElementById('newMapQuery');
    const latInput = document.getElementById('newLat');
    const lngInput = document.getElementById('newLng');
    const imgInput = document.getElementById('newImg');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        if (typeof showCustomAlert === 'function') showCustomAlert('請輸入景點名稱！', '⚠️');
        return;
    }

    const autoCode = 'SPOT_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newPlace = {
        id: autoCode,
        category: catInput ? catInput.value : 'view',
        name: name,
        sub: subInput ? subInput.value.trim() : '',
        desc: descInput ? descInput.value.trim() : '',
        mapQuery: (queryInput && queryInput.value.trim()) ? queryInput.value.trim() : name,
        lat: (latInput && latInput.value) ? parseFloat(latInput.value) : null,
        lng: (lngInput && lngInput.value) ? parseFloat(lngInput.value) : null,
        img: (imgInput && imgInput.value.trim()) ? imgInput.value.trim() : 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80'
    };

    if (!newPlace.lat || !newPlace.lng) {
        newPlace.lat = 35.6812 + (Math.random() - 0.5) * 0.04;
        newPlace.lng = 139.7671 + (Math.random() - 0.5) * 0.04;
    }

    window.placesDatabase.unshift(newPlace);

    const selectedDay = dayInput ? parseInt(dayInput.value) : 0;
    if (selectedDay >= 1 && selectedDay <= 6) {
        if (!window.itinerary[selectedDay]) window.itinerary[selectedDay] = [];
        window.itinerary[selectedDay].push(newPlace);
    }

    saveData();
    renderPlaces();
    renderItinerary();
    renderMapMarkers();
    closeAddPlaceModal();

    if (nameInput) nameInput.value = '';
    if (subInput) subInput.value = '';
    if (descInput) descInput.value = '';
    if (queryInput) queryInput.value = '';
    if (latInput) latInput.value = '';
    if (lngInput) lngInput.value = '';
    if (imgInput) imgInput.value = '';

    if (typeof playSfx === 'function') playSfx('equip');
    if (typeof showCustomAlert === 'function') {
        showCustomAlert(`已成功登錄新景點「${name}」！`, '✨');
    }

    if (typeof googleAppsScriptUrl !== 'undefined' && googleAppsScriptUrl && typeof postNewPlaceToGoogleSheet === 'function') {
        postNewPlaceToGoogleSheet({ ...newPlace, day: selectedDay });
    }
}

// -------------------------------------------------------------
// 🗡️ WISHLIST & SIDE QUEST DRAG AND DROP CONTROLS
// -------------------------------------------------------------

let draggedWishlistIndex = null;

function handleWishlistDragStart(e, index) {
    draggedWishlistIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.classList.add('opacity-40', 'border-amber-400');
}

function handleWishlistDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleWishlistDrop(e, targetIndex) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();

    if (draggedWishlistIndex !== null && draggedWishlistIndex !== targetIndex) {
        const itemToMove = window.wishlist.splice(draggedWishlistIndex, 1)[0];
        window.wishlist.splice(targetIndex, 0, itemToMove);
        saveData();
        renderWishlist();
        if (typeof playSfx === 'function') playSfx('equip');
    }
    return false;
}

function handleWishlistDragEnd(e) {
    draggedWishlistIndex = null;
    e.currentTarget.classList.remove('opacity-40', 'border-amber-400');
}

function moveWishlistItem(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= window.wishlist.length) return;
    const item = window.wishlist.splice(fromIndex, 1)[0];
    window.wishlist.splice(toIndex, 0, item);
    saveData();
    renderWishlist();
    if (typeof playSfx === 'function') playSfx('click');
}

function renderWishlist() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    const doneCount = window.wishlist.filter(w => w.done).length;
    const completionEl = document.getElementById('wishlistCompletion');
    if (completionEl) completionEl.textContent = `${doneCount}/${window.wishlist.length} DONE`;

    if (window.wishlist.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-slate-500 font-pixel-jp text-xs border border-dashed border-slate-800 rounded">🗡️ 尚無支線任務，歡迎輸入想吃的美食或採購清單！</div>`;
        return;
    }

    container.innerHTML = window.wishlist.map((item, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === window.wishlist.length - 1;

        return `
            <div draggable="true" 
                ondragstart="handleWishlistDragStart(event, ${idx})" 
                ondragover="handleWishlistDragOver(event)" 
                ondrop="handleWishlistDrop(event, ${idx})" 
                ondragend="handleWishlistDragEnd(event)" 
                class="bg-slate-900 border border-slate-700/70 p-2 rounded flex items-center justify-between gap-2 text-xs hover:border-slate-500 transition cursor-grab active:cursor-grabbing group">
                
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="text-slate-600 group-hover:text-amber-400 font-bold select-none cursor-grab text-xs" title="按住拖曳排序">⣿</span>
                    <label class="flex items-center gap-2 flex-1 cursor-pointer truncate ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}">
                        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleWishlistItem(${idx})" class="rounded border-slate-700 text-amber-500 accent-amber-500 shrink-0">
                        <span class="truncate">${item.text}</span>
                    </label>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <div class="flex flex-col gap-0.5">
                        <button onclick="moveWishlistItem(${idx}, ${idx - 1})" class="${isFirst ? 'opacity-20 cursor-not-allowed' : 'hover:text-amber-300 text-slate-500'} p-0.5 text-[8px]" ${isFirst ? 'disabled' : ''} title="向上移動">
                            <i class="fa-solid fa-chevron-up"></i>
                        </button>
                        <button onclick="moveWishlistItem(${idx}, ${idx + 1})" class="${isLast ? 'opacity-20 cursor-not-allowed' : 'hover:text-amber-300 text-slate-500'} p-0.5 text-[8px]" ${isLast ? 'disabled' : ''} title="向下移動">
                            <i class="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>
                    <button onclick="deleteWishlistItem(${idx})" class="text-slate-500 hover:text-rose-400 p-1 ml-0.5" title="刪除任務">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 🛍️ SHOPPING & PROXY PURCHASE SIDE QUEST TAB MODULE
// -------------------------------------------------------------

let sideQuestActiveTab = 'tickets';

function switchSideQuestTab(tabName) {
    sideQuestActiveTab = tabName;
    const tabTickets = document.getElementById('tabSideQuestTickets');
    const tabShopping = document.getElementById('tabSideQuestShopping');
    const formTickets = document.getElementById('formSideQuestTickets');
    const formShopping = document.getElementById('formSideQuestShopping');

    if (tabName === 'tickets') {
        if (tabTickets) tabTickets.className = 'pixel-btn pixel-btn-green text-xs font-bold py-1 px-3 active-tab';
        if (tabShopping) tabShopping.className = 'pixel-btn text-xs font-bold py-1 px-3 text-slate-400 bg-slate-900 border border-slate-700 hover:text-slate-200';
        if (formTickets) formTickets.classList.remove('hidden');
        if (formShopping) formShopping.classList.add('hidden');
        renderWishlist();
    } else {
        if (tabTickets) tabTickets.className = 'pixel-btn text-xs font-bold py-1 px-3 text-slate-400 bg-slate-900 border border-slate-700 hover:text-slate-200';
        if (tabShopping) tabShopping.className = 'pixel-btn pixel-btn-gold text-xs font-bold py-1 px-3 active-tab';
        if (formTickets) formTickets.classList.add('hidden');
        if (formShopping) formShopping.classList.remove('hidden');
        renderShoppingList();
    }
    if (typeof playSfx === 'function') playSfx('click');
}

function renderShoppingList() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    if (!Array.isArray(window.shoppingList)) {
        window.shoppingList = typeof getOfficialDefaultShoppingList === 'function' ? getOfficialDefaultShoppingList() : [];
    }

    const doneCount = window.shoppingList.filter(s => s.done).length;
    const totalJpy = window.shoppingList.reduce((sum, s) => sum + (parseInt(s.priceJpy) || 0), 0);
    const rate = (typeof budgetState !== 'undefined' && budgetState.exchangeRate) ? budgetState.exchangeRate : 0.215;
    const totalTwd = Math.round(totalJpy * rate);

    const completionEl = document.getElementById('wishlistCompletion');
    if (completionEl) {
        completionEl.textContent = `已購 ${doneCount}/${window.shoppingList.length} • 估價: ¥${totalJpy.toLocaleString()} (約 NT$${totalTwd.toLocaleString()})`;
    }

    if (window.shoppingList.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-slate-500 font-pixel-jp text-xs border border-dashed border-slate-800 rounded">🛍️ 尚無採購/代購項目，請在上方輸入商品名稱、委託人與金額！</div>`;
        return;
    }

    container.innerHTML = window.shoppingList.map((item, idx) => {
        const itemTwd = Math.round((parseInt(item.priceJpy) || 0) * rate);
        const reqBadge = item.requester ? `<span class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 text-[10px] border border-slate-700/80 font-pixel-jp shrink-0">👤 ${item.requester}</span>` : '';
        const priceBadge = item.priceJpy ? `<span class="text-amber-400 font-mono font-bold text-[11px] shrink-0">¥${parseInt(item.priceJpy).toLocaleString()} <span class="text-[9px] text-slate-400 font-normal">(NT$${itemTwd.toLocaleString()})</span></span>` : '';

        return `
            <div class="bg-slate-900 border border-slate-700/80 p-2 rounded flex items-center justify-between gap-2 text-xs hover:border-amber-500/60 transition group">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleShoppingItem(${idx})" class="rounded border-slate-700 text-amber-500 accent-amber-500 shrink-0 cursor-pointer">
                    <div class="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap ${item.done ? 'line-through text-slate-500' : 'text-slate-100'}">
                        <span class="font-bold truncate">${item.name}</span>
                        ${reqBadge}
                        ${priceBadge}
                    </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <button onclick="pushShoppingToBudget(${idx})" class="pixel-btn text-[9px] py-0.5 px-1.5 text-amber-300 hover:text-amber-200" title="一鍵轉入記帳總覽">
                        💰 轉記帳
                    </button>
                    <button onclick="deleteShoppingItem(${idx})" class="text-slate-500 hover:text-rose-400 p-1" title="刪除採購項目">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function addShoppingItem() {
    const nameInput = document.getElementById('newShopNameInput');
    const reqInput = document.getElementById('newShopReqInput');
    const priceInput = document.getElementById('newShopPriceInput');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) return;

    const requester = reqInput ? reqInput.value.trim() : '自用';
    const priceJpy = priceInput ? (parseInt(priceInput.value) || 0) : 0;

    if (!Array.isArray(window.shoppingList)) window.shoppingList = [];
    window.shoppingList.push({
        id: 'shop-' + Date.now(),
        name: name,
        requester: requester || '自用',
        priceJpy: priceJpy,
        done: false
    });

    saveData();
    renderShoppingList();
    if (nameInput) nameInput.value = '';
    if (reqInput) reqInput.value = '';
    if (priceInput) priceInput.value = '';
    if (typeof playSfx === 'function') playSfx('equip');
    if (typeof showCustomAlert === 'function') showCustomAlert(`已登錄採購項目「${name}」！`, '🛍️');
}

function toggleShoppingItem(idx) {
    if (!window.shoppingList || !window.shoppingList[idx]) return;
    window.shoppingList[idx].done = !window.shoppingList[idx].done;
    saveData();
    renderShoppingList();
    if (typeof playSfx === 'function') playSfx('click');
}

function deleteShoppingItem(idx) {
    if (!window.shoppingList || !window.shoppingList[idx]) return;
    window.shoppingList.splice(idx, 1);
    saveData();
    renderShoppingList();
    if (typeof playSfx === 'function') playSfx('click');
}

function pushShoppingToBudget(idx) {
    if (!window.shoppingList || !window.shoppingList[idx]) return;
    const item = window.shoppingList[idx];

    if (typeof budgetState !== 'undefined' && Array.isArray(budgetState.expenses)) {
        budgetState.expenses.push({
            id: 'exp-shop-' + Date.now(),
            title: `🛍️ ${item.name} (${item.requester || '自用'})`,
            amountJpy: item.priceJpy || 0,
            category: 'shopping',
            paymentMethod: 'card',
            day: 0,
            timestamp: Date.now()
        });
        if (typeof saveBudgetState === 'function') saveBudgetState();
        if (typeof renderBudgetSummary === 'function') renderBudgetSummary();
        if (typeof playSfx === 'function') playSfx('fanfare');
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(`已將「${item.name}」自動帶入 💰 記帳與預算控制面板！`, '💳');
        }
    }
}

function addWishlistItem() {
    const input = document.getElementById('newWishinput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    window.wishlist.push({ text: text, done: false });
    input.value = '';
    saveData();
    renderWishlist();
    if (typeof playSfx === 'function') playSfx('click');
}

function toggleWishlistItem(idx) {
    if (window.wishlist[idx]) {
        window.wishlist[idx].done = !window.wishlist[idx].done;
        saveData();
        renderWishlist();
        if (typeof playSfx === 'function') playSfx('click');
    }
}

function deleteWishlistItem(idx) {
    window.wishlist.splice(idx, 1);
    saveData();
    renderWishlist();
    if (typeof playSfx === 'function') playSfx('delete');
}

// -------------------------------------------------------------
// 🛡️ STARTUP ITINERARY SELECTION MODAL CONTROLS
// -------------------------------------------------------------

function openStartupChoiceModal() {
    const modal = document.getElementById('startupChoiceModal');
    if (modal) {
        modal.classList.remove('hidden');
        if (typeof playSfx === 'function') playSfx('click');
    }
}

function closeStartupChoiceModal() {
    const modal = document.getElementById('startupChoiceModal');
    if (modal) modal.classList.add('hidden');
}

async function selectStartupOption(type) {
    try {
        localStorage.setItem('tokyo_quest_startup_chosen', 'true');
    } catch(e){}
    
    if (type === 'default') {
        restoreDefaultData();
        renderDayTabs();
        selectDay(1);
        closeStartupChoiceModal();
        if (typeof showCustomAlert === 'function') showCustomAlert('已成功載入預設 6 日冒險行程！', '🛡️');
    } else if (type === 'custom') {
        const startDateEl = document.getElementById('customStartDateInput');
        const totalDaysEl = document.getElementById('customTotalDaysInput');
        const input = document.getElementById('customSheetIdInput');

        const startDate = startDateEl ? startDateEl.value : '2026-09-04';
        const totalDays = totalDaysEl ? (parseInt(totalDaysEl.value, 10) || 6) : 6;
        const customId = input ? input.value.trim() : '';

        window.tripConfig = {
            startDate: startDate,
            totalDays: totalDays,
            customDayTitles: {}
        };

        if (!window.itinerary) window.itinerary = {};
        for (let d = 1; d <= totalDays; d++) {
            if (!window.itinerary[d]) window.itinerary[d] = [];
        }

        if (customId) {
            googleSheetId = customId;
        }

        saveData();
        renderDayTabs();
        selectDay(1);
        renderPlaces();
        closeStartupChoiceModal();
        
        if (customId) {
            if (typeof showCustomAlert === 'function') showCustomAlert('正在從試算表載入您的自訂行程...', '🔄');
            if (typeof syncFromGoogleSheet === 'function') {
                await syncFromGoogleSheet();
            }
        } else {
            if (typeof showCustomAlert === 'function') showCustomAlert(`已建立 ${startDate} 出發，共 ${totalDays} 天的專屬行程！`, '📅');
        }
    }
}

// -------------------------------------------------------------
// ✈️ 🏨 EDITABLE FLIGHT & ACCOMMODATION BANNER CONTROLS
// -------------------------------------------------------------

function updateFlightHotelField(field, value) {
    if (!window.flightHotelInfo) {
        window.flightHotelInfo = typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {};
    }
    window.flightHotelInfo[field] = value;
    saveData();

    if (field === 'hotelMapUrl') {
        const btn = document.getElementById('hotelNavBtn');
        if (btn) btn.href = value || '#';
    }
}

function renderFlightHotelBanner() {
    const container = document.getElementById('flightHotelBannerContainer');
    if (!container) return;

    const info = window.flightHotelInfo || (typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {});

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-1">
            <!-- LEFT: FLIGHT INFO -->
            <div class="pixel-box-gold p-2.5 rounded text-xs font-pixel-jp shadow-md flex flex-col justify-between space-y-1.5">
                <div class="flex items-center justify-between border-b border-amber-800/80 pb-1">
                    <span class="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                        <i class="fa-solid fa-plane-departure text-amber-400"></i> ${info.flightTitle || '樂桃航空來回機票'}
                    </span>
                    <button onclick="openFlightHotelModal()" class="pixel-btn text-[10px] py-0.5 px-1.5 text-amber-300 border-amber-600 flex items-center gap-0.5 font-bold" title="開啟編輯視窗">
                        <i class="fa-solid fa-pen-to-square"></i> 編輯
                    </button>
                </div>
                <div class="space-y-1 text-amber-200/90 text-[11px]">
                    <div class="flex items-center justify-between bg-slate-900/60 p-1 rounded border border-amber-900/40">
                        <input type="text" value="${(info.flightOutbound || '').replace(/"/g, '&quot;')}" oninput="updateFlightHotelField('flightOutbound', this.value)" class="w-full bg-transparent border-b border-transparent focus:border-amber-400 text-amber-300 font-pixel-jp text-[11px] focus:outline-none focus:bg-slate-950/80 px-1 py-0.5" title="點擊可自由修改去程班機資訊">
                    </div>
                    <div class="flex items-center justify-between bg-slate-900/60 p-1 rounded border border-amber-900/40">
                        <input type="text" value="${(info.flightInbound || '').replace(/"/g, '&quot;')}" oninput="updateFlightHotelField('flightInbound', this.value)" class="w-full bg-transparent border-b border-transparent focus:border-amber-400 text-amber-300 font-pixel-jp text-[11px] focus:outline-none focus:bg-slate-950/80 px-1 py-0.5" title="點擊可自由修改回程班機資訊">
                    </div>
                </div>
            </div>

            <!-- RIGHT: ACCOMMODATION INFO -->
            <div class="pixel-box-gold p-2.5 rounded text-xs font-pixel-jp shadow-md flex flex-col justify-between space-y-1.5">
                <div class="flex items-center justify-between border-b border-amber-800/80 pb-1">
                    <span class="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                        <i class="fa-solid fa-hotel text-emerald-400"></i> 🏨 住宿據點 (5 NIGHTS STAY)
                    </span>
                    <button onclick="openFlightHotelModal()" class="pixel-btn text-[10px] py-0.5 px-1.5 text-emerald-300 border-emerald-600 flex items-center gap-0.5 font-bold" title="開啟編輯視窗">
                        <i class="fa-solid fa-pen-to-square"></i> 編輯
                    </button>
                </div>
                <div class="flex items-center justify-between gap-2 bg-slate-900/60 p-1.5 rounded border border-emerald-900/40">
                    <div class="space-y-0.5 min-w-0 flex-1">
                        <input type="text" value="${(info.hotelName || '').replace(/"/g, '&quot;')}" oninput="updateFlightHotelField('hotelName', this.value)" class="w-full bg-transparent border-b border-transparent focus:border-emerald-400 text-emerald-300 font-bold text-xs font-pixel-jp focus:outline-none focus:bg-slate-950/80 px-1 py-0.5" title="點擊可自由修改飯店名稱">
                        <input type="text" value="${(info.hotelSub || '').replace(/"/g, '&quot;')}" oninput="updateFlightHotelField('hotelSub', this.value)" class="w-full bg-transparent border-b border-transparent focus:border-emerald-400 text-slate-300 text-[10px] font-pixel-jp focus:outline-none focus:bg-slate-950/80 px-1 py-0.5" title="點擊可自由修改住宿時間與備註">
                    </div>
                    <a id="hotelNavBtn" href="${info.hotelMapUrl || '#'}" target="_blank" rel="noopener noreferrer" class="pixel-btn pixel-btn-green text-[10px] py-1 px-2 flex items-center gap-1 font-bold shrink-0" title="開啟 Google Maps 導航">
                        <i class="fa-solid fa-location-dot"></i> 導航
                    </a>
                </div>
            </div>
        </div>
    `;
}

function openFlightHotelModal() {
    const modal = document.getElementById('flightHotelModal');
    if (!modal) return;

    const info = window.flightHotelInfo || (typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {});

    const titleEl = document.getElementById('fhModalTitle');
    const outboundEl = document.getElementById('fhModalOutbound');
    const inboundEl = document.getElementById('fhModalInbound');
    const hotelNameEl = document.getElementById('fhModalHotelName');
    const hotelSubEl = document.getElementById('fhModalHotelSub');
    const hotelMapUrlEl = document.getElementById('fhModalHotelMapUrl');

    if (titleEl) titleEl.value = info.flightTitle || '';
    if (outboundEl) outboundEl.value = info.flightOutbound || '';
    if (inboundEl) inboundEl.value = info.flightInbound || '';
    if (hotelNameEl) hotelNameEl.value = info.hotelName || '';
    if (hotelSubEl) hotelSubEl.value = info.hotelSub || '';
    if (hotelMapUrlEl) hotelMapUrlEl.value = info.hotelMapUrl || '';

    modal.classList.remove('hidden');
    if (typeof playSfx === 'function') playSfx('click');
}

function closeFlightHotelModal() {
    const modal = document.getElementById('flightHotelModal');
    if (modal) modal.classList.add('hidden');
}

function saveFlightHotelModal() {
    const titleEl = document.getElementById('fhModalTitle');
    const outboundEl = document.getElementById('fhModalOutbound');
    const inboundEl = document.getElementById('fhModalInbound');
    const hotelNameEl = document.getElementById('fhModalHotelName');
    const hotelSubEl = document.getElementById('fhModalHotelSub');
    const hotelMapUrlEl = document.getElementById('fhModalHotelMapUrl');

    window.flightHotelInfo = {
        flightTitle: titleEl ? titleEl.value.trim() : '樂桃航空來回機票',
        flightOutbound: outboundEl ? outboundEl.value.trim() : '',
        flightInbound: inboundEl ? inboundEl.value.trim() : '',
        hotelName: hotelNameEl ? hotelNameEl.value.trim() : '',
        hotelSub: hotelSubEl ? hotelSubEl.value.trim() : '',
        hotelMapUrl: hotelMapUrlEl ? hotelMapUrlEl.value.trim() : ''
    };

    saveData();
    renderFlightHotelBanner();
    closeFlightHotelModal();
    if (typeof showCustomAlert === 'function') showCustomAlert('機票與住宿資訊已成功儲存！', '✈️');
}
