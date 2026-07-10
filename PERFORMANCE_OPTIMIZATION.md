## Neon RPS Performance Optimization Guide

### Current Status
- Build size: ~250KB (gzipped)
- FCP target: < 2s
- TTI target: < 4s
- LCP target: < 2.5s
- CLS target: < 0.1

---

## Code Splitting Strategy

### Route-Based Splitting
```typescript
// App.tsx - Already using React.lazy
const Home = lazy(() => import("@/pages/Home"));
const CreateGame = lazy(() => import("@/pages/CreateGame"));
const GameDetail = lazy(() => import("@/pages/GameDetail"));
const SeriesDetail = lazy(() => import("@/pages/SeriesDetail"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Treasury = lazy(() => import("@/pages/Treasury"));
```

### Vendor Splitting (vite.config.ts already configured)
```typescript
manualChunks: {
  "vendor-react": ["react", "react-dom", "wouter"],
  "vendor-web3": ["viem", "wagmi"],
  "vendor-motion": ["framer-motion"],
  "vendor-icons": ["lucide-react"],
}
```

### Implementation
```bash
# Verify bundle splitting
npm run build
# Check dist/public for chunk files
```

---

## Image Optimization

### Current Images
- Icons: Use SVG via lucide-react (✓ optimized)
- Background: Use CSS gradients (✓ optimized)
- OG images: Compress JPEG < 100KB

### Lazy Loading
```tsx
// Implement image lazy loading for large images
<img src={url} loading="lazy" decoding="async" alt="..." />

// Or use intersection observer
const [isVisible, setIsVisible] = useState(false);
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) setIsVisible(true);
  });
  observer.observe(ref.current);
}, []);
```

### Responsive Images
```tsx
<img
  src="/image-small.jpg"
  srcSet="/image-medium.jpg 640w, /image-large.jpg 1280w"
  sizes="(max-width: 640px) 100vw, 50vw"
  alt="..."
/>
```

---

## Network Optimization

### API Caching Strategy
```typescript
// Use SWR with custom cache time
useReadContract({
  query: {
    staleTime: 60_000,        // 1 min before revalidate
    gcTime: 300_000,          // 5 min cache retention
    refetchInterval: 5_000,   // Auto-refresh every 5s
  }
});
```

### Request Deduplication
```typescript
// Implement request memoization
const cache = new Map<string, Promise<T>>();

export async function cachedFetch<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (cache.has(key)) return cache.get(key)!;
  const promise = fn();
  cache.set(key, promise);
  return promise;
}
```

### Batch Requests
```typescript
// Already implemented: useReadContracts for batch calls
useReadContracts({
  contracts: [
    { address: CONTRACT, abi, functionName: "func1" },
    { address: CONTRACT, abi, functionName: "func2" },
    { address: CONTRACT, abi, functionName: "func3" },
  ]
});
```

---

## Component Optimization

### Memoization
```tsx
// Use React.memo for expensive renders
export const GameCard = memo(function GameCard({ game }: Props) {
  return <div>...</div>;
});

// Use useMemo for derived state
const sortedGames = useMemo(() => {
  return games.sort((a, b) => b.bet - a.bet);
}, [games]);

// Use useCallback for stable references
const handleJoinGame = useCallback((gameId: bigint) => {
  joinGame(gameId);
}, [joinGame]);
```

### Virtual Scrolling
```tsx
// For large lists (leaderboard, game history)
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={games.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <GameRow game={games[index]} />
    </div>
  )}
</FixedSizeList>
```

### Suspense Boundaries
```tsx
// Already implemented: Page-level Suspense
<Suspense fallback={<PageSkeleton />}>
  <Switch>
    <Route path="/" component={Home} />
    {/* ... */}
  </Switch>
</Suspense>

// Add component-level boundaries for expensive components
<ErrorBoundary>
  <Suspense fallback={<ComponentSkeleton />}>
    <ExpensiveComponent />
  </Suspense>
</ErrorBoundary>
```

---

## CSS Optimization

### Critical CSS
```css
/* Inline critical above-the-fold styles */
/* Keep arcade-box, arcade-btn styles in main bundle */
```

### Unused CSS
```bash
# Use PurgeCSS to remove unused Tailwind
# Already configured in Tailwind v4
```

