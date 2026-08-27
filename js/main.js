// -------------------------------------------------------------
// 🚀 APPLICATION CONTROLLER & INITIALIZATION
// -------------------------------------------------------------

function initApp() {
    loadSavedState();
    if (typeof initAudioContext === 'function') initAudioContext();
    if (typeof initBudgetModule === 'function') initBudgetModule();
    initRpgMap();
    renderPlaces();
    if (typeof renderDayTabs === 'function') renderDayTabs();
    renderItinerary();
    renderWishlist();
    if (typeof renderFlightHotelBanner === 'function') renderFlightHotelBanner();

    // ⚡ 頁面開啟/重新整理時自動於背景讀取 Google 試算表，確保資料演變最新且絕無顯示錯誤！
    if (typeof syncFromGoogleSheet === 'function' && typeof googleSheetId !== 'undefined' && googleSheetId) {
        setTimeout(() => {
            syncFromGoogleSheet(true);
        }, 300);
    }

    // 🛡️ 首次開啟網頁時彈出選擇懸浮視窗 (載入現有安排 / 自己建立行程)
    setTimeout(() => {
        try {
            if (!localStorage.getItem('tokyo_quest_startup_chosen')) {
                if (typeof openStartupChoiceModal === 'function') openStartupChoiceModal();
            }
        } catch(e){}
    }, 500);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 50);
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}
