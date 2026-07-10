import { memo } from 'react'
import { LoadingSpinnerProps } from '@/types'
import { COLORS } from '@/lib/constants'

const sizeMap = {
  sm: { diameter: 24, borderWidth: 2 },
  md: { diameter: 32, borderWidth: 3 },
  lg: { diameter: 48, borderWidth: 4 },
} as const

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  color = COLORS.primary,
}: LoadingSpinnerProps) {
  const { diameter, borderWidth } = sizeMap[size]

  return (
    <div
      className="inline-flex items-center justify-center animate-spin"
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          border: `${borderWidth}px solid rgba(255, 255, 255, 0.1)`,
          borderTopColor: color,
          borderRadius: '50%',
        }}
      />
    </div>
  )
})
