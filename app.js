/* ==========================================================================
   BD CLICK 24 PRO - BETTING & EARNING INTERACTIVE JS ENGINE
   ========================================================================== */

const INITIAL_STATE = {
    user: {
        name: "আরিফুল ইসলাম",
        phone: "01712345678",
        balance: 100.00,
        totalEarned: 100.00,
        totalBets: 3,
        totalWin: 185.00,
        tasksCompleted: 4,
        referralCode: "BD24" + Math.floor(1000 + Math.random() * 9000),
        referrals: 2,
        referralEarnings: 12.50,
        lastDailyClaim: null,
        spinsLeft: 10
    },
    sportsMatches: [
        {
            id: "M101",
            category: "cricket",
            tournament: "T20 World Cup Warmup 2026",
            status: "LIVE 🔴 14.2 Ov",
            team1: { name: "Bangladesh", flag: "🇧🇩", odds: 1.85 },
            team2: { name: "India", flag: "🇮🇳", odds: 1.95 },
            drawOdds: 4.50,
            settled: false,
            winner: null
        },
        {
            id: "M102",
            category: "football",
            tournament: "UEFA Champions League",
            status: "Tonight 9:00 PM",
            team1: { name: "Real Madrid", flag: "🇪🇸", odds: 1.70 },
            team2: { name: "Barcelona", flag: "🇪🇸", odds: 2.10 },
            drawOdds: 3.20,
            settled: false,
            winner: null
        },
        {
            id: "M103",
            category: "cricket",
            tournament: "IPL 2026 Season Match",
            status: "Tomorrow 7:30 PM",
            team1: { name: "KKR", flag: "🏏", odds: 1.90 },
            team2: { name: "CSK", flag: "🏏", odds: 1.90 },
            drawOdds: 5.00,
            settled: false,
            winner: null
        }
    ],
    userBets: [
        {
            id: "BET901",
            matchTitle: "Bangladesh vs India",
            choice: "Bangladesh",
            stake: 100.00,
            odds: 1.85,
            potentialReturn: 185.00,
            status: "Won",
            matchId: "M101"
        }
    ],
    ptcAds: [
        { id: 1, title: "৫০% ছাড়ের অফার দেখুন - Daraz Deals", reward: 1.50, timer: 15, url: "https://example.com/ad1", completed: false },
        { id: 2, title: "BD Internet Package 10GB Offer", reward: 1.00, timer: 10, url: "https://example.com/ad2", completed: false }
    ],
    withdrawals: [
        { id: "W101", date: "2026-07-23", method: "Bkash", phone: "01712***890", amount: 150.00, status: "Paid" }
    ],
    isAdmin: false
};

let appState = JSON.parse(localStorage.getItem('bdclick24_state')) || INITIAL_STATE;

function saveState() {
    localStorage.setItem('bdclick24_state', JSON.stringify(appState));
    updateUI();
}

// --- DOM INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderSportsMatches();
    initSpinWheel();
    initGames();
    renderPTCAds();
    updateUI();
    initReferralLink();
});

function switchTab(targetId) {
    document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link, .bottom-item').forEach(link => link.classList.remove('active'));
    
    const selectedPage = document.getElementById(targetId);
    if (selectedPage) selectedPage.classList.add('active');
    
    document.querySelectorAll(`[data-target="${targetId}"]`).forEach(el => el.classList.add('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initNavigation() {
    document.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.getAttribute('data-target'));
        });
    });

    document.getElementById('claim-daily-btn').addEventListener('click', claimDailyBonus);
    document.getElementById('admin-toggle-btn').addEventListener('click', toggleAdminMode);

    document.getElementById('user-profile-btn').addEventListener('click', () => {
        document.getElementById('profile-name-input').value = appState.user.name;
        document.getElementById('profile-phone-input').value = appState.user.phone;
        openModal('profile-modal');
    });

    // Sports filter tabs
    document.querySelectorAll('.sport-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sport-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSportsMatches(btn.getAttribute('data-sport'));
        });
    });
}

