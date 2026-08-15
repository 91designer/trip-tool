// -------------------------------------------------------------
// 💰 BUDGET TRACKER & CURRENCY CONVERTER MODULE
// -------------------------------------------------------------

let budgetState = {
    exchangeRate: 0.215,   // JPY -> TWD
    cardFeePercent: 1.5,   // 海外刷卡手續費 %
    expenses: []           // [{ id, title, amountJpy, category, paymentMethod, day, note, timestamp }]
};

const BUDGET_CATEGORIES = {
    food: { label: '🥩 美食佳餚', icon: '🥩' },
    shopping: { label: '🛍️ 購物採買', icon: '🛍️' },
    transport: { label: '🚅 交通車票', icon: '🚅' },
    ticket: { label: '🎟️ 門票體驗', icon: '🎟️' },
    stay: { label: '🏨 飯店住宿', icon: '🏨' },
    other: { label: '📦 其他雜項', icon: '📦' }
};

function initBudgetModule() {
    loadBudgetState();
    renderBudgetSummary();
}

function loadBudgetState() {
    try {
        const saved = localStorage.getItem('tokyo_quest_budget');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.exchangeRate) budgetState.exchangeRate = parseFloat(parsed.exchangeRate);
            if (parsed.cardFeePercent !== undefined) budgetState.cardFeePercent = parseFloat(parsed.cardFeePercent);
            if (Array.isArray(parsed.expenses)) budgetState.expenses = parsed.expenses;
        }
    } catch (e) {
        console.warn("Failed to load budget state:", e);
    }
}

function saveBudgetState() {
    try {
        localStorage.setItem('tokyo_quest_budget', JSON.stringify(budgetState));
    } catch (e) {}
}

async function fetchLiveExchangeRate() {
    try {
        const btn = document.getElementById('btnFetchRate');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> 擷取中...';
        
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        if (res.ok) {
            const data = await res.json();
            if (data && data.rates && data.rates.TWD) {
                const liveRate = parseFloat(data.rates.TWD.toFixed(4));
                budgetState.exchangeRate = liveRate;
                document.getElementById('inputExchangeRate').value = liveRate;
                saveBudgetState();
                renderBudgetSummary();
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(`成功取得最新 JPY ➔ TWD 匯率：1 JPY = ${liveRate} TWD！`, '💱');
                }
            }
        }
    } catch (e) {
        console.warn("Failed to fetch live rate:", e);
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('無法取得即時匯率，請手動填寫匯率數值！', '⚠️');
        }
    } finally {
        const btn = document.getElementById('btnFetchRate');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> 即時擷取';
    }
}

function updateBudgetSettings() {
    const rateInput = document.getElementById('inputExchangeRate');
    const feeInput = document.getElementById('inputCardFee');

    if (rateInput && rateInput.value) {
        budgetState.exchangeRate = Math.max(0.001, parseFloat(rateInput.value) || 0.215);
    }
    if (feeInput && feeInput.value !== '') {
        budgetState.cardFeePercent = Math.max(0, parseFloat(feeInput.value) || 0);
    }

    saveBudgetState();
    renderBudgetSummary();
}

function calculateItemTwd(amountJpy, paymentMethod) {
    const rate = budgetState.exchangeRate || 0.215;
    const fee = (paymentMethod === 'card') ? (1 + (budgetState.cardFeePercent || 0) / 100) : 1.0;
    return Math.round(amountJpy * rate * fee);
}

function addExpenseItem() {
    const titleInput = document.getElementById('budgetTitle');
    const amountInput = document.getElementById('budgetAmountJpy');
    const catInput = document.getElementById('budgetCategory');
    const payInput = document.getElementById('budgetPayMethod');
    const dayInput = document.getElementById('budgetDaySelect');

    const title = titleInput ? titleInput.value.trim() : '';
    const amountJpy = amountInput ? parseFloat(amountInput.value) : 0;

    if (!title) {
        if (typeof showCustomAlert === 'function') showCustomAlert('請輸入消費品項名稱！', '⚠️');
        return;
    }
    if (!amountJpy || amountJpy <= 0) {
        if (typeof showCustomAlert === 'function') showCustomAlert('請輸入有效的日幣金額 (JPY)！', '⚠️');
        return;
    }

    const newItem = {
        id: 'exp-' + Date.now(),
        title: title,
        amountJpy: amountJpy,
        category: catInput ? catInput.value : 'food',
        paymentMethod: payInput ? payInput.value : 'cash',
        day: dayInput ? parseInt(dayInput.value) : 0,
        timestamp: Date.now()
    };

    budgetState.expenses.unshift(newItem);
    saveBudgetState();

    if (titleInput) titleInput.value = '';
    if (amountInput) amountInput.value = '';

    renderBudgetSummary();
    if (typeof playSfx === 'function') playSfx('equip');
}

function removeExpenseItem(id) {
    budgetState.expenses = budgetState.expenses.filter(e => e.id !== id);
    saveBudgetState();
    renderBudgetSummary();
    if (typeof playSfx === 'function') playSfx('delete');
}

