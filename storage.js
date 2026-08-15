// -------------------------------------------------------------
// 💾 DATA STORAGE & RESTORE HELPERS
// -------------------------------------------------------------
const CURRENT_DATA_VERSION = '2026-09-04-v8';
function saveData() {
    try {
        localStorage.setItem('tokyo_quest_places', JSON.stringify(window.placesDatabase));
        localStorage.setItem('tokyo_quest_itinerary', JSON.stringify(window.itinerary));
        localStorage.setItem('tokyo_quest_wishlist', JSON.stringify(window.wishlist));
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
            saveData();
            return;
        }
        const savedPlaces = localStorage.getItem('tokyo_quest_places');
        const savedItinerary = localStorage.getItem('tokyo_quest_itinerary');
        const savedWishlist = localStorage.getItem('tokyo_quest_wishlist');
        const savedSheetId = localStorage.getItem('tokyo_quest_sheet_id');
        const savedScriptUrl = localStorage.getItem('tokyo_quest_apps_script_url');
        const savedDriveUrl = localStorage.getItem('tokyo_quest_drive_folder_url');
        if (savedPlaces) {
            const parsedPlaces = JSON.parse(savedPlaces);
            if (Array.isArray(parsedPlaces) && parsedPlaces.length > 0 && parsedPlaces[0] && parsedPlaces[0].name) {
                window.placesDatabase = parsedPlaces;
            } else {