### CSS-in-JS Optimization
```tsx
// Use static styles where possible
const styles = {
  container: "flex items-center gap-4 p-4",
  button: "arcade-btn px-6 py-3",
};

// Avoid dynamic classes in loops
{games.map(game => (
  <div key={game.id} className={styles.container}>
    {/* use static styles */}
  </div>
))}
```

---

## JavaScript Optimization

### Tree Shaking
```typescript
// ✓ Already using ES6 modules
// ✓ vite.config.ts: dedupe React and other common libs

// Make sure unused code is removed:
// - Remove dead code
// - Use named exports
// - Avoid dynamic requires
```

### Compression
```typescript
// Enable gzip/brotli in vite
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Chunks already split
      },
    },
  },
});
```

### Polyfills
```typescript
// Only include necessary polyfills
// Modern browsers support most ES2020+ features
// Base is modern chain - no IE11 support needed
```

---

## Font Optimization

### Current Fonts
```css
/* Orbitron - heading font */
/* Fira Code - monospace font */
```

### Optimization
```html
<!-- Use font-display: swap for faster rendering -->
<link
  href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Orbitron:wght@400;700&display=swap"
  rel="stylesheet"
/>

<!-- Reduce font weights to necessary ones -->
<!-- Only load 400, 700 weights initially -->
```

---

## Browser Caching

### Cache Headers (Vercel)
```
# vercel.json
{
  "headers": [
    {
      "source": "/dist/public/(.*)\\.(js|css|svg)$",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Service Worker Caching
```javascript
// Already implemented in public/sw.js
// - Precache critical assets
// - Cache API responses
// - Network-first for API, cache-first for assets
```

---

## Runtime Performance

### Web Vitals Monitoring
```typescript
// Install web-vitals package
npm install web-vitals

// Track metrics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => console.log('CLS:', metric));
getFID(metric => console.log('FID:', metric));
getFCP(metric => console.log('FCP:', metric));
getLCP(metric => console.log('LCP:', metric));
getTTFB(metric => console.log('TTFB:', metric));
```

### Profiling
```bash
# React DevTools Profiler
# - Measure component render times
# - Identify unnecessary re-renders
# - Use Profiler API

# Chrome DevTools Performance tab
# - Record flame graphs
# - Identify long tasks
# - Check network waterfall
```

### Long Tasks
```typescript
// Break long computations into smaller chunks
async function heavyComputation() {
  for (let i = 0; i < 100000; i++) {
    // Process item
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

---

## Monitoring & Alerts

### Sentry Performance
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Custom Analytics
```typescript
// Track performance metrics
analytics.track("page_load", {
  fcp: fcpMetric,
  lcp: lcpMetric,
  cls: clsMetric,
  ttfb: ttfbMetric,
});
```

---

## Quick Wins Checklist

- [ ] Enable gzip compression on all responses
- [ ] Set cache headers for static assets (1 year)
- [ ] Preload critical resources (fonts, images)
- [ ] Minimize CSS and JavaScript
- [ ] Remove unused dependencies
- [ ] Optimize font delivery (swap, subset)
- [ ] Use srcset for responsive images
- [ ] Implement lazy loading for off-screen content
- [ ] Remove render-blocking resources
- [ ] Test on slow 3G network
- [ ] Monitor Core Web Vitals continuously
- [ ] Set up performance budget alerts

---

## Performance Budget

```
JavaScript: < 150KB (gzipped)
CSS: < 30KB (gzipped)
Images: < 50KB each
Fonts: < 40KB total
Total: < 250KB
```

If bundle exceeds limits:
1. Identify offending modules
2. Consider lazy loading
3. Tree-shake unused code
4. Replace with lighter alternatives
5. Dynamic import analysis

---

## Testing Performance

```bash
# Lighthouse CI
npm install -g @lhci/cli@latest
lhci autorun

# Bundle analyzer
npm install --save-dev rollup-plugin-visualizer
# Then check dist/stats.html

# Network throttling (Chrome DevTools)
# Slow 3G: 400ms latency, 400Kbps down, 20Kbps up
# Fast 3G: 150ms latency, 1.6Mbps down, 750Kbps up

# Mobile performance testing
# Use Pixel phone for realistic mobile metrics
# Test on actual 4G/5G networks
```
