# 🚀 SMM Panel (Pure HTML/CSS/JavaScript - No Backend)

এটা SMM Panel-এর **ব্যাকএন্ড-বিহীন static ভার্সন**। কোনো Node.js, PHP, বা ডাটাবেজ সার্ভার লাগবে না — সব ডাটা ব্রাউজারের **localStorage**-এ সেভ হয়।

## ⚠️ গুরুত্বপূর্ণ সীমাবদ্ধতা (অবশ্যই পড়ুন)

- ডাটা শুধু **যে ব্রাউজারে ব্যবহার করা হচ্ছে সেখানেই** সেভ থাকে। অন্য ডিভাইস/ব্রাউজার থেকে লগইন করলে আলাদা ডাটা দেখাবে (কোনো central server নেই)।
- Browser cache/history মুছে ফেললে সব ডাটা (ইউজার, অর্ডার, ব্যালেন্স) হারিয়ে যাবে।
- পাসওয়ার্ড ব্রাউজারেই simple hash আকারে সেভ হয় — এটা **প্রকৃত নিরাপদ security না**, তাই real customer ডাটা বা টাকা নিয়ে কাজ করতে এটা ব্যবহার করবেন না।
- এটা মূলত **ডেমো, প্র্যাকটিস, পোর্টফোলিও, বা offline preview** এর জন্য উপযুক্ত।

আসল কাস্টমার ও পেমেন্ট নিয়ে কাজ করতে চাইলে আগের Node.js ব্যাকএন্ড ভার্সনটাই ব্যবহার করা উচিত, কারণ সেখানে ডাটা সবার জন্য একই সার্ভারে থাকে।

## 📦 কিভাবে ব্যবহার করবেন

কোনো ইনস্টলেশন লাগবে না। শুধু `index.html` ব্রাউজারে ওপেন করুন, অথবা যেকোনো static hosting এ পুরো ফোল্ডারটা আপলোড করুন:

- GitHub Pages
- Netlify / Vercel
- সাধারণ cPanel hosting (শুধু ফাইল আপলোড)

**Default Admin Login:** `admin` / `admin123`

## ✨ Features
- Register/Login (localStorage ভিত্তিক)
- User Dashboard, New Order, My Orders, Add Funds (bKash/Nagad/Rocket manual)
- Admin Panel: Services, Orders status update, Users balance add, Fund Requests approve/reject
- আগের ভার্সনের মতোই প্রিমিয়াম ডিজাইন

## 📤 GitHub Pages-এ Deploy করার নিয়ম

```bash
git init
git add .
git commit -m "SMM Panel static version"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

তারপর GitHub রিপোর **Settings → Pages** এ গিয়ে branch `main` সিলেক্ট করে Save করুন। কিছুক্ষণ পর একটা লাইভ লিংক পাবেন।

## 🔧 কাস্টমাইজেশন

- `add-funds.html` ফাইলে bKash/Nagad/Rocket-এর `data-number` পরিবর্তন করে আপনার আসল নাম্বার বসান
- `js/app.js`-এর `seedDatabase()` ফাংশনে সার্ভিস লিস্ট এডিট করতে পারবেন
