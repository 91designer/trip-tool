// -------------------------------------------------------------
// 🗺️ LEAFLET MAP ENGINE WITH ROUTE POLYLINES & NEARBY PINS
// -------------------------------------------------------------

let mapInstance = null;
let mapMarkersGroup = null;
let mapRouteLayerGroup = null;
let markersMap = {};

function initRpgMap() {
    if (mapInstance) return;

    const mapContainer = document.getElementById('rpgMap');
    if (!mapContainer) return;

    if (typeof L === 'undefined') {
        setTimeout(initRpgMap, 300);
        return;
    }

    try {
        const loadingText = document.getElementById('mapLoadingText');
        if (loadingText) loadingText.remove();

        mapInstance = L.map('rpgMap', {
            center: [35.6812, 139.7671],
            zoom: 11,
            zoomControl: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 18,
            subdomains: 'abcd'
        }).addTo(mapInstance);

        mapRouteLayerGroup = L.layerGroup().addTo(mapInstance);
        mapMarkersGroup = L.layerGroup().addTo(mapInstance);

        renderMapMarkers();

        setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 300);
        setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 1000);

    } catch (e) {
        console.error("Map initialization error:", e);
    }
}

function getGoogleMapsUrl(place) {
    if (!place) return 'https://www.google.com/maps';
    const query = place.mapQuery || `${place.name} ${place.sub || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function renderMapMarkers() {
    if (!mapInstance || !mapMarkersGroup) return;

    mapMarkersGroup.clearLayers();
    if (mapRouteLayerGroup) mapRouteLayerGroup.clearLayers();
    markersMap = {};

    const isFilterDayOnly = document.getElementById('mapFilterDayOnly')?.checked;
    const activeDayPlaces = window.itinerary[currentDay] || [];
    const targetPlaces = isFilterDayOnly ? activeDayPlaces : window.placesDatabase;

    const bounds = [];

    // 1. 繪製當日主線行程的路線連線 (Polyline Routes)
    const validDayPlaces = activeDayPlaces.filter(p => p.lat && p.lng);
    if (validDayPlaces.length > 1) {
        const pathLatLngs = validDayPlaces.map(p => [p.lat, p.lng]);
        
        const polylineGlow = L.polyline(pathLatLngs, {
            color: '#0284c7',
            weight: 8,
            opacity: 0.4,
            lineCap: 'round'
        });
        
        const polylineMain = L.polyline(pathLatLngs, {
            color: '#f59e0b',
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 8',
            lineCap: 'round'
        });

        if (mapRouteLayerGroup) {
            mapRouteLayerGroup.addLayer(polylineGlow);
            mapRouteLayerGroup.addLayer(polylineMain);
        }
    }

    // 2. 繪製主線行程景點圖示 (Map Markers)
    targetPlaces.forEach(place => {
        if (!place.lat || !place.lng) return;

        const catIcon = (CATEGORY_ICONS && CATEGORY_ICONS[place.category]) ? CATEGORY_ICONS[place.category] : '📍';
        const dayIndex = activeDayPlaces.findIndex(p => String(p.id) === String(place.id));
        const isDayStep = dayIndex !== -1;
        const stepBadge = isDayStep ? `<span class="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-pixel-en font-bold px-1 rounded-full border border-amber-200">${dayIndex + 1}</span>` : '';

        const customIcon = L.divIcon({
            className: 'rpg-custom-pin',
            html: `
                <div class="relative bg-slate-900 border-2 ${isDayStep ? 'border-amber-400 scale-110 shadow-amber-500/50' : 'border-slate-600 opacity-80'} text-slate-100 rounded-full w-9 h-9 flex items-center justify-center shadow-lg text-sm font-bold transform transition hover:scale-125 hover:border-amber-200 cursor-pointer">
                    ${catIcon}
                    ${stepBadge}
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const safeId = String(place.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const mapSearchUrl = getGoogleMapsUrl(place);

        const popupHtml = `
            <div class="text-xs p-1 max-w-[210px] space-y-1 font-pixel-jp">
                <div class="font-bold text-amber-300 text-sm flex items-center gap-1">
                    ${isDayStep ? `<span class="text-amber-400 font-pixel-en">#${dayIndex + 1}</span>` : ''}
                    ${catIcon} ${place.name}
                </div>
                <p class="text-sky-300 text-[10px] truncate">${place.sub || ''}</p>
                <p class="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">${place.desc || ''}</p>
                <div class="pt-1.5 flex items-center justify-between border-t border-slate-700">
                    <a href="${mapSearchUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline text-[10px] font-bold">
                        📍 Google Map 導航
                    </a>
                    <div class="flex gap-1 font-pixel-en">
                        ${[1,2,3,4,5,6].map(d => `<button onclick="addToItinerary('${safeId}', ${d})" class="px-1 py-0.5 ${currentDay === d ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-900 text-amber-200'} border border-amber-500 rounded text-[9px]">D${d}</button>`).join('')}
                    </div>
                </div>
            </div>
        `;

        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).bindPopup(popupHtml);

        mapMarkersGroup.addLayer(marker);
        markersMap[String(place.id)] = marker;
        bounds.push([place.lat, place.lng]);
    });

    // 3. 繪製當日智慧周邊推薦景點標記 (Glowing Emerald Compass Pins)
    if (typeof getNearbyPlacesForDay === 'function') {
        const nearbyPlaces = getNearbyPlacesForDay(currentDay) || [];
        const renderedIds = new Set(targetPlaces.map(p => String(p.id)));

        nearbyPlaces.forEach(place => {
            if (!place.lat || !place.lng || renderedIds.has(String(place.id))) return;

            const catIcon = (CATEGORY_ICONS && CATEGORY_ICONS[place.category]) ? CATEGORY_ICONS[place.category] : '📍';
            const distStr = place.dist < 1 ? `${Math.round(place.dist * 1000)}m` : `${place.dist}km`;

            const nearbyIcon = L.divIcon({
                className: 'rpg-custom-pin',
                html: `
                    <div class="relative bg-slate-900 border-2 border-emerald-400 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-xs font-bold transform transition hover:scale-125 hover:border-emerald-200 cursor-pointer animate-pulse">
                        🧭
                        <span class="absolute -top-2 -right-3 bg-emerald-500 text-slate-950 text-[9px] font-pixel-jp font-bold px-1 rounded-full border border-emerald-200">近 ${distStr}</span>
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const safeId = String(place.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const mapSearchUrl = getGoogleMapsUrl(place);

            const popupHtml = `
                <div class="text-xs p-1 max-w-[210px] space-y-1 font-pixel-jp">
                    <div class="font-bold text-emerald-300 text-sm flex items-center gap-1">
                        🧭 ${catIcon} ${place.name}
                    </div>
                    <div class="text-[10px] text-amber-300">📍 距離今日行程約 ${distStr}</div>
                    <p class="text-sky-300 text-[10px] truncate">${place.sub || ''}</p>
                    <p class="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">${place.desc || ''}</p>
                    <div class="pt-1.5 flex items-center justify-between border-t border-slate-700">
                        <a href="${mapSearchUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline text-[10px] font-bold">
                            📍 Google Map 導航
                        </a>
                        <button onclick="addToItinerary('${safeId}', ${currentDay})" class="pixel-btn pixel-btn-green text-[10px] py-0.5 px-2 font-bold">
                            ➕ 加入 D${currentDay}
                        </button>
                    </div>
                </div>
            `;

            const marker = L.marker([place.lat, place.lng], { icon: nearbyIcon }).bindPopup(popupHtml);
            mapMarkersGroup.addLayer(marker);
            markersMap[String(place.id)] = marker;
            bounds.push([place.lat, place.lng]);
        });
    }

    if (isFilterDayOnly && bounds.length > 0) {
        mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
}

