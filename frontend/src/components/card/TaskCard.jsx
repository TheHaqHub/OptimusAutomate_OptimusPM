import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'

const PRIORITY_STYLES = {
  high:   { dot: 'bg-[#EF4444]', text: 'text-[#EF4444]', bg: 'bg-red-50'    },
  medium: { dot: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', bg: 'bg-amber-50'  },
  low:    { dot: 'bg-[#22C55E]', text: 'text-[#22C55E]', bg: 'bg-emerald-50' },
}

export default function TaskCard({ card, onClick, isDragging }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging
  } = useSortable({ id: card._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !isDragging
  const priority = PRIORITY_STYLES[card.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg border border-[#E4E4E7] px-3 py-2.5 cursor-pointer
        hover:border-[#7C3AED]/30 hover:shadow-sm transition-all group select-none
        ${isDragging ? 'shadow-lg border-[#7C3AED]/40' : ''}`}
    >
      {/* Priority badge */}
      {card.priority && card.priority !== 'medium' && (
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5 ${priority?.bg} ${priority?.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority?.dot}`} />
          {card.priority}
        </div>
      )}
      {card.priority === 'medium' && (
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5 ${priority?.bg} ${priority?.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority?.dot}`} />
          medium
        </div>
      )}

      {/* Title */}
      <p className="text-sm text-[#18181B] font-medium leading-snug">{card.title}</p>

      {/* Footer */}
      {(card.dueDate || card.assignedTo) && (
        <div className="flex items-center gap-2 mt-2">
          {card.dueDate && (
            <span className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
              isOverdue ? 'bg-red-50 text-[#EF4444]' : 'bg-[#F4F4F5] text-[#71717A]'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(card.dueDate), 'MMM d')}
            </span>
          )}
          {card.assignedTo && (
            <span className="ml-auto w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[9px] font-bold">
              {card.assignedTo?.name?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}