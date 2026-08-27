// -------------------------------------------------------------
// 💾 DATA STORAGE & RESTORE HELPERS
// -------------------------------------------------------------

const CURRENT_DATA_VERSION = '2026-09-08-v17-dedup';

function saveData() {
    try {
        localStorage.setItem('tokyo_quest_places', JSON.stringify(window.placesDatabase));
        localStorage.setItem('tokyo_quest_itinerary', JSON.stringify(window.itinerary));
        localStorage.setItem('tokyo_quest_wishlist', JSON.stringify(window.wishlist));
        localStorage.setItem('tokyo_quest_flight_hotel', JSON.stringify(window.flightHotelInfo));
        localStorage.setItem('tokyo_quest_trip_config', JSON.stringify(window.tripConfig));
        localStorage.setItem('tokyo_quest_sheet_id', googleSheetId);
        localStorage.setItem('tokyo_quest_apps_script_url', googleAppsScriptUrl);
        localStorage.setItem('tokyo_quest_drive_folder_url', googleDriveFolderUrl);
        localStorage.setItem('tokyo_quest_version', CURRENT_DATA_VERSION);
    } catch(e){}
}

function loadSavedState() {
    try {
        const savedVersion = localStorage.getItem('tokyo_quest_version');
        if (savedVersion !== CURRENT_DATA_VERSION) {
            window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
            window.itinerary = getOfficialDefaultItinerary();
            window.wishlist = typeof getOfficialDefaultWishlist === 'function' ? getOfficialDefaultWishlist() : [];
            window.flightHotelInfo = typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {};
            window.tripConfig = typeof getOfficialDefaultTripConfig === 'function' ? getOfficialDefaultTripConfig() : {};
            saveData();
            return;
        }

        const savedPlaces = localStorage.getItem('tokyo_quest_places');
        const savedItinerary = localStorage.getItem('tokyo_quest_itinerary');
        const savedWishlist = localStorage.getItem('tokyo_quest_wishlist');
        const savedFlightHotel = localStorage.getItem('tokyo_quest_flight_hotel');
        const savedTripConfig = localStorage.getItem('tokyo_quest_trip_config');
        const savedSheetId = localStorage.getItem('tokyo_quest_sheet_id');
        const savedScriptUrl = localStorage.getItem('tokyo_quest_apps_script_url');
        const savedDriveUrl = localStorage.getItem('tokyo_quest_drive_folder_url');

        if (savedPlaces) {
            try {
                const parsedPlaces = JSON.parse(savedPlaces);
                if (Array.isArray(parsedPlaces) && parsedPlaces.length > 0 && parsedPlaces[0] && parsedPlaces[0].name) {
                    window.placesDatabase = parsedPlaces;
                } else {
                    window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
                }
            } catch(e) {
                window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
            }
        } else {
            window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
        }

        if (savedItinerary) {
            try {
                const parsedIt = JSON.parse(savedItinerary);
                const count = (parsedIt && typeof parsedIt === 'object') 
                    ? Object.values(parsedIt).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0) 
                    : 0;
                if (count > 0) {
                    window.itinerary = parsedIt;
                } else {
                    window.itinerary = getOfficialDefaultItinerary();
                }
            } catch(e) {
                window.itinerary = getOfficialDefaultItinerary();
            }
        } else {
            window.itinerary = getOfficialDefaultItinerary();
        }

        if (savedWishlist) {
            const parsedWish = JSON.parse(savedWishlist);
            if (Array.isArray(parsedWish) && parsedWish.length > 0) {
                window.wishlist = parsedWish;
            } else {
                window.wishlist = typeof getOfficialDefaultWishlist === 'function' ? getOfficialDefaultWishlist() : [];
            }
        } else {
            window.wishlist = typeof getOfficialDefaultWishlist === 'function' ? getOfficialDefaultWishlist() : [];
        }

        if (savedFlightHotel) {
            try {
                window.flightHotelInfo = JSON.parse(savedFlightHotel);
            } catch(e) {
                window.flightHotelInfo = typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {};
            }
        } else {
            window.flightHotelInfo = typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {};
        }

        if (savedTripConfig) {
            try {
                window.tripConfig = JSON.parse(savedTripConfig);
            } catch(e) {
                window.tripConfig = typeof getOfficialDefaultTripConfig === 'function' ? getOfficialDefaultTripConfig() : {};
            }
        } else {
            window.tripConfig = typeof getOfficialDefaultTripConfig === 'function' ? getOfficialDefaultTripConfig() : {};
        }

        if (savedSheetId) googleSheetId = savedSheetId;
        if (savedScriptUrl) googleAppsScriptUrl = savedScriptUrl;
        if (savedDriveUrl) googleDriveFolderUrl = savedDriveUrl;
    } catch(e) {
        console.warn("Error restoring state, loading official defaults:", e);
        window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
        window.itinerary = getOfficialDefaultItinerary();
        window.wishlist = typeof getOfficialDefaultWishlist === 'function' ? getOfficialDefaultWishlist() : [];
        window.flightHotelInfo = typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {};
        window.tripConfig = typeof getOfficialDefaultTripConfig === 'function' ? getOfficialDefaultTripConfig() : {};
    }
}

function restoreDefaultData() {
    window.placesDatabase = JSON.parse(JSON.stringify(OFFICIAL_DEFAULT_PLACES));
    window.itinerary = getOfficialDefaultItinerary();
    window.wishlist = typeof getOfficialDefaultWishlist === 'function' ? getOfficialDefaultWishlist() : [];
    window.flightHotelInfo = typeof getOfficialDefaultFlightHotelInfo === 'function' ? getOfficialDefaultFlightHotelInfo() : {};
    window.tripConfig = typeof getOfficialDefaultTripConfig === 'function' ? getOfficialDefaultTripConfig() : {};
    saveData();
    if (typeof filterCategory === 'function') filterCategory('all');
    if (typeof renderPlaces === 'function') renderPlaces();
    if (typeof renderItinerary === 'function') renderItinerary();
    if (typeof renderWishlist === 'function') renderWishlist();
    if (typeof renderMapMarkers === 'function') renderMapMarkers();
    if (typeof closeSheetSettingsModal === 'function') closeSheetSettingsModal();
    if (typeof playSfx === 'function') playSfx('fanfare');
    if (typeof showCustomAlert === 'function') {
        showCustomAlert('已重置恢復預設的東京 6 日官方原廠冒險行程與景點！（原廠範本已被完整還原）', '↺');
    }
}

function exportDataJSON() {
    const data = { places: window.placesDatabase, itinerary: window.itinerary, wishlist: window.wishlist };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokyo_quest_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSfx('fanfare');
    showCustomAlert('手冊進度 JSON 備份檔已成功匯出！', '💾');
}
