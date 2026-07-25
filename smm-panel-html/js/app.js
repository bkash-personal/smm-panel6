/* ================= SMM PANEL - localStorage DB layer ================= */
const DB_KEYS = {
  users: 'smm_users',
  services: 'smm_services',
  orders: 'smm_orders',
  funds: 'smm_funds',
  session: 'smm_session',
  ids: 'smm_ids'
};

function getData(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* simple non-cryptographic hash - NOTE: for demo purposes only, not secure */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(36) + str.length;
}

function nextId(type) {
  const ids = getData(DB_KEYS.ids, { user: 1, order: 1, service: 7, fund: 1 });
  const id = ids[type]++;
  setData(DB_KEYS.ids, ids);
  return id;
}

/* ---------------- Seed default data on first load ---------------- */
function seedDatabase() {
  if (!localStorage.getItem(DB_KEYS.services)) {
    setData(DB_KEYS.services, [
      { id: 1, category: 'Facebook', name: 'Facebook Page Likes', rate: 50, min: 100, max: 50000, description: 'High quality Facebook page likes. Non-drop.' },
      { id: 2, category: 'Facebook', name: 'Facebook Post Likes', rate: 30, min: 50, max: 20000, description: 'Real Facebook post likes.' },
      { id: 3, category: 'Instagram', name: 'Instagram Followers', rate: 80, min: 100, max: 100000, description: 'Instagram followers, instant start.' },
      { id: 4, category: 'Instagram', name: 'Instagram Likes', rate: 25, min: 50, max: 50000, description: 'Real Instagram post likes.' },
      { id: 5, category: 'YouTube', name: 'YouTube Views', rate: 40, min: 500, max: 1000000, description: 'YouTube video views, high retention.' },
      { id: 6, category: 'TikTok', name: 'TikTok Followers', rate: 60, min: 100, max: 50000, description: 'TikTok followers, real looking profiles.' }
    ]);
  }
  if (!localStorage.getItem(DB_KEYS.users)) {
    setData(DB_KEYS.users, [
      {
        id: nextId('user'),
        username: 'admin',
        email: 'admin@panel.local',
        password: simpleHash('admin123'),
        balance: 0,
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ]);
  }
  if (!localStorage.getItem(DB_KEYS.orders)) setData(DB_KEYS.orders, []);
  if (!localStorage.getItem(DB_KEYS.funds)) setData(DB_KEYS.funds, []);
  if (!localStorage.getItem(DB_KEYS.ids)) setData(DB_KEYS.ids, { user: 2, order: 1, service: 7, fund: 1 });
}
seedDatabase();

/* ---------------- Auth helpers ---------------- */
function getCurrentUser() {
  const session = getData(DB_KEYS.session, null);
  if (!session) return null;
  const users = getData(DB_KEYS.users, []);
  return users.find((u) => u.id === session.userId) || null;
}

function loginUser(username, password) {
  const users = getData(DB_KEYS.users, []);
  const user = users.find((u) => u.username === username);
  if (!user || user.password !== simpleHash(password)) return { ok: false, error: 'ইউজারনেম বা পাসওয়ার্ড ভুল।' };
  setData(DB_KEYS.session, { userId: user.id });
  return { ok: true, user };
}

function registerUser(username, email, password) {
  const users = getData(DB_KEYS.users, []);
  if (!username || !email || !password) return { ok: false, error: 'সব ফিল্ড পূরণ করুন।' };
  if (users.find((u) => u.username === username)) return { ok: false, error: 'এই ইউজারনেম আগে থেকেই আছে।' };
  if (users.find((u) => u.email === email)) return { ok: false, error: 'এই ইমেইল আগে থেকেই ব্যবহৃত হয়েছে।' };

  const newUser = {
    id: nextId('user'),
    username,
    email,
    password: simpleHash(password),
    balance: 0,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  setData(DB_KEYS.users, users);
  setData(DB_KEYS.session, { userId: newUser.id });
  return { ok: true, user: newUser };
}

function logoutUser() {
  localStorage.removeItem(DB_KEYS.session);
}

function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '../login.html';
    return null;
  }
  if (user.role !== 'admin') {
    alert('Admin only page.');
    window.location.href = '../dashboard.html';
    return null;
  }
  return user;
}

function saveUser(updatedUser) {
  const users = getData(DB_KEYS.users, []);
  const idx = users.findIndex((u) => u.id === updatedUser.id);
  if (idx !== -1) {
    users[idx] = updatedUser;
    setData(DB_KEYS.users, users);
  }
}

/* ---------------- Navbar renderer ---------------- */
function renderNavbar(basePath = '') {
  const user = getCurrentUser();
  const el = document.getElementById('navbar');
  if (!el) return;

  if (!user) {
    el.innerHTML = '';
    return;
  }

  const isAdmin = user.role === 'admin';
  const links = isAdmin
    ? [
        ['admin/dashboard.html', 'bi-speedometer2', 'Dashboard'],
        ['admin/services.html', 'bi-stack', 'Services'],
        ['admin/orders.html', 'bi-box-seam', 'Orders'],
        ['admin/users.html', 'bi-people', 'Users'],
        ['admin/funds.html', 'bi-cash-coin', 'Fund Requests']
      ]
    : [
        ['dashboard.html', 'bi-speedometer2', 'Dashboard'],
        ['services.html', 'bi-list-check', 'Services'],
        ['new-order.html', 'bi-cart-plus', 'New Order'],
        ['orders.html', 'bi-box-seam', 'My Orders'],
        ['add-funds.html', 'bi-wallet2', 'Add Funds']
      ];

  const navLinks = links
    .map(([href, icon, label]) => `<li class="nav-item"><a class="nav-link" href="${basePath}${href}"><i class="bi ${icon}"></i> ${label}</a></li>`)
    .join('');

  const balancePart = isAdmin ? '' : `&nbsp;|&nbsp; <i class="bi bi-wallet-fill"></i> ৳${user.balance.toFixed(2)}`;

  el.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <a class="navbar-brand" href="${basePath}${isAdmin ? 'admin/dashboard.html' : 'dashboard.html'}"><i class="bi bi-rocket-takeoff-fill me-1"></i> SMM Panel</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto">${navLinks}</ul>
          <span class="navbar-text me-3">
            <i class="bi bi-person-circle"></i> ${user.username} ${balancePart}
          </span>
          <a href="#" onclick="logoutUser(); window.location.href='${basePath}login.html'; return false;" class="btn btn-outline-light btn-sm"><i class="bi bi-box-arrow-right"></i> Logout</a>
        </div>
      </div>
    </nav>`;
}
