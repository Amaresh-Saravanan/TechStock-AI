# Product Requirements Document (PRD) — TechStock-AI

> **Version**: 1.1 · **Date**: 2026-07-26 · **Status**: Draft (Updated for Django Architecture)

---

## 1. Product Vision & Objectives

### 1.1 Vision Statement
TechStock-AI is an AI-powered inventory intelligence platform that transforms how Indian computer hardware retailers manage stock, price products, and maximize profitability — replacing spreadsheets and gut instincts with data-driven decision-making.

### 1.2 Objectives
| # | Objective | Measurable Target |
|---|-----------|-------------------|
| O1 | Reduce dead stock holding costs | ≤5% inventory unsold >60 days |
| O2 | Optimize competitive pricing | Maintain ≤3% price deviation from market avg |
| O3 | Prevent stockouts on high-demand items | Zero stockouts on items with demand score ≥85 |
| O4 | Improve profit margins | Avg margin ≥18% across all categories |
| O5 | Accelerate restocking decisions | Decision-to-order time <24 hours |

---

## 2. Target Users & Personas

### Persona 1: **Rajesh — Small Retailer (Primary)**
- Runs a single-store PC hardware shop in Tier 2 city
- Manages 50–200 SKUs, 2–3 staff
- Currently tracks inventory in Excel; prices by calling suppliers
- **Pain**: Can't match online prices, doesn't know what to restock until out of stock

### Persona 2: **Priya — Multi-Store Manager**
- Manages 3 outlets, 500+ SKUs, 10+ staff
- Needs centralized visibility across stores
- **Pain**: Inconsistent pricing between stores, no unified sales analytics

### Persona 3: **Amit — Online + Offline Hybrid Seller**
- Sells on Amazon/Flipkart + physical store
- Needs real-time competitor price matching
- **Pain**: Manual price monitoring across 4+ platforms is unsustainable

---

## 3. Feature Requirements

### 3.1 Functional Requirements

| ID | Feature | Priority | Current State | File References / Target Architecture |
|----|---------|----------|---------------|-------------------------------------|
| F1 | **Dashboard** — KPI cards, AI insight, recommendations, alerts | P0 | ✅ Implemented | `src/pages/Dashboard.tsx`, `backend/app.py L512-543` → `apps/analytics` (Django) |
| F2 | **Inventory CRUD** — Add/edit/delete items with demand scoring | P0 | ✅ Implemented | `src/pages/Inventory.tsx`, `backend/app.py L545-631` → `apps/inventory` (Django ORM) |
| F3 | **Price Tracker** — Competitor comparison (Amazon, Flipkart, MDComputers, PrimeABGB) | P0 | ✅ Mock data | `src/pages/PriceTracker.tsx` → `apps/price_tracker` + Celery |
| F4 | **Price Prediction** — ML-based future price forecasting | P0 | ✅ Polynomial regression | `backend/app.py L241-272` → `apps/analytics/ml` |
| F5 | **Sales Recording** — Record sales, track profit, customer info | P0 | ✅ Implemented | `src/pages/SalesDashboard.tsx` → `apps/sales` (Django ORM) |
| F6 | **AI Chat** — Gemini-powered inventory advisor with live context | P1 | ✅ With fallback | `src/components/AIChat.tsx` → `apps/ai_advisor` (Django Ninja Async) |
| F7 | **Alert System** — Dead stock, low stock, price drop notifications | P1 | ✅ Implemented | `src/pages/Alerts.tsx` → Celery background tasks |
| F8 | **PC Build Generator** — AI/rule-based build recommendation | P2 | ✅ Implemented | `src/pages/BuildGenerator.tsx` → `apps/ai_advisor` |
| F9 | **Buy Timing Optimizer** — Best time to purchase stock | P2 | ✅ Frontend only | `src/pages/BuyTiming.tsx` → `apps/analytics` |
| F10 | **Authentication** — User login/register & Role-based access | P0 | ⚠️ Backend done, frontend stub | `src/contexts/AuthContext.tsx` → Django Auth + SimpleJWT |
| F11 | **Admin Control Panel** — Store management, user management & catalog management | P0 | 🆕 Target | Built-in **Django Admin (`/admin`)** |

### 3.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NF1 | Page load time | <2s on 4G connection |
| NF2 | API response time | <300ms for CRUD (Django Ninja / DRF), <3s for AI |
| NF3 | Concurrent users | Support 500+ simultaneous (Django + Neon PostgreSQL + Gunicorn/Uvicorn) |
| NF4 | Data freshness | Competitor prices updated every 6 hours via Celery tasks |
| NF5 | Availability | 99.5% uptime |
| NF6 | Mobile responsiveness | Full functionality on 375px+ screens |

---

## 4. User Stories with Acceptance Criteria

