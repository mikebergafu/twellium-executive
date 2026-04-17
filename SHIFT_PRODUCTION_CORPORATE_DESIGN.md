# Shift Production Metrics - Corporate Design

## Overview
Clean, professional, and simple corporate design for the **Shift Production Metrics** section on the `/dashboard` page.

---

## Design Principles

### ✅ Corporate & Professional
- **Minimal gradients** - Flat, clean colors
- **Simple borders** - Standard Bootstrap borders
- **Consistent spacing** - Professional layout
- **Clear typography** - Easy to read at all sizes

### ✅ Simple & Functional
- **No excessive animations** - Instant load, no distractions
- **Direct data display** - Numbers speak for themselves
- **Standard components** - Bootstrap cards and badges
- **Clean icons** - Tabler icons, consistent size

### ✅ Easy to Maintain
- **Simple component structure** - Easy to understand
- **No complex state** - Props-driven rendering
- **Standard Bootstrap classes** - No custom CSS needed
- **Reusable components** - Use in other pages

---

## Files Created

### 1. `/src/components/production/CorporateStatCard.jsx`
Simple stat card with:
- Clean border and white background
- Icon in light blue circle
- Optional trend indicator
- Clear typography hierarchy

**Props:**
```javascript
{
    title: string,        // Card title (e.g., "PET 1")
    value: number,        // Main value to display
    unit: string,         // Unit label (e.g., "bottles", "min")
    icon: string,         // Tabler icon name
    trend: number|null,   // Optional trend percentage
    subtitle: string      // Optional subtitle
}
```

### 2. `/src/components/charts/CorporateGaugeChart.jsx`
Simple semi-circle gauge with:
- Clean SVG rendering
- Single color based on value (green/yellow/red)
- Simple tick marks and labels
- Status badge (On Target/Acceptable/Below Target)

**Props:**
```javascript
{
    value: number,        // Gauge value (0-100)
    label: string,        // Gauge label (e.g., "PET 1")
    size: number          // Gauge size in pixels (default: 180)
}
```

---

## Files Modified

### `/src/pages/dashboard/Overview.jsx`
Updated imports and Shift Production Metrics section:

**Before:** Complex gradients, animations, multiple sections
**After:** Simple cards, clean layout, single summary row

**Structure:**
1. **Summary Stats Row** - 4 key metrics in light gray boxes
   - Total Production
   - Total Downtime
   - Average OEE
   - Best Performer

2. **Production Output by PET** - Stat cards for each PET line

3. **Downtime by PET** - Stat cards with status indicators

4. **OEE Efficiency by PET** - Simple gauge charts

---

## Visual Design

### Color Scheme
- **Primary**: `#2563eb` (Blue) - Icons, buttons
- **Success**: `#16a34a` (Green) - Good values, on target
- **Warning**: `#d97706` (Yellow) - Acceptable values
- **Danger**: `#dc2626` (Red) - Below target, issues
- **Background**: `#f3f4f6` (Light gray) - Summary boxes
- **Borders**: `#e5e7eb` (Gray) - Card borders

### Typography
- **Headers**: 0.9rem, fw-semibold
- **Labels**: 0.75rem, text-muted, uppercase
- **Values**: 1.25rem - 1.5rem, fw-bold
- **Units**: 0.875rem, text-muted

### Spacing
- **Card padding**: Standard Bootstrap (p-3, p-4)
- **Gaps**: g-3 (1rem) for consistent spacing
- **Margins**: mb-3, mb-4 for section separation

---

## Component Usage

### CorporateStatCard Example
```javascript
import CorporateStatCard from '../../components/production/CorporateStatCard';

<CorporateStatCard
    title="PET 1"
    value={12500}
    unit="bottles"
    icon="bottle"
    subtitle="Within Target"
/>
```

### CorporateGaugeChart Example
```javascript
import CorporateGaugeChart from '../../components/charts/CorporateGaugeChart';

<CorporateGaugeChart
    value={87.5}
    label="PET 1"
    size={180}
/>
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Shift Production Metrics                            │
│ [Day Shift] 06:00 - 18:00   [Day] [Night] [All]    │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ Summary Stats (4 boxes)                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │
│ │Total │ │Total │ │ Avg  │ │ Best │                │
│ │Prod  │ │Down  │ │ OEE  │ │ Perf │                │
│ └──────┘ └──────┘ └──────┘ └──────┘                │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ Production Output by PET                            │
│ [Card] [Card] [Card] [Card] [Card]                  │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ Downtime by PET                                     │
│ [Card] [Card] [Card] [Card] [Card]                  │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ OEE Efficiency by PET                               │
│ [Gauge] [Gauge] [Gauge] [Gauge] [Gauge]            │
└─────────────────────────────────────────────────────┘
```

---

## Key Changes from Previous Design

| Feature | Before | After |
|---------|--------|-------|
| Gradients | Multiple gradient backgrounds | Flat colors |
| Animations | Slide, fade, scale, hover effects | None |
| Card Style | Shadow, lifted hover | Simple border |
| Gauge | Complex with glow effects | Simple SVG |
| Summary | Gradient background box | Light gray boxes |
| Trend Indicators | Always shown | Optional |
| Progress Bars | Target comparison | Text status only |
| Icons | Large with backgrounds | Simple, small |
| Typography | Multiple font sizes | Consistent scale |
| Colors | Vibrant gradients | Corporate palette |

---

## Responsive Design

- **Desktop (xl)**: 5 columns for PET cards
- **Laptop (lg)**: 4 columns
- **Tablet (md)**: 2 columns
- **Mobile (sm)**: 2 columns (6 col-6)
- **Summary stats**: 4 cols on desktop, 2 cols on mobile

---

## Browser Support
- ✅ All modern browsers
- ✅ Bootstrap 5 compatible
- ✅ No CSS animations (better performance)
- ✅ Simple SVG (universal support)

---

## Build Status
✅ Compiled successfully with no errors

---

## Future Enhancements (Optional)
- Add data export button
- Include shift comparison toggle
- Add target configuration modal
- Implement drill-down to details
- Add print stylesheet
