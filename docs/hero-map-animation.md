# Hero Map Animation — Step-by-Step (Clients Page)

This document describes the full animation sequence of the hero world map on the **Clients** page (`clients.html`), in the order it runs.

**Important:** Dotted lines to the locations do **not** appear with the map. They are hidden (opacity 0) until after the red circles (markers) have appeared; then the **Mauritius** label and the **first** dotted arc (to Dubai) show and animate, followed by the rest one by one.

---

## 1. Map appears (0s → 2s)

- **What:** The world map container (`.clients-map-wrap`) has class `map-intro-anim`. Only the map is visible — no dotted lines yet.
- **Dotted lines:** All arc paths are in the DOM but **hidden** (opacity 0) until each arc’s start time. So during this phase you see **only the map**; no dotted lines to any location.
- **Animation:** `mapIntroZoom` (CSS keyframes).
  - **0%:** Map scale 3.2, opacity 0 (zoomed in, invisible).
  - **12%:** Opacity 1 (map fades in).
  - **100%:** Scale 1, opacity 1 (zoomed out to full view).
- **Duration:** 2s.  
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)`.  
- **Transform origin:** 67% 48% (slightly right of centre).

---

## 2. Red circles (markers) appear (1.1s → 1.7s)

- **What:** The six location markers (red circles) on the map — Mauritius, Rodrigues Is., India, China, Vietnam, Dubai.
- **Animation:** `heroMarkerPop` (CSS).
  - **0%:** Opacity 0, scale 0 (invisible, no size).
  - **100%:** Opacity 1, scale 1 (visible, full size).
- **Duration:** 0.55s per marker.  
- **Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)`.  
- **Stagger (animation-delay):**
  - Marker 1 (Mauritius): 1.1s  
  - Marker 2 (Rodrigues Is.): 1.22s  
  - Marker 3 (India): 1.34s  
  - Marker 4 (China): 1.46s  
  - Marker 5 (Vietnam): 1.58s  
  - Marker 6 (Dubai): 1.7s  
- So all six markers have appeared by about **2.25s**.

---

## 3. Mauritius label + first dotted arc (2.4s → 3.75s)

- **What:** Only now do dotted lines start. The text label **“Mauritius”** fades in, and the **first dotted arc** becomes visible and starts drawing from the Mauritius red circle to Dubai.
- **Visibility:** The first arc path has opacity 0 until 2.4s; at 2.4s it gets opacity 1 (via SVG `animate`), then the draw runs. No other arcs are visible yet.
- **Label:** “Mauritius” uses `.hero-map-location-label` with `heroLabelFadeIn` (opacity 0→1, scale 0.9→1), **animation-delay: 2.4s**.
- **Arc:** Dotted path (stroke-dasharray 4 8) from Mauritius to **Dubai**.
  - **Draw animation (SVG):** `stroke-dashoffset` from full path length to 0.  
  - **Begin:** 2.4s. **Duration:** 1.35s. **Fill:** freeze (stays visible).  
- So the first arc is fully drawn by **2.4 + 1.35 = 3.75s**.

---

## 4. Dubai label (3.75s)

- **What:** When the Mauritius → Dubai arc finishes, the **“Dubai”** label appears.
- **Label:** “Dubai” has **animation-delay: 3.75s** (same as arc 1 end time).  
- Same fade-in as other labels.

---

## 5. Second dotted arc: Mauritius → India (3.75s → 5.1s)

- **What:** Second dotted arc draws from Mauritius to **India** (no other new arcs yet).
- **Arc begin:** 2.4 + 1×1.35 = **3.75s**. **Duration:** 1.35s. Ends at **5.1s**.

---

## 6. India label (5.1s)

- **What:** “India” label appears when the arc to India finishes.  
- **Animation-delay:** 5.1s.

---

## 7. Third dotted arc: Mauritius → Rodrigues Is. (5.1s → 6.45s)

- **Arc begin:** 2.4 + 2×1.35 = **5.1s**. **Duration:** 1.35s. Ends at **6.45s**.

---

## 8. Rodrigues Is. label (6.45s)

- **Animation-delay:** 6.45s.

---

## 9. Fourth dotted arc: Mauritius → China (6.45s → 7.8s)

- **Arc begin:** 2.4 + 3×1.35 = **6.45s**. **Duration:** 1.35s. Ends at **7.8s**.

---

## 10. China label (7.8s)

- **Animation-delay:** 7.8s.

---

## 11. Fifth dotted arc: Mauritius → Vietnam (7.8s → 9.15s)

- **Arc begin:** 2.4 + 4×1.35 = **7.8s**. **Duration:** 1.35s. Ends at **9.15s**.

---

## 12. Vietnam label (9.15s)

- **Animation-delay:** 9.15s.  
- After this, all five arcs are drawn and all six location labels (including Mauritius) are visible.

---

## 13. Continuous dotted-line animation (same speed, after each arc)

- **What:** After each arc’s initial draw finishes, a **second SVG animation** runs on that same path.
- **Effect:** The dotted pattern (4px dash, 8px gap) moves along the path so the line keeps “flowing” at the same perceived speed as the draw.
- **Animation:** `stroke-dashoffset` from **0** to **-12** (one full dash+gap cycle).  
  **Duration:** **1.35s** (same as the draw). **Repeat:** indefinite. **Begin:** when that arc’s draw ends (e.g. first arc: 3.75s, second: 5.1s, …).
- So each arc keeps animating at **1.35s per cycle** forever, with no slowdown after all countries are covered.

---

## Summary timeline (seconds)

| Time (s) | Event |
|----------|--------|
| 0–2     | Map intro zoom |
| 1.1–1.7 | Red circles pop in (staggered) |
| 2.4     | Mauritius label + arc 1 (→ Dubai) starts |
| 3.75    | Dubai label; arc 1 draw ends; arc 1 flow starts; arc 2 (→ India) starts |
| 5.1     | India label; arc 2 draw ends; arc 2 flow starts; arc 3 (→ Rodrigues) starts |
| 6.45    | Rodrigues Is. label; arc 3 draw ends; arc 3 flow starts; arc 4 (→ China) starts |
| 7.8     | China label; arc 4 draw ends; arc 4 flow starts; arc 5 (→ Vietnam) starts |
| 9.15    | Vietnam label; arc 5 draw ends; arc 5 flow starts |

**Arc order:** Dubai → India →  China → Vietnam→  Rodrigues   
**Arc duration:** 1.35s draw, then 1.35s repeating flow (same speed).
