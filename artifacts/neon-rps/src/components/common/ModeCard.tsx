import { memo, useCallback, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ModeCardProps } from '@/types'
import { buildCardStyle } from '@/lib/themes'

export const ModeCard = memo(function ModeCard({
  icon: Icon,
  label,
  sub,
  color,
  tags,
  onClick,
  id,
}: ModeCardProps) {
  const [borderColor, setBorderColor] = useState('#2a2a4a')

  const handleHover = useCallback(() => {
    setBorderColor(color)
  }, [color])

  const handleHoverEnd = useCallback(() => {
    setBorderColor('#2a2a4a')
  }, [])

  const handleClick = useCallback(() => {
    onClick(id)
  }, [onClick, id])

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverEnd}
      className="group flex items-center gap-5 rounded-2xl p-6 border text-left transition-all duration-300 hover:-translate-x-1 w-full"
      style={{
        ...buildCardStyle(),
        borderColor,
      }}
      aria-label={label}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={32} style={{ color }} />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
        <p className="text-sm leading-relaxed mb-3" style={{ color: '#888' }}>
          {sub}
        </p>
        <div className="flex gap-2">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-md text-xs font-bold"
              style={
                i === 0
                  ? { backgroundColor: color, color: '#0f0f23' }
                  : { border: `1px solid ${color}`, color, backgroundColor: `${color}10` }
              }
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ChevronLeft
        size={20}
        style={{ color: '#444' }}
        className="rotate-180 shrink-0 transition-all group-hover:translate-x-1"
      />
    </button>
  )
})
