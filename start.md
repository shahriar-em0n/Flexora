## 🚀 প্রজেক্ট রান করার নিয়ম

**দুটো terminal খুলতে হবে:**

**Terminal 1 — Frontend (localhost:3000)**
```bash
cd frontend && npm run dev
```

**Terminal 2 — Admin (localhost:5173)**
```bash
cd admin && npm run dev
```

> ⚠️ **গুরুত্বপূর্ণ:** Admin প্যানেলের URL হলো **`http://localhost:3000/admin`**
> (5173 নয়! Frontend এর proxy দিয়ে same origin-এ serve হয়, তাই localStorage share হয়)

**Login credentials:**
- Email: `admin@flexoraa.com`
- Password: `admin123`

---



তোমার Flexoraa e-commerce এ এখন যা আছে সেটা বেশ solid। আরও যা যা যোগ করা যায়:

🛍️ Customer Experience (Frontend)
High Impact
Product Search — Live search with instant results as you type (currently search icon আছে কিন্তু কাজ করে না)
Product Image Zoom — Hover করলে zoom হয়, gallery swipe কাজ করে
Size Guide popup — প্রতিটা product এ size chart modal
Recently Viewed — "আপনি recently দেখেছেন" section (localStorage-based)
Stock Indicator — "Only 3 left!" type urgency badge
Product Reviews on Page — Customer reviews directly on product page
Medium Impact
Dark Mode — Toggle for dark/light (আজকাল সবার demand)
Currency toggle — BDT / USD switcher
Skeleton Loaders — Loading এর সময় blank এর বদলে shimmer effect
Order Tracking page — /account/orders/:id এ real-time status timeline
Email OTP Login — Password ছাড়া email OTP দিয়ে login
💳 Checkout & Payments
Guest Checkout — Account ছাড়াই order দেওয়ার option
bKash Deep Link — বাটন চাপলে সরাসরি bKash app খুলবে
Nagad / Rocket support — Alternative MFS payment options
Saved Addresses — Checkout এ আগের address auto-fill
Promo code at checkout — Already আছে backend এ, UI তে smooth করা দরকার
📊 Admin Dashboard
Real-time notifications — নতুন order এলে browser notification
Order auto-print — Invoice thermal print support (58mm)
Bulk Steadfast export — Multiple orders একসাথে Steadfast এ পাঠানো
Stock alerts email — Low stock হলে admin কে email
Sales report PDF — Monthly report generate করে download
Abandoned Cart tracking — Cart এ রেখে চলে যাওয়া customers
📱 Mobile & Performance
PWA (Progressive Web App) — "Add to Home Screen" করলে app এর মতো কাজ করবে
Push Notifications — Order update, sale alert
Image lazy loading & WebP — Page speed অনেক বাড়বে
Bottom Navigation bar (Mobile) — Home / Search / Cart / Account — mobile UX অনেক উন্নত হবে
🔔 Marketing & Retention
Wishlist sharing — Wishlist link share করার option
Referral system — Refer করলে discount পাবে
Flash Sale countdown timer — Homepage এ countdown
Abandoned cart email — Cart ছেড়ে গেলে reminder email
SMS notification — Order confirm/shipped SMS (বাংলাদেশে SMS সবচেয়ে effective)
আমার recommendation — এগুলো আগে করো:

🔍 Live Product Search — সবচেয়ে বেশি ব্যবহার হয়
📱 Mobile bottom nav bar — তোমার user বেশিরভাগই mobile এ
🔔 SMS notification — বাংলাদেশে email এর চেয়ে SMS বেশি কার্যকর
💜 bKash deep link — Checkout drop-off কমবে
📦 Order tracking timeline — Customer বারবার call করবে না
কোনটা আগে করতে চাও? আমি implement করে দিতে পারি! 🚀