### US-1: Dashboard Overview
> *As a retailer, I want to see my key metrics at a glance so I can make quick decisions.*
- **AC1**: Dashboard shows total inventory value, monthly profit, dead stock count, low stock count
- **AC2**: AI Insight card recommends the best product action with confidence score
- **AC3**: Top 4 recommendations and alerts displayed without scrolling

### US-2: Inventory Management
> *As a retailer, I want to add/edit/delete products with AI-enhanced demand scores.*
- **AC1**: Add new product with name, category, brand, purchase/selling price, quantity
- **AC2**: Each product shows computed demand score (recency × scarcity × category trend)
- **AC3**: Dead stock items (>60 days unsold) auto-flagged with warning badge

### US-3: Competitive Pricing & Background Scrape
> *As a retailer, I want to see how my prices compare to Amazon, Flipkart, MDComputers, and PrimeABGB.*
- **AC1**: Price comparison table with color-coded status (Higher/Lower/Optimal)
- **AC2**: AI-recommended selling price calculated from competitor avg + margin buffer
- **AC3**: 30-day price history chart per product auto-updated via Celery background tasks

### US-4: AI Chat Assistant
> *As a retailer, I want to ask natural language questions about my inventory.*
- **AC1**: Chat connects to Gemini AI via Django Async views with live inventory context injected
- **AC2**: Fallback keyword-based responses when API key is missing
- **AC3**: Quick prompt buttons for common queries (restock, dead stock, trending, profit)

### US-5: Sales & Profit Tracking
> *As a retailer, I want to record sales and track my profitability over time.*
- **AC1**: Record sale with product, quantity, price, customer info
- **AC2**: Auto-calculate profit and margin per transaction
- **AC3**: Analytics view with revenue trends, category distribution, top sellers

---

## 5. Success Metrics & KPIs

| Metric | Current | Target (6 months) | Measurement Method |
|--------|---------|--------------------|--------------------|
| Dead stock ratio | Unknown | <5% of SKUs | `lastSoldDays > 60` count / total |
| Avg profit margin | ~20% (mock) | ≥18% real data | `(selling - purchase) / purchase` |
| Price competitiveness | Not tracked | Within 3% of market | Competitor avg delta |
| User retention (DAU/MAU) | N/A | >40% | Analytics tracking |
| AI recommendation adoption rate | N/A | >25% actions taken | Click-through on recommendations |
| Stockout frequency | N/A | <2 per month | Low stock alerts → 0 quantity events |

---

## 6. Constraints & Assumptions

### Constraints
- **Legacy codebase**: Monolithic Flask `app.py` (1,488 lines) will be migrated to modular Django 5.0+ apps
- **Budget**: Free-tier infrastructure (Neon PostgreSQL, Upstash Redis, Vercel, Railway, free Gemini API quota)
- **Data**: Competitor prices currently mock data; moving to Celery web scraping pipeline
- **Auth gap**: Frontend `src/contexts/AuthContext.tsx` uses stub `setUser` without actual API calls — migrating to Django SimpleJWT

### Assumptions
- Target market is Indian hardware retailers (₹ currency, Indian competitors)
- Users have reliable internet (no offline-first requirement initially)
- Django Admin will serve as the back-office management console for system administrators

---

## 7. Future Roadmap

| Phase | Feature | Target Tech | Timeline |
|-------|---------|-------------|----------|
| Phase 2 | Django Migration (Django 5.0 + Neon PostgreSQL + SimpleJWT) | Django + Neon | Q3 2026 |
| Phase 2 | Real competitor price scraping with Celery + Redis | Celery + Redis | Q3 2026 |
| Phase 3 | Multi-store support with inventory transfer | Django ORM Multi-tenant | Q4 2026 |
| Phase 3 | Supplier management & purchase order automation | Django Admin + DRF | Q4 2026 |
| Phase 4 | Mobile app (React Native) | Django Ninja API | Q1 2027 |
| Phase 4 | WhatsApp/Telegram bot for alerts | Celery Webhooks | Q1 2027 |
| Phase 5 | Multi-tenancy SaaS with subscription plans | Django Tenants | Q2 2027 |

---

## Summary Table

| Section | Key Takeaway |
|---------|-------------|
| Vision | AI-first inventory management for Indian PC hardware retailers |
| Target Stack | **React 18 + Vite (Frontend)** + **Django 5.0 / DRF / Django Ninja (Backend)** + **Neon PostgreSQL (DB)** |
| Key Benefit | Built-in Django Admin (`/admin`), robust ORM, SimpleJWT auth, Celery task queue |
| Critical Gap | Legacy Flask backend & mock frontend data to be replaced during Django migration |
| Success | Dead stock <5%, margins ≥18%, <3% price deviation |
