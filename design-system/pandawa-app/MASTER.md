# Design System Master File: Pandawa App

> **Source of Truth:** Clean White Modern Swiss UI with 3-Color Logo Palette.
> Strictly NO emoticons (emojis). Minimal guide text.

---

**Project:** Pandawa App (Sistem Informasi Manajemen Organisasi Kepemudaan)  
**Style Category:** Modern Swiss Minimalism & Pure White Base  
**Target Organization:** Pandawa (Wanangsri, Tening, Wonoboyo, Temanggung)  
**Official Brand Colors:** Extracted from `public/logo.png` (`#D8AC41` Gold on `#FFFFFF` White)

---

## 1. Color Palette (White Base + 3-Color Scheme)

| Role | Hex | Tailwind Utility | Usage |
|------|-----|------------------|-------|
| **Base Background** | `#FFFFFF` | `bg-white` | Main page background, cards, sheets, pure crisp surface |
| **Surface Secondary** | `#F8FAFC` | `bg-slate-50` | App shell background, table headers, subtle wells |
| **Color 1: Logo Gold (Brand)** | `#D8AC41` | `text-[#D8AC41]`, `bg-[#D8AC41]` | Official logo emblem, active tabs, brand accents, premium tags |
| **Logo Gold Dark (A11y Text)** | `#B4821E` | `text-[#B4821E]` | High-contrast gold text on white (> 4.5:1 ratio) |
| **Color 2: Obsidian Slate (Dark)** | `#0F172A` | `bg-slate-900`, `text-slate-900` | Primary buttons, deep headings, high contrast typography |
| **Color 3: Cool Slate (Muted)** | `#64748B` | `text-slate-500`, `border-slate-200` | Subtitles, secondary text, metadata labels, borders |
| **Border / Divider** | `#E2E8F0` | `border-slate-200` | 1px clean crisp borders, table rules |
| **Status: Success** | `#059669` | `text-emerald-700 bg-emerald-50` | Active, approved, published, return confirmed |
| **Status: Pending / Alert** | `#D97706` | `text-amber-700 bg-amber-50` | Draft, waiting approval, internal loan |
| **Status: Danger / Emergency** | `#DC2626` | `text-rose-700 bg-rose-50` | Confidential report, expense rejection, overdue |

---

## 2. Typography & Text Discipline

- **Font Family:** `Inter`, system-ui, sans-serif
- **Rule on Guide Text:** **MINIMIZE GUIDE TEXT**.
  - ❌ Avoid wordy explanatory paragraphs ("Silakan isi form ini untuk mengajukan...", "Halaman ini digunakan untuk...").
  - ✅ Use concise semantic labels, crisp placeholders, and direct micro-copy ("Ajukan Surat", "Nomor Surat", "Total Saldo").
- **Strictly NO Emoticons (Emojis):**
  - ❌ Forbidden: 💰, 📅, 📄, 📦, 👥, 🚨, ✨, 🚀, 🏛️, 🛠️, etc.
  - ✅ Required: Lucide SVG icons (`Wallet`, `Calendar`, `FileText`, `Package`, `Users`, `ShieldAlert`) with consistent `h-4 w-4` or `h-5 w-5` sizing and 1.5–2px stroke.

---

## 3. Component Architecture

### Buttons
- **Primary:** `bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer`
- **Brand Accent:** `bg-[#D8AC41] text-slate-900 hover:bg-[#c69b36] text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer`
- **Secondary / Outline:** `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer`
- **Ghost:** `text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer`

### Cards & Panels
- **Standard Card:** `rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]`
- **Interactive Card:** `rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer`
- **Stat Metric:** Large bold number (`text-2xl font-bold tracking-tight text-slate-900`), small uppercase label (`text-[11px] font-semibold tracking-wider text-slate-500 uppercase`).

### Inputs & Selects
- `h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none transition-colors`

### Navigation & Header
- **Top HeaderBar:** Clean white background (`bg-white/95 backdrop-blur border-b border-slate-200`), Pandawa logo (`/logo.png`) with brand gold accent badge.
- **BottomNav:** Clean white (`bg-white border-t border-slate-200`), active item highlighted with `#D8AC41` brand gold and dark slate typography.

---

## 4. Verification Checklist
- [x] Pure white base (`#FFFFFF`) with `#0F172A` (Obsidian) and `#D8AC41` (Logo Gold)
- [x] Zero emoticons in all UI components and documentation
- [x] Guide text minimized to concise labels
- [x] All interactive controls have `cursor-pointer` and visible hover/focus states
- [x] Mobile-first layout fully responsive at 375px, 768px, and desktop
