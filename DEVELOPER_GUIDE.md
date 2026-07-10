# Neon RPS Developer Guide

## Quick Start

### Setup
```bash
cd artifacts/neon-rps
npm install  # Already done
PORT=5173 BASE_PATH=/ npm run dev
```

### Build
```bash
PORT=5173 BASE_PATH=/ npm run build
```

## Architecture Overview

### New Patterns Introduced

#### 1. Custom Hooks Pattern
All state management and side effects are handled through custom hooks:

```typescript
// ✅ Good
const { isConnected, connectWallet, error } = useWallet()
const { gameMode, wagerAmount, potentialWinnings } = useGame()

// ❌ Avoid
const [connected, setConnected] = useState(false)
// ... wallet logic here
```

#### 2. Constants & Themes System
All magic numbers and colors live in one place:

```typescript
import { COLORS, GAME_CONFIG, ROUTES } from '@/lib/constants'

// ✅ Good
style={{ color: COLORS.primary }}
disabled={wager < GAME_CONFIG.MIN_WAGER}

// ❌ Avoid
style={{ color: '#00ff88' }}
disabled={wager < 0.001}
```

#### 3. Component Memoization
Prevent unnecessary re-renders:

```typescript
// ✅ Good - Memoized
export const ModeCard = memo(function ModeCard({ id, label, ... }) {
  return <div>...</div>
})

// ❌ Avoid
export function ModeCard({ id, label, ... }) {
  return <div>...</div>
}
```

## Common Tasks

### Adding a New Page

1. **Create the page component:**
```typescript
// src/pages/my-page.tsx
import { memo } from 'react'
import Layout from '@/components/Layout'
import { ROUTES } from '@/lib/constants'

const MyPage = memo(function MyPage() {
  return (
    <Layout activePath={ROUTES.MY_PAGE}>
      {/* Content */}
    </Layout>
  )
})

export default MyPage
```

2. **Add route constant:**
```typescript
// src/lib/constants.ts
export const ROUTES = {
  // ... existing routes
  MY_PAGE: '/my-page',
}
```

3. **Add route in App.tsx:**
```typescript
<Route path={ROUTES.MY_PAGE} component={MyPage} />
```

### Adding a New Color

1. **Update constants:**
```typescript
// src/lib/constants.ts
export const COLORS = {
  // ... existing colors
  myColor: '#RRGGBB',
}

export const COLOR_VARIANTS = {
  myColor: {
    base: COLORS.myColor,
    bg: 'rgba(...)',
    bgDark: 'rgba(...)',
    bgHover: 'rgba(...)',
    shadow: 'rgba(...)',
  },
}
```

2. **Use in components:**
```typescript
import { COLORS, COLOR_VARIANTS } from '@/lib/constants'

style={{
  backgroundColor: COLOR_VARIANTS.myColor.bg,
  borderColor: COLOR_VARIANTS.myColor.shadow,
  color: COLORS.myColor,
}}
```

### Adding a Custom Hook

1. **Create hook file:**
```typescript
// src/hooks/use-my-hook.ts
import { useState, useCallback } from 'react'

export const useMyHook = () => {
  const [state, setState] = useState(false)
  
  const toggle = useCallback(() => {
    setState(prev => !prev)
  }, [])
  
  return { state, toggle }
}
```

2. **Use in component:**
```typescript
import { useMyHook } from '@/hooks/use-my-hook'

export const MyComponent = () => {
  const { state, toggle } = useMyHook()
  return <button onClick={toggle}>{state ? 'ON' : 'OFF'}</button>
}
```

### Adding a Reusable Component

1. **Create component file:**
```typescript
// src/components/common/MyComponent.tsx
import { memo } from 'react'
import { MyComponentProps } from '@/types'

export const MyComponent = memo(function MyComponent({
  label,
  value,
  // ... other props
}: MyComponentProps) {
  return (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
})
```

2. **Add to types:**
```typescript
// src/types/index.ts
export interface MyComponentProps {
  label: string
  value: string | number
  // ... other prop types
}
```

3. **Use throughout app:**
```typescript
import { MyComponent } from '@/components/common/MyComponent'

<MyComponent label="Balance" value="1.5 ETH" />
```

## Performance Guidelines

### Do's ✅
- Use `memo()` for components that receive props
- Use `useCallback()` for event handlers
- Use `useMemo()` for expensive calculations
- Move static data outside components
- Use `const` arrays/objects in constants file
- Import from constants instead of hardcoding values

### Don'ts ❌
- Create new objects/arrays in render
- Define functions in render
- Use inline styles (use className or constants)
- Use `useState` for derived data (use `useMemo`)
- Make API calls in `useEffect` without dependency array
- Pass inline functions as props

