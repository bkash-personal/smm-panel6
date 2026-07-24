/* ==========================================================================
   BD CLICK 24 PRO - INTERACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

// --- STATE MANAGEMENT & INITIALIZATION ---
const INITIAL_STATE = {
    user: {
        name: "আরিফুল ইসলাম",
        phone: "01712345678",
        balance: 15.50,
        totalEarned: 15.50,
        tasksCompleted: 4,
        referralCode: "BD24" + Math.floor(1000 + Math.random() * 9000),
        referrals: 2,
        referralEarnings: 3.50,
        lastDailyClaim: null,
        spinsLeft: 10
    },
    ptcAds: [
        { id: 1, title: "৫০% ছাড়ের অফার দেখুন - Daraz Deals", reward: 1.50, timer: 15, url: "https://example.com/ad1", completed: false },
        { id: 2, title: "BD Internet Package 10GB Offer", reward: 1.00, timer: 10, url: "https://example.com/ad2", completed: false },
        { id: 3, title: "অনলাইন ফ্রিল্যান্সিং কোর্স ভর্তি চলছে", reward: 2.00, timer: 20, url: "https://example.com/ad3", completed: false },
        { id: 4, title: "বিকাশ ক্যাশব্যাক অফার জানুয়ারি ২০২৬", reward: 1.20, timer: 15, url: "https://example.com/ad4", completed: false },
        { id: 5, title: "অনলাইনে কাজ করে আয় করার সেরা টিপস", reward: 0.80, timer: 10, url: "https://example.com/ad5", completed: false }
    ],
    videoTasks: [
        { id: 1, title: "হাউ টু আর্ন মানি অনলাইনে (গাইড ২০২৬)", reward: 2.50, duration: "45s", completed: false, thumb: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80" },
        { id: 2, title: "বিকাশ অ্যাকাউন্ট নিরাপদে রাখার উপায়", reward: 1.50, duration: "30s", completed: false, thumb: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80" }
    ],
    withdrawals: [
        { id: "W101", date: "2026-07-23", method: "Bkash", phone: "01712***890", amount: 150.00, status: "Paid" },
        { id: "W102", date: "2026-07-24", method: "Nagad", phone: "01844***112", amount: 100.00, status: "Approved" }
    ],
    isAdmin: false
};

let appState = JSON.parse(localStorage.getItem('bdclick24_state')) || INITIAL_STATE;

function saveState() {
    localStorage.setItem('bdclick24_state', JSON.stringify(appState));
    updateUI();
}

// --- DOM ELEMENTS & ROUTING ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSpinWheel();
    initQuiz();
    renderPTCAds();
    renderVideos();
    updateUI();
    initReferralLink();
});

// Tab Switching Mechanism
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
            const target = link.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Daily Claim Button
    const dailyBtn = document.getElementById('claim-daily-btn');
    if (dailyBtn) {
        dailyBtn.addEventListener('click', claimDailyBonus);
    }

    // Profile & Admin Buttons
    document.getElementById('user-profile-btn').addEventListener('click', () => {
        document.getElementById('profile-name-input').value = appState.user.name;
        document.getElementById('profile-phone-input').value = appState.user.phone;
        openModal('profile-modal');
    });

    document.getElementById('admin-toggle-btn').addEventListener('click', toggleAdminMode);
}

// --- UI UPDATE ENGINE ---
function updateUI() {
    const user = appState.user;
    
    // Balance displays
    document.getElementById('user-balance').innerText = user.balance.toFixed(2);
    document.getElementById('dash-balance').innerText = user.balance.toFixed(2);
    document.getElementById('dash-total-earned').innerText = user.totalEarned.toFixed(2);
    document.getElementById('dash-task-completed').innerText = user.tasksCompleted;
    document.getElementById('withdraw-current-balance').innerText = user.balance.toFixed(2);
    
    // User profile sidebar
    document.getElementById('sidebar-username').innerText = user.name;
    document.getElementById('sidebar-phone').innerText = user.phone;
    document.getElementById('sidebar-avatar').innerText = user.name.charAt(0).toUpperCase();

    // Referrals
    document.getElementById('total-referrals-count').innerText = user.referrals;
    document.getElementById('referral-earnings-count').innerText = user.referralEarnings.toFixed(2);
    document.getElementById('spins-left-count').innerText = user.spinsLeft;

    // Render Tables
    renderUserHistory();
    renderAdminTable();

    // Daily bonus status check
    const dailyBtn = document.getElementById('claim-daily-btn');
    const today = new Date().toDateString();
    if (user.lastDailyClaim === today) {
        dailyBtn.disabled = true;
        dailyBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> আজকের বোনাস নেওয়া হয়েছে';
        dailyBtn.classList.remove('btn-gold');
        dailyBtn.classList.add('btn-secondary');
    }
}

// --- TOAST NOTIFICATIONS ENGINE ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check text-green';
    if (type === 'error') icon = 'fa-triangle-exclamation text-red';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- DAILY BONUS ---
function claimDailyBonus() {
    const today = new Date().toDateString();
    if (appState.user.lastDailyClaim === today) {
        showToast("আপনি আজকের বোনাস ইতোমধ্যে ক্লেইম করেছেন!", "error");
        return;
    }
    
    const bonusAmount = 5.00;
    appState.user.balance += bonusAmount;
    appState.user.totalEarned += bonusAmount;
    appState.user.lastDailyClaim = today;
    
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast(`অভিনন্দন! আপনি ৳${bonusAmount.toFixed(2)} দৈনিক বোনাস পেয়েছেন!`, "success");
    saveState();
}

// --- PTC ADS SYSTEM ---
function renderPTCAds() {
    const container = document.getElementById('ads-container');
    container.innerHTML = '';

    appState.ptcAds.forEach(ad => {
        const adCard = document.createElement('div');
        adCard.className = `ad-item-card ${ad.completed ? 'completed' : ''}`;
        adCard.innerHTML = `
            <div class="ad-header-info">
                <h4 class="ad-title">${ad.title}</h4>
                <div class="ad-reward">+৳${ad.reward.toFixed(2)}</div>
            </div>
            <div class="ad-details">
                <span><i class="fa-solid fa-clock"></i> ${ad.timer} সেকেন্ড</span>
                <span><i class="fa-solid fa-shield"></i> ভেরিফাইড এড</span>
            </div>
            <button class="btn ${ad.completed ? 'btn-secondary' : 'btn-primary'}" 
                    ${ad.completed ? 'disabled' : ''} 
                    onclick="startPTCAdTask(${ad.id})">
                ${ad.completed ? '<i class="fa-solid fa-check"></i> সম্পন্ন হয়েছে' : '<i class="fa-solid fa-eye"></i> বিজ্ঞাপন দেখুন'}
            </button>
        `;
        container.appendChild(adCard);
    });
}

let activeAd = null;
let adTimerInterval = null;

function startPTCAdTask(adId) {
    activeAd = appState.ptcAds.find(a => a.id === adId);
    if (!activeAd || activeAd.completed) return;

    document.getElementById('ad-modal-title').innerText = activeAd.title;
    document.getElementById('ad-timer').innerText = activeAd.timer;
    document.getElementById('ad-progress').style.width = '0%';
    document.getElementById('ad-quiz-box').style.display = 'none';

    openModal('ad-modal');

    // Simulate timer progress
    let duration = activeAd.timer;
    let elapsed = 0;

    clearInterval(adTimerInterval);
    adTimerInterval = setInterval(() => {
        elapsed++;
        let remaining = duration - elapsed;
        document.getElementById('ad-timer').innerText = remaining;
        document.getElementById('ad-progress').style.width = `${(elapsed / duration) * 100}%`;

        if (elapsed >= duration) {
            clearInterval(adTimerInterval);
            showAdMathVerification();
        }
    }, 1000);
}

function showAdMathVerification() {
    const quizBox = document.getElementById('ad-quiz-box');
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;

    document.getElementById('ad-math-q').innerText = `${num1} + ${num2} =`;
    document.getElementById('ad-math-a').value = '';
    quizBox.style.display = 'block';

    document.getElementById('ad-claim-btn').onclick = () => {
        const userAns = parseInt(document.getElementById('ad-math-a').value);
        if (userAns === correctAnswer) {
            activeAd.completed = true;
            appState.user.balance += activeAd.reward;
            appState.user.totalEarned += activeAd.reward;
            appState.user.tasksCompleted += 1;

            closeModal('ad-modal');
            confetti({ particleCount: 80, spread: 60 });
            showToast(`টাস্ক সম্পন্ন! আপনি ৳${activeAd.reward.toFixed(2)} অর্জন করেছেন!`, "success");
            saveState();
            renderPTCAds();
        } else {
            showToast("ভুল উত্তর! আবার চেষ্টা করুন।", "error");
        }
    };
}

// --- VIDEO TASKS SYSTEM ---
function renderVideos() {
    const container = document.getElementById('video-container');
    container.innerHTML = '';

    appState.videoTasks.forEach(vid => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${vid.thumb}" alt="Video thumbnail">
                <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="video-content">
                <h4>${vid.title}</h4>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <span style="color:var(--gold); font-weight:700;">+৳${vid.reward.toFixed(2)}</span>
                    <button class="btn ${vid.completed ? 'btn-secondary' : 'btn-primary'}" 
                            ${vid.completed ? 'disabled' : ''} 
                            onclick="watchVideoTask(${vid.id})">
                        ${vid.completed ? 'দেখা শেষ' : 'ভিডিও দেখুন (' + vid.duration + ')'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function watchVideoTask(vidId) {
    const vid = appState.videoTasks.find(v => v.id === vidId);
    if (!vid || vid.completed) return;

    showToast("ভিডিও দেখা শুরু হয়েছে... অনুগ্রহ করে অপেক্ষা করুন", "info");
    setTimeout(() => {
        vid.completed = true;
        appState.user.balance += vid.reward;
        appState.user.totalEarned += vid.reward;
        appState.user.tasksCompleted += 1;
        
        confetti({ particleCount: 70 });
        showToast(`ভিডিও দেখা সম্পন্ন! আপনি ৳${vid.reward.toFixed(2)} পেয়েছেন!`, "success");
        saveState();
        renderVideos();
    }, 5000); // simulated 5 seconds watch
}

// --- LUCKY SPIN WHEEL CANVAS ---
const wheelSectors = [
    { label: "৳১.০০", value: 1.0, color: "#3b82f6" },
    { label: "৳০.৫০", value: 0.5, color: "#8b5cf6" },
    { label: "৳২.০০", value: 2.0, color: "#ec4899" },
    { label: "৳০.২৫", value: 0.25, color: "#10b981" },
    { label: "৳৩.০০", value: 3.0, color: "#f59e0b" },
    { label: "try again", value: 0.0, color: "#ef4444" },
    { label: "৳০.75", value: 0.75, color: "#06b6d4" },
    { label: "৳৫.০০", value: 5.0, color: "#a855f7" }
];

let canvas, ctx, currentAngle = 0, isSpinning = false;

function initSpinWheel() {
    canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    drawWheel();

    document.getElementById('spin-btn').addEventListener('click', spinWheel);
}

function drawWheel() {
    const numSectors = wheelSectors.length;
    const arc = (2 * Math.PI) / numSectors;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wheelSectors.forEach((sec, i) => {
        const angle = currentAngle + i * arc;
        ctx.beginPath();
        ctx.fillStyle = sec.color;
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 10, angle, angle + arc);
        ctx.lineTo(radius, radius);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px 'Outfit', sans-serif";
        ctx.fillText(sec.label, radius - 25, 5);
        ctx.restore();
    });
}

function spinWheel() {
    if (isSpinning) return;
    if (appState.user.spinsLeft <= 0) {
        showToast("আজকের জন্য আপনার স্পিন লিমিট শেষ!", "error");
        return;
    }

    isSpinning = true;
    appState.user.spinsLeft--;

    const totalRounds = 5 + Math.random() * 3;
    const randomSector = Math.floor(Math.random() * wheelSectors.length);
    const sectorArc = (2 * Math.PI) / wheelSectors.length;
    
    // Calculate target angle to point pointer to selected sector
    const targetAngle = (totalRounds * 2 * Math.PI) + (3 * Math.PI / 2) - (randomSector * sectorArc + sectorArc / 2);
    
    let startTime = null;
    const duration = 4000;

    function animateSpin(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentAngle = easeOut * targetAngle;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            isSpinning = false;
            const won = wheelSectors[randomSector];
            if (won.value > 0) {
                appState.user.balance += won.value;
                appState.user.totalEarned += won.value;
                confetti({ particleCount: 100, spread: 80 });
                showToast(`অভিনন্দন! আপনি স্পিন করে ${won.label} জিতেছেন!`, "success");
            } else {
                showToast("আবার চেষ্টা করুন! রিওয়ার্ড পয়েন্ট পাননি।", "info");
            }
            saveState();
        }
    }

    requestAnimationFrame(animateSpin);
}

// --- MATH QUIZ ENGINE ---
let quizNum1 = 0, quizNum2 = 0;

function initQuiz() {
    generateNewQuizQuestion();
    document.getElementById('quiz-submit-btn').addEventListener('click', checkQuizAnswer);
}

function generateNewQuizQuestion() {
    quizNum1 = Math.floor(Math.random() * 20) + 1;
    quizNum2 = Math.floor(Math.random() * 20) + 1;
    document.getElementById('quiz-num1').innerText = quizNum1;
    document.getElementById('quiz-num2').innerText = quizNum2;
    document.getElementById('quiz-answer-input').value = '';
}

function checkQuizAnswer() {
    const inputVal = parseInt(document.getElementById('quiz-answer-input').value);
    if (isNaN(inputVal)) {
        showToast("অনুগ্রহ করে একটি সঠিক সংখ্যা লিখুন", "error");
        return;
    }

    if (inputVal === (quizNum1 + quizNum2)) {
        const reward = 0.50;
        appState.user.balance += reward;
        appState.user.totalEarned += reward;
        appState.user.tasksCompleted += 1;

        confetti({ particleCount: 50 });
        showToast(`সঠিক উত্তর! আপনি ৳${reward.toFixed(2)} আয় করেছেন!`, "success");
        saveState();
        generateNewQuizQuestion();
    } else {
        showToast("ভুল উত্তর! আবার চেষ্টা করুন।", "error");
    }
}

// --- REFERRAL LINK ENGINE ---
function initReferralLink() {
    const linkInput = document.getElementById('referral-link');
    const userRefCode = appState.user.referralCode;
    linkInput.value = `https://bdclick24.com/?ref=${userRefCode}`;

    document.getElementById('copy-ref-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(linkInput.value);
        showToast("রেফারেল লিংক কপি করা হয়েছে!", "success");
    });
}

// --- WITHDRAWAL SYSTEM ---
function handleWithdrawSubmit(event) {
    event.preventDefault();
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    const phone = document.getElementById('withdraw-phone').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);

    if (amount > appState.user.balance) {
        showToast("আপনার পর্যাপ্ত ব্যালেন্স নেই!", "error");
        return;
    }

    if (amount < 50) {
        showToast("সর্বনিম্ন উইথড্র পরিমাণ ৳৫০.০০", "error");
        return;
    }

    // Process withdrawal
    appState.user.balance -= amount;
    const newRequest = {
        id: "W" + Math.floor(100 + Math.random() * 900),
        date: new Date().toISOString().split('T')[0],
        method: method,
        phone: phone,
        amount: amount,
        status: "Pending"
    };

    appState.withdrawals.unshift(newRequest);
    saveState();

    document.getElementById('withdraw-form').reset();
    showToast("পেমেন্ট রিকোয়েস্ট সফলভাবে জমা নেওয়া হয়েছে!", "success");
    switchTab('history');
}

// --- USER HISTORY RENDER ---
function renderUserHistory() {
    const tbody = document.getElementById('user-history-tbody');
    tbody.innerHTML = '';

    if (appState.withdrawals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো উইথড্র হিস্ট্রি পাওয়া যায়নি</td></tr>';
        return;
    }

    appState.withdrawals.forEach(w => {
        const tr = document.createElement('tr');
        let statusBadge = `<span style="color:var(--gold);"><i class="fa-solid fa-clock"></i> পেন্ডিং</span>`;
        if (w.status === "Paid" || w.status === "Approved") {
            statusBadge = `<span style="color:var(--green);"><i class="fa-solid fa-circle-check"></i> পেইড</span>`;
        } else if (w.status === "Rejected") {
            statusBadge = `<span style="color:var(--red);"><i class="fa-solid fa-circle-xmark"></i> বাতিল</span>`;
        }

        tr.innerHTML = `
            <td>${w.date}</td>
            <td><span class="${w.method.toLowerCase()}-badge">${w.method}</span></td>
            <td>${w.phone}</td>
            <td>৳${w.amount.toFixed(2)}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- ADMIN PANEL CONTROL ---
function toggleAdminMode() {
    appState.isAdmin = !appState.isAdmin;
    const adminLink = document.querySelectorAll('.admin-only-link');
    adminLink.forEach(el => el.style.display = appState.isAdmin ? 'flex' : 'none');

    if (appState.isAdmin) {
        showToast("অ্যাডমিন মোড সক্রিয় করা হয়েছে!", "info");
        switchTab('admin-panel');
    } else {
        showToast("অ্যাডমিন মোড বন্ধ করা হয়েছে", "info");
        switchTab('dashboard');
    }
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-withdraw-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let pendingCount = 0, paidCount = 0;

    appState.withdrawals.forEach((w, index) => {
        if (w.status === 'Pending') pendingCount++;
        if (w.status === 'Paid' || w.status === 'Approved') paidCount++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${w.id}</td>
            <td>${appState.user.name}</td>
            <td><span class="${w.method.toLowerCase()}-badge">${w.method}</span></td>
            <td>${w.phone}</td>
            <td>৳${w.amount.toFixed(2)}</td>
            <td>
                ${w.status === 'Pending' ? `
                    <button class="btn btn-green" onclick="approveWithdrawal(${index})" style="padding:4px 8px; font-size:0.8rem;">অনুমোদন</button>
                    <button class="btn btn-secondary" onclick="rejectWithdrawal(${index})" style="padding:4px 8px; font-size:0.8rem; background:var(--red);">বাতিল</button>
                ` : `<span style="font-size:0.8rem; color:var(--text-secondary);">${w.status}</span>`}
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('admin-pending-count').innerText = pendingCount;
    document.getElementById('admin-paid-count').innerText = paidCount;
}

function approveWithdrawal(index) {
    appState.withdrawals[index].status = "Paid";
    showToast("পেমেন্ট সফলভাবে অনুমোদন করা হয়েছে!", "success");
    saveState();
}

function rejectWithdrawal(index) {
    const w = appState.withdrawals[index];
    w.status = "Rejected";
    appState.user.balance += w.amount; // Refund
    showToast("পেমেন্ট বাতিল করা হয়েছে এবং ব্যালেন্স ফেরত দেওয়া হয়েছে", "info");
    saveState();
}

// --- PROFILE SAVING ---
function saveUserProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name-input').value;
    const phone = document.getElementById('profile-phone-input').value;

    if (name && phone) {
        appState.user.name = name;
        appState.user.phone = phone;
        saveState();
        closeModal('profile-modal');
        showToast("প্রোফাইল আপডেট হয়েছে!", "success");
    }
}

// --- MODAL UTILITY ---
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}
