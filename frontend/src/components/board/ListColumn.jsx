import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useBoardStore from '../../store/boardStore'
import TaskCard from '../card/TaskCard'

export default function ListColumn({ list, cards, boardId, onCardClick }) {
  const { addCard, editList, removeList } = useBoardStore()
  const { setNodeRef, isOver } = useDroppable({ id: list._id })

  const [addingCard, setAddingCard] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [listTitle, setListTitle] = useState(list.title)
  const menuRef = useRef()
  const titleInputRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!cardTitle.trim()) return
    await addCard({ listId: list._id, boardId, title: cardTitle.trim() })
    setCardTitle('')
    setAddingCard(false)
  }

  const handleRenameList = async () => {
    const t = listTitle.trim()
    if (!t || t === list.title) { setEditingTitle(false); setListTitle(list.title); return }
    await editList(list._id, { title: t })
    setEditingTitle(false)
  }

  const handleDeleteList = async () => {
    if (!confirm(`Delete list "${list.title}" and all its cards?`)) return
    await removeList(list._id)
  }

  return (
    <div className="w-72 shrink-0 flex flex-col max-h-[calc(100vh-140px)]">
      <div
        ref={setNodeRef}
        className={`flex flex-col rounded-xl border transition-colors ${
          isOver ? 'border-[#7C3AED]/40 bg-[#EDE9FE]/20' : 'border-[#E4E4E7] bg-[#F4F4F5]'
        }`}
      >
        {/* List header */}
        <div className="flex items-center justify-between px-3 py-2.5">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onBlur={handleRenameList}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameList(); if (e.key === 'Escape') { setEditingTitle(false); setListTitle(list.title) } }}
              className="flex-1 text-sm font-semibold text-[#18181B] bg-white border border-[#7C3AED] rounded-md px-2 py-0.5 focus:outline-none"
              autoFocus
            />
          ) : (
            <h3
              className="flex-1 text-sm font-semibold text-[#18181B] cursor-pointer hover:text-[#7C3AED] truncate"
              onDoubleClick={() => setEditingTitle(true)}
            >
              {list.title}
            </h3>
          )}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-[#71717A] font-medium bg-white border border-[#E4E4E7] px-1.5 py-0.5 rounded-full">
              {cards.length}
            </span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-[#71717A] hover:text-[#18181B] p-1 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 w-40 bg-white border border-[#E4E4E7] rounded-lg shadow-lg py-1 z-20">
                  <button
                    onClick={() => { setEditingTitle(true); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-1.5 text-sm text-[#18181B] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Rename list
                  </button>
                  <button
                    onClick={() => { handleDeleteList(); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-1.5 text-sm text-[#EF4444] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Delete list
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 max-h-[calc(100vh-260px)]">
          <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <TaskCard key={card._id} card={card} onClick={() => onCardClick(card._id)} />
            ))}
          </SortableContext>

          {/* Add card form */}
          {addingCard ? (
            <form onSubmit={handleAddCard} className="mt-1">
              <textarea
                placeholder="Card title…"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAddCard(e) }}
                rows={2}
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none bg-white"
                autoFocus
              />
              <div className="flex gap-2 mt-1.5">
                <button
                  type="submit"
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Add card
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingCard(false); setCardTitle('') }}
                  className="text-[#71717A] hover:text-[#18181B] px-2 py-1.5 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {/* Add card button */}
        {!addingCard && (
          <button
            onClick={() => setAddingCard(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-[#71717A] hover:text-[#7C3AED] hover:bg-[#EDE9FE]/40 text-sm transition-colors rounded-b-xl"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </div>
  )
}