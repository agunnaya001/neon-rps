import { COLORS, COLOR_VARIANTS } from './constants'

export const THEME = {
  colors: COLORS,
  variants: COLOR_VARIANTS,

  // Spacing scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },

  // Typography
  typography: {
    heading: {
      fontWeight: '900',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    body: {
      fontWeight: '400',
      lineHeight: '1.5',
    },
    label: {
      fontWeight: '600',
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },

  // Border radius
  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: (color: string) => `0 0 12px ${color}`,
  },

  // Transitions
  transitions: {
    fast: 'all 0.15s ease-in-out',
    base: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const

// Style builders
export const buildCardStyle = (
  backgroundColor: string = 'rgba(26,26,58,0.6)',
  borderColor: string = COLORS.border
) => ({
  backgroundColor,
  borderColor,
  border: `1px solid ${borderColor}`,
  borderRadius: THEME.radius.xl,
})

export const buildButtonStyle = (
  backgroundColor: string,
  textColor: string,
  hoverOpacity: number = 0.9
) => ({
  backgroundColor,
  color: textColor,
  transition: THEME.transitions.base,
  '&:hover': {
    opacity: hoverOpacity,
  },
})

export const buildGlowEffect = (color: string) => ({
  textShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
  boxShadow: `0 0 12px ${color}80`,
})

// Animation keyframes (referenced in CSS)
export const ANIMATIONS = {
  fadeIn: 'fadeIn',
  glow: 'glow',
  pulseBorder: 'pulse-border',
  shimmer: 'shimmer',
  float: 'float',
} as const
