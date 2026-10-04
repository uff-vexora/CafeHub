# CafeHub ☕ — Discover Great Cafes, Reserve Tables & Order Gourmet Food

CafeHub is a production-quality full-stack cafe marketplace web application engineered to feel like a high-growth startup product. It unites passionate coffee roasters, artisan craft bakeries, and modern urban diners with zero-friction table reservations, digital menus, online ordering, and multi-role dashboards for cafe owners and platform administrators.

---

## 🌟 Key Features

### 1. Customer Experience
- **Location & Search**: Live city selector (Mumbai, Bengaluru, New Delhi, Pune, Hyderabad, Jaipur) with instant keyword search across cafe names, roast origins, bakery items, and cuisines.
- **Curated Mood Categories**: Coffee, Breakfast, Brunch, Bakery, Desserts, Work-friendly, Outdoor seating, Date night.
- **Discovery & Advanced Filters (`/cafes`)**:
  - Distance & Open Now toggles
  - Star rating thresholds (4.0+, 4.5+)
  - Price brackets (`₹`, `₹₹`, `₹₹₹`)
  - Amenity checklist: High-speed Wi-Fi, Air conditioning, Outdoor seating, Parking, Pet-friendly, Power outlets, Dedicated work tables
  - Sorting: Recommended, Highest Rated, Nearest Distance, Most Reviewed, Price: Low to High
- **Cafe Detail Experience (`/cafes/:id`)**:
  - Multi-photo gallery & ambiance showcase
  - Interactive tabs: **Digital Menu**, **Overview & Amenities**, **Diner Reviews**, **Photos**, and **Location & Map**
- **Digital Menu & Customizations**:
  - Category navigation (Coffee, Tea, Breakfast, Snacks, Main Course, Desserts, Cold Drinks)
  - Veg / Non-Veg indicators
  - Detailed customization modal: milk selection (Oat / Almond / Whole), extra espresso shots, add-on proteins, special cooking instructions, and dynamic price calculation
- **Zero-Wait Table Booking**:
  - Interactive 10-day date carousel & morning/afternoon/evening time slot selector
  - Guest counter (1 to 10 guests) & special requests
  - Celebratory confetti on confirmation with unique reservation code (`RES-xxxx`)
- **Cart & Flexible Checkout (`/cart`, `/checkout`)**:
  - Order types: **Dine-In** (with table number), **Takeaway / Pickup**, and **Home Delivery**
  - Live GST (5%) & fee breakdowns
  - Simulated payment flows: Instant UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or Pay at Counter
- **Live Order Tracker (`/orders`)**:
  - Visual 5-stage progress indicator: Order Placed ➔ Confirmed ➔ Preparing ➔ Ready ➔ Completed
  - Interactive "Advance Status" simulator button for demonstration
- **Account Hub (`/account`)**:
  - Profile management, orders history, upcoming & past table reservations, saved favorites, and posted reviews

---

### 2. Cafe Owner Portal (`/owner`)
- Professional SaaS-style control panel:
  - **Overview Metrics**: Today's revenue, incoming order count, table bookings, and average rating
  - **Live Order Pipeline**: Real-time order cards with inline status transition controls (`order_placed` ➔ `confirmed` ➔ `preparing` ➔ `ready` ➔ `completed` ➔ `cancelled`)
  - **Table Reservation Management**: Accept/seat guests, mark completed or cancel
  - **Menu Management**: Add new items with image, category, price, veg toggle; toggle sold out / available; delete items
  - **Cafe Profile Editing**: Update address, operating hours, phone, email, and description
  - **Customer Review Responses**: Post official replies to diner reviews
  - **Sales & Diner Analytics**: Top-selling dishes and distribution across Dine-In, Pickup, and Delivery channels

---

### 3. Super Admin Console (`/admin`)
- Platform-wide governance:
  - Gross GMV, active cafes, processed orders, total diners, and network-wide reviews
  - **Cafe Approvals**: One-click approve newly submitted cafes or suspend violations
  - **User Governance**: Dynamic role promotion (`customer` ⇋ `cafe_owner` ⇋ `admin`)
  - **Transaction Auditing**: Audit feed of all platform orders
  - **Review Moderation**: Remove inappropriate reviews or spam

---

## 🎨 Design Direction & Palette
- **Warm Cream & Off-White Background**: `#FDFBF7` / `#F7F3EA`
- **Dark Espresso & Coffee Accents**: `#140D08`, `#1E140D`, `#8C6543`, `#5C3C24`
- **Terracotta & Caramel Highlights**: `#DE6441`, `#E2971B`
- **Typography**: Google Fonts *Plus Jakarta Sans* (modern UI) & *Playfair Display* (editorial cafe headlines)
- **Cards & Micro-interactions**: Rounded corners (`rounded-3xl`), warm drop shadows (`shadow-warm`), backdrop blur glassmorphism, responsive mobile bottom app bar.

---

## 🗄️ Database Architecture (`supabase_schema.sql`)
A complete PostgreSQL DDL migration script is included at [`supabase_schema.sql`](file:///e:/full%20stack%20projects/cafeApp/supabase_schema.sql) with:
- `profiles` (integrated with Supabase `auth.users`)
- `cafes`, `cafe_images`, `cafe_amenities`, `cafe_categories`
- `menu_categories`, `menu_items`
- `favorites`, `orders`, `order_items`
- `reservations`, `reviews`, `notifications`
- Complete **Row Level Security (RLS)** policies ensuring customer data privacy and merchant authorization
- Indexes on city, ratings, owner_id, and foreign keys

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 3. Production Build & Validation
```bash
npm run build
```

---

## ⚡ Instant Role Switching (Demo Mode)
To test all roles without needing multiple browsers or seed logins:
- Look at the top **Live Demo Role Switcher** bar on any page.
- Click **Customer** to test dining, cart, reservations, and checkout.
- Click **Cafe Owner** to access the `/owner` portal with live orders and menu management.
- Click **Admin** to access `/admin` for platform approvals and role switching.
