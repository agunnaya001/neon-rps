import { memo } from 'react'
import { StatCardProps } from '@/types'
import { buildCardStyle } from '@/lib/themes'

export const StatCard = memo(function StatCard({
  label,
  value,
  subtext,
  color,
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={buildCardStyle()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: color,
            }}
          />
        </div>
        <span
          className="text-xs font-bold tracking-wider"
          style={{ color: '#666' }}
        >
          {label.toUpperCase()}
        </span>
      </div>
      <div
        className="text-3xl font-black text-white mb-1"
        style={{ lineHeight: '1.2' }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: '#666' }}>
        {subtext}
      </div>
    </div>
  )
})
