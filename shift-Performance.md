# Implement Real-Time Performance Metric Using Elapsed Shift Time

Add a Performance calculation that uses actual elapsed time since the shift started, rather than the full planned shift duration. This gives an accurate real-time reading during an active shift.

## Formula

```
Performance = ((Elapsed Time − Total Downtime) / (Elapsed Time − Planned Downtime)) × 100
```

Where:
- **Elapsed Time** = `Math.round((now - shiftStartTime) / 60000)` — minutes since the shift started, capped at the full shift duration if the shift has ended
- **Total Downtime** = sum of all downtime minutes (mechanical + electrical + other unplanned)
- **Planned Downtime** = sum of scheduled/planned downtime minutes (breaks, maintenance, etc.)

## Example

- Shift starts at 06:00, current time is 11:00 → Elapsed Time = 300 min
- Total Downtime = 42 min, Planned Downtime = 3 min
- Performance = (300 − 42) / (300 − 3) × 100 = 258 / 297 × 100 = **86.9%**

## Implementation Details

### 1. Compute elapsed time from shift start

```js
const shiftStart = new Date(`${shiftDate}T${shift.start_time.slice(0,5)}:00`);
const now = new Date();
const shiftDurationMins = /* total shift duration in minutes */;
const elapsedMins = Math.min(shiftDurationMins, Math.max(0, Math.round((now - shiftStart) / 60000)));
```

### 2. Use elapsed time instead of planned time in the performance formula

```js
const operationalTime = elapsedMins - plannedDowntime;
const performance = operationalTime > 0
    ? ((elapsedMins - totalDowntime) / operationalTime) * 100
    : 0;
```

### 3. Clamp the result to 0–100

```js
const clamp = (v) => Math.min(100, Math.max(0, v));
const finalPerformance = clamp(performance);
```

### 4. Display the formula with actual values in the UI

```
(Elapsed Time − Total Downtime) / (Elapsed Time − Planned Downtime) × 100
(300 − 42) / (300 − 3) × 100 = 86.9%
```

## Why Elapsed Time Instead of Planned Time

Using the full planned shift duration (e.g. 720 min for a 12h shift) at 11am would incorrectly inflate the numerator since 6 hours haven't happened yet. Elapsed time gives an accurate snapshot of current performance.