function focusMapOnPlace(placeId) {
    const place = window.placesDatabase.find(p => String(p.id) === String(placeId));
    if (!place || !place.lat || !place.lng) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('找不到此景點的地圖座標！', '⚠️');
        }
        return;
    }

    if (!mapInstance) {
        initRpgMap();
    }

    const dayOnlyCheckbox = document.getElementById('mapFilterDayOnly');
    const activeDayPlaces = window.itinerary[currentDay] || [];
    const isInCurrentDay = activeDayPlaces.some(p => String(p.id) === String(placeId));

    if (dayOnlyCheckbox && dayOnlyCheckbox.checked && !isInCurrentDay) {
        dayOnlyCheckbox.checked = false;
        renderMapMarkers();
    }

    if (mapInstance) {
        mapInstance.setView([place.lat, place.lng], 15, { animate: true });
        
        const marker = markersMap[String(placeId)];
        if (marker) {
            marker.openPopup();
        }

        const mapElement = document.getElementById('rpgMap');
        if (mapElement && window.innerWidth < 1024) {
            mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (typeof playSfx === 'function') playSfx('click');
    }
}

function resetMapView() {
    if (mapInstance) {
        const activeDayPlaces = window.itinerary[currentDay] || [];
        const validDayPlaces = activeDayPlaces.filter(p => p.lat && p.lng);
        if (validDayPlaces.length > 0) {
            const dayBounds = validDayPlaces.map(p => [p.lat, p.lng]);
            mapInstance.fitBounds(dayBounds, { padding: [40, 40], maxZoom: 14 });
        } else {
            mapInstance.setView([35.6812, 139.7671], 11);
        }
        mapInstance.invalidateSize();
        if (typeof playSfx === 'function') playSfx('click');
    }
}
