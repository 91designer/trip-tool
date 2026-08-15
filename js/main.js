// -------------------------------------------------------------
// 🚀 APPLICATION CONTROLLER & INITIALIZATION
// -------------------------------------------------------------

function initApp() {
    loadSavedState();
    if (typeof initAudioContext === 'function') initAudioContext();
    if (typeof initBudgetModule === 'function') initBudgetModule();
    initRpgMap();
    renderPlaces();
    renderItinerary();
    renderWishlist();

    // ⚡ 頁面開啟/重新整理時自動於背景讀取 Google 試算表，確保資料永遠最新且絕無顯示錯誤！
    if (typeof syncFromGoogleSheet === 'function' && typeof googleSheetId !== 'undefined' && googleSheetId) {
        setTimeout(() => {
            syncFromGoogleSheet(true);
        }, 300);
    }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 50);
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}