function clearAllExpenses() {
    if (confirm('確定要清空所有消費記帳紀錄嗎？')) {
        budgetState.expenses = [];
        saveBudgetState();
        renderBudgetSummary();
        if (typeof playSfx === 'function') playSfx('delete');
    }
}

function renderBudgetSummary() {
    const listEl = document.getElementById('expenseListContainer');
    const totalJpyEl = document.getElementById('statTotalJpy');
    const totalTwdEl = document.getElementById('statTotalTwd');
    const cashTotalEl = document.getElementById('statCashTwd');
    const cardTotalEl = document.getElementById('statCardTwd');
    const icTotalEl = document.getElementById('statIcTwd');

    let sumJpy = 0;
    let sumTwd = 0;
    let cashTwd = 0;
    let cardTwd = 0;
    let icTwd = 0;

    budgetState.expenses.forEach(item => {
        const itemTwd = calculateItemTwd(item.amountJpy, item.paymentMethod);
        sumJpy += item.amountJpy;
        sumTwd += itemTwd;

        if (item.paymentMethod === 'cash') cashTwd += itemTwd;
        else if (item.paymentMethod === 'card') cardTwd += itemTwd;
        else if (item.paymentMethod === 'ic') icTwd += itemTwd;
    });

    if (totalJpyEl) totalJpyEl.textContent = `¥ ${sumJpy.toLocaleString()}`;
    if (totalTwdEl) totalTwdEl.textContent = `NT$ ${sumTwd.toLocaleString()}`;
    if (cashTotalEl) cashTotalEl.textContent = `NT$ ${cashTwd.toLocaleString()}`;
    if (cardTotalEl) cardTotalEl.textContent = `NT$ ${cardTwd.toLocaleString()}`;
    if (icTotalEl) icTotalEl.textContent = `NT$ ${icTwd.toLocaleString()}`;

    // 更新主頁面上的預算快速看板 (Main Dashboard Budget Widget)
    const mainTwd = document.getElementById('statTotalTwdMain');
    const mainJpy = document.getElementById('statTotalJpyMain');
    const mainRate = document.getElementById('statRateMain');
    const mainFee = document.getElementById('statFeeMain');
    if (mainTwd) mainTwd.textContent = `NT$ ${sumTwd.toLocaleString()}`;
    if (mainJpy) mainJpy.textContent = `¥ ${sumJpy.toLocaleString()}`;
    if (mainRate) mainRate.textContent = `${budgetState.exchangeRate}`;
    if (mainFee) mainFee.textContent = `${budgetState.cardFeePercent}%`;

    const rateInput = document.getElementById('inputExchangeRate');
    const feeInput = document.getElementById('inputCardFee');
    if (rateInput && document.activeElement !== rateInput) rateInput.value = budgetState.exchangeRate;
    if (feeInput && document.activeElement !== feeInput) feeInput.value = budgetState.cardFeePercent;

    if (!listEl) return;

    if (budgetState.expenses.length === 0) {
        listEl.innerHTML = `<div class="text-center py-8 text-slate-500 font-pixel-jp text-xs">💰 尚無記帳紀錄，快在上方新增第一筆消費吧！</div>`;
        return;
    }

    listEl.innerHTML = budgetState.expenses.map(item => {
        const catInfo = BUDGET_CATEGORIES[item.category] || BUDGET_CATEGORIES.other;
        const twdVal = calculateItemTwd(item.amountJpy, item.paymentMethod);
        
        let payBadge = '';
        if (item.paymentMethod === 'cash') {
            payBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] budget-tag-cash">💵 現金</span>`;
        } else if (item.paymentMethod === 'card') {
            payBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] budget-tag-card">💳 信用卡 (+${budgetState.cardFeePercent}%)</span>`;
        } else {
            payBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] budget-tag-ic">🐧 IC卡</span>`;
        }

        const dayBadge = item.day ? `<span class="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded text-[10px] border border-slate-700">D${item.day}</span>` : '';

        return `
            <div class="budget-card flex items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2 overflow-hidden">
                    <span class="text-base">${catInfo.icon}</span>
                    <div class="truncate">
                        <div class="font-bold text-slate-100 flex items-center gap-1.5">
                            <span class="truncate">${item.title}</span>
                            ${dayBadge}
                            ${payBadge}
                        </div>
                        <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                            ¥ ${item.amountJpy.toLocaleString()} JPY
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <div class="text-right font-mono">
                        <div class="font-bold text-amber-400 text-sm">NT$ ${twdVal.toLocaleString()}</div>
                    </div>
                    <button onclick="removeExpenseItem('${item.id}')" class="text-slate-500 hover:text-red-400 p-1" title="刪除記帳">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openBudgetModal() {
    initBudgetModule();
    const modal = document.getElementById('budgetModal');
    if (modal) modal.classList.remove('hidden');
}

function closeBudgetModal() {
    const modal = document.getElementById('budgetModal');
    if (modal) modal.classList.add('hidden');
}
