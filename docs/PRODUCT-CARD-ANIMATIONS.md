# Product card animations – details

Product cards use the same behaviour on the **index** (Our Products grid), **products** page, and **category** pages (e.g. household, compostable). All of it is CSS; no JS is required for these animations.

---

## 1. Card link wrapper (`a.product-card-link`)

- **Purpose:** Wraps the whole card so the entire card is clickable.
- **Styles:** `position: relative`, `overflow: visible`
- **Animation:** None on the wrapper itself.

---

## 2. “View →” button on hover (`a.product-card-link::after`)

- **Purpose:** Pseudo-element that looks like a “View →” button, shown on hover.
- **Default state:**
  - `opacity: 0`
  - `transform: translateX(-50%) translateY(8px)` (slightly below final position)
  - Red pill style: `background: var(--red)`, rounded, small shadow
- **Hover state (`a.product-card-link:hover::after`):**
  - `opacity: 1`
  - `transform: translateX(-50%) translateY(0)`
- **Transition:** `opacity 0.3s`, `transform 0.3s var(--ease-back)` so it fades in and moves up.

---

## 3. Card container (`.product-card`)

- **Purpose:** White rounded card with shadow and fixed aspect ratio.
- **Layout:** `aspect-ratio: 1 / 1`, `overflow: hidden`, `border-radius`, `box-shadow: var(--shadow-card)`.
- **Transitions:**
  - `transform 0.4s var(--ease-smooth)`
  - `box-shadow 0.4s var(--ease-smooth)`
- **Hover:** `box-shadow: var(--shadow-md)` for a stronger shadow.

---

## 4. Card shine overlay (`.product-card::before`)

- **Purpose:** Light gradient overlay that appears on hover.
- **Default:** `opacity: 0` (invisible).
- **Hover (`.product-card:hover::before`):** `opacity: 1`.
- **Gradient:** `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)`.
- **Transition:** `opacity 0.4s var(--ease-smooth)`.

---

## 5. Product image zoom on hover (`.product-img` and `.product-card:hover .product-img`)

- **Purpose:** Image scales up slightly when the card is hovered.
- **Default:** No scale (effectively `scale(1)`).
- **Hover:** `transform: scale(1.08)`.
- **Transition (on `.product-img`):** `transform 0.5s var(--ease-smooth)`.

---

## 6. Products section entrance (products page only)

- **Scope:** `.products-page-section .products-page-inner` (products.html).
- **Animation:** `products-section-in` keyframes, `0.8s var(--ease-out) forwards`.
- **From:** `opacity: 0`, `transform: translateY(24px)`.
- **To:** `opacity: 1`, `transform: translateY(0)`.
- **Effect:** The whole products section fades in and moves up once when the page loads.

---

## 7. Optional: two-image cards (e.g. Maya)

- **Purpose:** Some cards show one image by default and another on hover.
- **Classes:** `.product-card-img-default`, `.product-card-img-hover`.
- **Default:** Default image visible; hover image `opacity: 0`.
- **Hover:** Default `opacity: 0`, hover `opacity: 1`.
- **Transition:** `opacity 0.35s ease` on both.

---

## Summary table

| Element              | Trigger | Effect                                      | Duration / easing        |
|----------------------|--------|---------------------------------------------|--------------------------|
| “View →” pill        | Hover  | Fade in + move up                           | 0.3s, ease-back          |
| Card shadow          | Hover  | Stronger shadow                             | 0.4s, ease-smooth        |
| Card ::before shine  | Hover  | Overlay fade in                             | 0.4s, ease-smooth        |
| Product image        | Hover  | Scale to 1.08                               | 0.5s, ease-smooth        |
| Section (products)   | Load   | Fade in + translateY 24px → 0               | 0.8s, ease-out           |

---

## CSS files

- **Global card styles and hover:** `assets/css/styles.css` (around lines 1327–1438).
- **Products page and “View →” / section animation:** `assets/css/products.css` (around lines 69–119).