// --- UI UPDATE ENGINE ---
function updateUI() {
    const u = appState.user;
    document.getElementById('user-balance').innerText = u.balance.toFixed(2);
    document.getElementById('dash-balance').innerText = u.balance.toFixed(2);
    document.getElementById('dash-total-bets').innerText = u.totalBets;
    document.getElementById('dash-total-win').innerText = u.totalWin.toFixed(2);
    document.getElementById('withdraw-current-balance').innerText = u.balance.toFixed(2);
    
    document.getElementById('sidebar-username').innerText = u.name;
    document.getElementById('sidebar-phone').innerText = u.phone;
    document.getElementById('sidebar-avatar').innerText = u.name.charAt(0).toUpperCase();

    document.getElementById('total-referrals-count').innerText = u.referrals;
    document.getElementById('referral-earnings-count').innerText = u.referralEarnings.toFixed(2);
    document.getElementById('spins-left-count').innerText = u.spinsLeft;

    renderUserBetsTable();
    renderUserHistory();
    renderAdminTables();
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid fa-bell"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- DAILY BONUS ---
function claimDailyBonus() {
    const today = new Date().toDateString();
    if (appState.user.lastDailyClaim === today) {
        showToast("আপনি আজকের বোনাস ইতোমধ্যে নিয়াছেন!", "error");
        return;
    }
    appState.user.balance += 10.00;
    appState.user.lastDailyClaim = today;
    confetti({ particleCount: 100, spread: 70 });
    showToast("অভিনন্দন! ৳১০.০০ ডেইলি বেটিং বোনাস ক্লেইম করা হয়েছে!", "success");
    saveState();
}

// --- SPORTS BETTING RENDERER ---
function renderSportsMatches(filter = 'all') {
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    const list = appState.sportsMatches.filter(m => filter === 'all' || m.category === filter);

    list.forEach(m => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-header">
                <span><i class="fa-solid fa-trophy text-gold"></i> ${m.tournament}</span>
                <span class="live-tag">${m.status}</span>
            </div>

            <div class="match-teams">
                <div class="team-box">
                    <div class="team-flag">${m.team1.flag}</div>
                    <h4>${m.team1.name}</h4>
                </div>
                <div class="vs-badge">VS</div>
                <div class="team-box">
                    <div class="team-flag">${m.team2.flag}</div>
                    <h4>${m.team2.name}</h4>
                </div>
            </div>

            <div class="odds-row">
                <button class="btn-odds" onclick="openBetSlip('${m.id}', '${m.team1.name}', ${m.team1.odds})">
                    <span>${m.team1.name} Win</span>
                    <strong>${m.team1.odds.toFixed(2)}x</strong>
                </button>
                <button class="btn-odds" onclick="openBetSlip('${m.id}', 'Draw (ড্র)', ${m.drawOdds})">
                    <span>Match Draw</span>
                    <strong>${m.drawOdds.toFixed(2)}x</strong>
                </button>
                <button class="btn-odds" onclick="openBetSlip('${m.id}', '${m.team2.name}', ${m.team2.odds})">
                    <span>${m.team2.name} Win</span>
                    <strong>${m.team2.odds.toFixed(2)}x</strong>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- BET SLIP MODAL & BET PLACEMENT ---
let currentSelectedBet = null;

function openBetSlip(matchId, optionName, odds) {
    const match = appState.sportsMatches.find(m => m.id === matchId);
    if (!match) return;

    currentSelectedBet = {
        matchId: match.id,
        matchTitle: `${match.team1.name} vs ${match.team2.name}`,
        choice: optionName,
        odds: odds
    };

    document.getElementById('betslip-match-title').innerText = currentSelectedBet.matchTitle;
    document.getElementById('betslip-option-name').innerText = currentSelectedBet.choice;
    document.getElementById('betslip-odds').innerText = odds.toFixed(2) + 'x';
    document.getElementById('betslip-stake-input').value = 100;
    
    calculateBetslipPayout();
    openModal('bet-modal');
}

function calculateBetslipPayout() {
    const stake = parseFloat(document.getElementById('betslip-stake-input').value) || 0;
    const returnVal = stake * (currentSelectedBet ? currentSelectedBet.odds : 1);
    document.getElementById('betslip-return-amount').innerText = returnVal.toFixed(2);
}

function confirmSportsBet() {
    const stake = parseFloat(document.getElementById('betslip-stake-input').value);
    if (isNaN(stake) || stake < 10) {
        showToast("সর্বনিম্ন বেটের পরিমাণ ৳১০.০০", "error");
        return;
    }

    if (stake > appState.user.balance) {
        showToast("আপনার পর্যাপ্ত ব্যালেন্স নেই!", "error");
        return;
    }

    // Deduct balance and record bet
    appState.user.balance -= stake;
    appState.user.totalBets += 1;

    const newBet = {
        id: "BET" + Math.floor(100 + Math.random() * 900),
        matchTitle: currentSelectedBet.matchTitle,
        choice: currentSelectedBet.choice,
        stake: stake,
        odds: currentSelectedBet.odds,
        potentialReturn: stake * currentSelectedBet.odds,
        status: "Pending",
        matchId: currentSelectedBet.matchId
    };

    appState.userBets.unshift(newBet);
    saveState();
    closeModal('bet-modal');
    confetti({ particleCount: 80 });
    showToast("বেট সফলভাবে প্লেস করা হয়েছে!", "success");
    switchTab('my-bets');
}

// --- INSTANT GAMES (COIN FLIP, DICE, COLOR) ---
function showMiniGame(gameType) {
    document.getElementById('game-coin-flip').style.display = gameType === 'coin-flip' ? 'block' : 'none';
    document.getElementById('game-dice-roll').style.display = gameType === 'dice-roll' ? 'block' : 'none';
    document.getElementById('game-color-pred').style.display = gameType === 'color-pred' ? 'block' : 'none';

    document.querySelectorAll('.game-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function setCoinBetAmount(amt) {
    document.getElementById('coin-bet-amount').value = amt;
}

function initGames() {
    // Coin Flip
    document.getElementById('flip-coin-btn').addEventListener('click', playCoinFlip);
    // Dice Roll
    document.getElementById('roll-dice-btn').addEventListener('click', playDiceRoll);
}

function playCoinFlip() {
    const stake = parseFloat(document.getElementById('coin-bet-amount').value);
    if (isNaN(stake) || stake < 10) { showToast("সর্বনিম্ন বেট ৳১০", "error"); return; }
    if (stake > appState.user.balance) { showToast("পর্যাপ্ত ব্যালেন্স নেই!", "error"); return; }

    const selectedSide = document.querySelector('input[name="coin_side"]:checked').value;
    const coinEl = document.getElementById('coin-element');

    appState.user.balance -= stake;
    appState.user.totalBets += 1;
    saveState();

    const isHeadResult = Math.random() < 0.5;
    const winningSide = isHeadResult ? "HEAD" : "TAIL";

    // Rotate Coin Animation
    const rotations = 5 * 360 + (isHeadResult ? 0 : 180);
    coinEl.style.transform = `rotateY(${rotations}deg)`;

    setTimeout(() => {
        if (selectedSide === winningSide) {
            const winAmt = stake * 1.95;
            appState.user.balance += winAmt;
            appState.user.totalWin += winAmt;
            confetti({ particleCount: 90 });
            showToast(`অভিনন্দন! результат ${winningSide}। আপনি ৳${winAmt.toFixed(2)} জিতেছেন!`, "success");
        } else {
            showToast(`ইশ! результат ছিলো ${winningSide}। আপনি হেরেছেন।`, "error");
        }
        saveState();
    }, 2000);
}

function playDiceRoll() {
    const stake = parseFloat(document.getElementById('dice-bet-amount').value);
    if (isNaN(stake) || stake < 10) { showToast("সর্বনিম্ন বেট ৳১০", "error"); return; }
    if (stake > appState.user.balance) { showToast("পর্যাপ্ত ব্যালেন্স নেই!", "error"); return; }

    const opt = document.querySelector('input[name="dice_opt"]:checked').value;
    const diceEl = document.getElementById('dice-element');

    appState.user.balance -= stake;
    appState.user.totalBets += 1;
    saveState();

    let rollCount = 0;
    const interval = setInterval(() => {
        diceEl.innerText = Math.floor(Math.random() * 6) + 1;
        rollCount++;
        if (rollCount > 10) {
            clearInterval(interval);
            const finalDice = Math.floor(Math.random() * 6) + 1;
            diceEl.innerText = finalDice;

            let isWin = false;
            let mult = 2.0;

            if (opt === 'UNDER' && finalDice <= 3) isWin = true;
            if (opt === 'OVER' && finalDice >= 4) isWin = true;
            if (opt === 'SIX' && finalDice === 6) { isWin = true; mult = 5.5; }

            if (isWin) {
                const winAmt = stake * mult;
                appState.user.balance += winAmt;
                appState.user.totalWin += winAmt;
                confetti({ particleCount: 100 });
                showToast(`অভিনন্দন! ডাইস নম্বর ${finalDice}। আপনি ৳${winAmt.toFixed(2)} জিতেছেন!`, "success");
            } else {
                showToast(`ডাইস নম্বর ${finalDice} এসেছে। আপনি হেরেছেন!`, "error");
            }
            saveState();
        }
    }, 100);
}

// --- COLOR PREDICTION GAME ---
function placeColorBet(colorChoice, multiplier) {
    const stake = 50.0;
    if (stake > appState.user.balance) { showToast("পর্যাপ্ত ব্যালেন্স নেই!", "error"); return; }

    appState.user.balance -= stake;
    appState.user.totalBets += 1;

    const colors = ['RED', 'GREEN', 'VIOLET'];
    const resultColor = colors[Math.floor(Math.random() * colors.length)];

    if (resultColor === colorChoice) {
        const winAmt = stake * multiplier;
        appState.user.balance += winAmt;
        appState.user.totalWin += winAmt;
        confetti({ particleCount: 80 });
        showToast(`সঠিক কালার ${resultColor}! আপনি ৳${winAmt.toFixed(2)} জিতেছেন!`, "success");
    } else {
        showToast(`ফলাফল ছিলো ${resultColor}! আপনি হেরেছেন।`, "error");
    }
    saveState();
}

// --- USER BETS TABLE RENDER ---
function renderUserBetsTable() {
    const tbody = document.getElementById('my-bets-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (appState.userBets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">কোনো বেট রেকর্ড নেই</td></tr>';
        return;
    }

    appState.userBets.forEach(b => {
        const tr = document.createElement('tr');
        let statusTag = `<span style="color:var(--gold);"><i class="fa-solid fa-clock"></i> পেন্ডিং</span>`;
        if (b.status === 'Won') statusTag = `<span style="color:var(--green);"><i class="fa-solid fa-trophy"></i> উইন</span>`;
        if (b.status === 'Lost') statusTag = `<span style="color:var(--red);"><i class="fa-solid fa-times-circle"></i> লস্ট</span>`;

        tr.innerHTML = `
            <td>#${b.id}</td>
            <td>${b.matchTitle}</td>
            <td><strong>${b.choice}</strong> (${b.odds.toFixed(2)}x)</td>
            <td>৳${b.stake.toFixed(2)}</td>
            <td class="text-green">৳${b.potentialReturn.toFixed(2)}</td>
            <td>${statusTag}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- PTC ADS RENDER ---
function renderPTCAds() {
    const container = document.getElementById('ads-container');
    if (!container) return;
    container.innerHTML = '';
    appState.ptcAds.forEach(ad => {
        const adCard = document.createElement('div');
        adCard.className = 'ad-item-card';
        adCard.innerHTML = `
            <div class="ad-header-info">
                <h4 class="ad-title">${ad.title}</h4>
                <div class="ad-reward">+৳${ad.reward.toFixed(2)}</div>
            </div>
            <button class="btn btn-primary margin-top" onclick="showToast('এড লোড হচ্ছে...', 'info')">বিজ্ঞাপন দেখুন</button>
        `;
        container.appendChild(adCard);
    });
}

// --- SPIN WHEEL ---
function initSpinWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sectors = ["৳১.০০", "৳০.৫০", "৳২.০০", "৳০.২৫", "৳৩.০০", "TRY AGAIN", "৳০.৭৫", "৳৫.০০"];
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];
    const arc = (2 * Math.PI) / sectors.length;

    sectors.forEach((sec, i) => {
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(170, 170);
        ctx.arc(170, 170, 160, i * arc, (i + 1) * arc);
        ctx.fill();

        ctx.save();
        ctx.translate(170, 170);
        ctx.rotate(i * arc + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px 'Outfit', sans-serif";
        ctx.fillText(sec, 140, 5);
        ctx.restore();
    });
}

// --- WITHDRAW SUBMIT ---
function handleWithdrawSubmit(e) {
    e.preventDefault();
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    const phone = document.getElementById('withdraw-phone').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);

    if (amount > appState.user.balance) { showToast("আপনার পর্যাপ্ত ব্যালেন্স নেই!", "error"); return; }
    if (amount < 50) { showToast("সর্বনিম্ন উইথড্র ৳৫০.০০", "error"); return; }

    appState.user.balance -= amount;
    appState.withdrawals.unshift({
        id: "W" + Math.floor(100 + Math.random() * 900),
        date: new Date().toISOString().split('T')[0],
        method, phone, amount, status: "Pending"
    });

    saveState();
    showToast("পেমেন্ট রিকোয়েস্ট সফলভাবে জমা দেওয়া হয়েছে!", "success");
    switchTab('my-bets');
}

function renderUserHistory() {
    // User payment history helper
}

// --- ADMIN CONTROL & MATCH SETTLEMENT ---
function toggleAdminMode() {
    appState.isAdmin = !appState.isAdmin;
    document.querySelectorAll('.admin-only-link').forEach(el => el.style.display = appState.isAdmin ? 'flex' : 'none');
    if (appState.isAdmin) {
        showToast("অ্যাডমিন মোড সক্রিয় করা হয়েছে!", "info");
        switchTab('admin-panel');
    } else {
        showToast("অ্যাডমিন মোড বন্ধ করা হয়েছে", "info");
        switchTab('dashboard');
    }
}

function renderAdminTables() {
    const tbody = document.getElementById('admin-withdraw-tbody');
    const matchesTbody = document.getElementById('admin-matches-tbody');
    if (!tbody || !matchesTbody) return;

    // Matches Settlement Control
    matchesTbody.innerHTML = '';
    appState.sportsMatches.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${m.team1.name} vs ${m.team2.name}</strong></td>
            <td>${m.team1.name} / Draw / ${m.team2.name}</td>
            <td>
                ${!m.settled ? `
                    <button class="btn btn-green" onclick="settleMatch('${m.id}', '${m.team1.name}')" style="padding:4px 8px; font-size:0.8rem;">Win: ${m.team1.name}</button>
                    <button class="btn btn-gold" onclick="settleMatch('${m.id}', '${m.team2.name}')" style="padding:4px 8px; font-size:0.8rem;">Win: ${m.team2.name}</button>
                ` : `<span class="text-green">Settled (${m.winner})</span>`}
            </td>
        `;
        matchesTbody.appendChild(tr);
    });

    // Withdrawals
    tbody.innerHTML = '';
    appState.withdrawals.forEach((w, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${w.id}</td>
            <td>${appState.user.name}</td>
            <td>${w.method}</td>
            <td>${w.phone}</td>
            <td>৳${w.amount.toFixed(2)}</td>
            <td>
                ${w.status === 'Pending' ? `
                    <button class="btn btn-green" onclick="approveWithdrawal(${index})" style="padding:4px 8px; font-size:0.8rem;">অনুমোদন</button>
                ` : `<span>${w.status}</span>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function settleMatch(matchId, winnerName) {
    const match = appState.sportsMatches.find(m => m.id === matchId);
    if (!match || match.settled) return;

    match.settled = true;
    match.winner = winnerName;

    // Settle all user bets for this match
    appState.userBets.forEach(b => {
        if (b.matchId === matchId && b.status === "Pending") {
            if (b.choice === winnerName) {
                b.status = "Won";
                appState.user.balance += b.potentialReturn;
                appState.user.totalWin += b.potentialReturn;
            } else {
                b.status = "Lost";
            }
        }
    });

    showToast(`ম্যাচ সাকসেসফুলি সেটেল করা হয়েছে! বিজয়ী: ${winnerName}`, "success");
    saveState();
}

function approveWithdrawal(idx) {
    appState.withdrawals[idx].status = "Paid";
    showToast("উইথড্র রিকোয়েস্ট অনুমোদিত হয়েছে!", "success");
    saveState();
}

function initReferralLink() {
    const linkInput = document.getElementById('referral-link');
    if (linkInput) linkInput.value = `https://bdclick24.com/?ref=${appState.user.referralCode}`;
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