### Bad Pattern Example
```typescript
// ❌ BAD - Creates new object every render
function MyComponent() {
  const colors = ['#00ff88', '#00ccff', '#ff006e']
  const data = colors.map(c => ({ color: c }))
  const handler = () => console.log('clicked')
  
  return (
    <div style={{ color: '#00ff88' }}>
      <Card onClick={handler} data={data} />
    </div>
  )
}
```

### Good Pattern Example
```typescript
// ✅ GOOD - Constants, memoization, callbacks
import { COLORS } from '@/lib/constants'

const COLORS_ARRAY = [COLORS.primary, COLORS.secondary, COLORS.accent]

const MyComponent = memo(function MyComponent() {
  const handler = useCallback(() => console.log('clicked'), [])
  
  return (
    <div style={{ color: COLORS.primary }}>
      <Card onClick={handler} data={COLORS_ARRAY} />
    </div>
  )
})
```

## Accessibility Checklist

When adding new interactive elements:

- [ ] Element is keyboard accessible (tab, enter, space)
- [ ] Has visible focus indicator
- [ ] Has proper ARIA label or semantic HTML
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Works with screen readers
- [ ] Has semantic HTML tags (button, link, form, etc.)
- [ ] Error messages are announced to screen readers

### Common Patterns

```typescript
// Button with proper accessibility
<button
  onClick={handleClick}
  aria-label="Connect wallet"
  className="focus:ring-2 focus:ring-offset-2"
>
  Connect
</button>

// Form input with label
<label htmlFor="wager-input">Wager Amount</label>
<input
  id="wager-input"
  type="number"
  aria-label="Wager amount in ETH"
  className="focus:ring-2"
/>

// Error message with role
<div role="alert" className="text-red-500">
  Invalid amount
</div>

// Table with semantic markup
<table role="table" aria-label="Leaderboard">
  <thead>
    <tr role="row">
      <th role="columnheader">Rank</th>
      <th role="columnheader">Player</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="cell">1</td>
      <td role="cell">Player 1</td>
    </tr>
  </tbody>
</table>
```

## Debugging

### React DevTools
```bash
agent-browser open --enable react-devtools "http://localhost:5173"
agent-browser react tree
```

### Console Logging
```typescript
// During development
console.log('[neon-rps] Debug message:', data)

// Remove before production!
```

### Network Issues
Check if API endpoints are correctly configured in `constants.ts`:
```typescript
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.neon-rps.xyz',
  LEADERBOARD: '/leaderboard',
  // etc
}
```

## Testing Tips

### Manual Testing Flow
1. **Wallet Connection:**
   - Test with MetaMask connected
   - Test with wallet not installed
   - Test connection rejection

2. **Game Flow:**
   - Select each game mode
   - Enter various wager amounts
   - Verify calculations update in real-time

3. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Verify focus is visible
   - Test enter/space to activate

4. **Mobile Responsiveness:**
   - Test on mobile viewport
   - Test navigation menu toggle
   - Test form inputs

## Common Issues & Solutions

### Issue: Colors not updating
**Solution:** Check that you're using constants from `COLORS` or `COLOR_VARIANTS`

### Issue: Component re-rendering too much
**Solution:** Wrap with `memo()` and check that props aren't being recreated

### Issue: Wallet connection fails silently
**Solution:** Check `useWallet()` hook error state and display error message

### Issue: Performance is slow
**Solution:** 
- Profile with React DevTools Profiler
- Look for unnecessary re-renders
- Check if arrays/objects are being recreated

## TypeScript Usage

### Always type component props
```typescript
// ✅ Good
interface MyComponentProps {
  label: string
  value: number
  onValueChange: (value: number) => void
}

export const MyComponent = ({ label, value, onValueChange }: MyComponentProps) => {
  // ...
}

// ❌ Avoid
export const MyComponent = ({ label, value, onValueChange }: any) => {
  // ...
}
```

### Use types from @/types
```typescript
import { Player, GameMode, LeaderboardEntry } from '@/types'

// Now you get autocomplete and type checking!
```

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [Wouter Routing](https://github.com/molefrog/wouter)
- [TanStack Query](https://tanstack.com/query)
- [Radix UI](https://radix-ui.com)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref)

## Getting Help

1. Check the type definitions in `src/types/index.ts`
2. Look at existing similar components
3. Check constants in `src/lib/constants.ts`
4. Review the rebuild summary in `REBUILD_SUMMARY.md`

---

**Last Updated:** July 10, 2026
