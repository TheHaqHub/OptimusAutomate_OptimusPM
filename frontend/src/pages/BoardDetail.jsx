import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, rectIntersection
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import useBoardStore from '../store/boardStore'
import Navbar from '../components/ui/Navbar'
import ListColumn from '../components/board/ListColumn'
import TaskCard from '../components/card/TaskCard'
import CardModal from '../components/card/CardModal'
import { updateCard } from '../api/card.api'
import { updateList } from '../api/list.api'

export default function BoardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    activeBoard, lists, cards, isLoading, error,
    fetchBoardDetail, addList, moveCard
  } = useBoardStore()

  const [addingList, setAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [activeCardDrag, setActiveCardDrag] = useState(null)
  const [openCardId, setOpenCardId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => { fetchBoardDetail(id) }, [id, fetchBoardDetail])

  const handleAddList = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return
    await addList(id, newListTitle.trim())
    setNewListTitle('')
    setAddingList(false)
  }

  const findListOfCard = (cardId) => {
    for (const listId in cards) {
      if (cards[listId].some((c) => c._id === cardId)) return listId
    }
    return null
  }

  const handleDragStart = ({ active }) => {
    const allCards = Object.values(cards).flat()
    const card = allCards.find((c) => c._id === active.id)
    if (card) setActiveCardDrag(card)
  }

const handleDragEnd = async ({ active, over }) => {
  setActiveCardDrag(null)
  if (!over || active.id === over.id) return

  const fromListId = findListOfCard(active.id)
  let toListId = null
  let toIndex = 0

  if (lists.some((l) => l._id === over.id)) {
    toListId = over.id
    toIndex = (cards[toListId] || []).length
  } else {
    toListId = findListOfCard(over.id)
    if (toListId) {
      toIndex = (cards[toListId] || []).findIndex((c) => c._id === over.id)
      if (toIndex === -1) toIndex = 0
    }
  }

  if (!fromListId || !toListId) return
  moveCard(active.id, fromListId, toListId, toIndex)

  try {
await updateCard(active.id, { listId: toListId, position: toIndex })
  } catch (e) {
    fetchBoardDetail(id)
  }
}

  if (isLoading) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-56px)]">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3">
        <p className="text-[#EF4444] font-medium">{error}</p>
        <button onClick={() => navigate('/boards')} className="text-[#7C3AED] text-sm underline">Back to boards</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      {/* Board header */}
      <div className="bg-white border-b border-[#E4E4E7] px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/boards')}
          className="text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-[#18181B]">{activeBoard?.title}</h1>
        {activeBoard?.description && (
          <span className="text-[#71717A] text-sm hidden sm:block">— {activeBoard.description}</span>
        )}
        <span className="ml-auto text-xs text-[#71717A] bg-[#F4F4F5] px-2 py-1 rounded-full">
          {lists.length} lists · {Object.values(cards).flat().length} cards
        </span>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 min-h-full items-start">
            <SortableContext items={lists.map((l) => l._id)} strategy={horizontalListSortingStrategy}>
              {lists.map((list) => (
                <ListColumn
                  key={list._id}
                  list={list}
                  cards={cards[list._id] || []}
                  boardId={id}
                  onCardClick={setOpenCardId}
                />
              ))}
            </SortableContext>

            {/* Add list */}
            <div className="w-72 shrink-0">
              {addingList ? (
                <form onSubmit={handleAddList} className="bg-white rounded-xl border border-[#E4E4E7] p-3 shadow-sm">
                  <input
                    type="text"
                    placeholder="List name"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Add list
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingList(false); setNewListTitle('') }}
                      className="text-[#71717A] hover:text-[#18181B] px-2 py-1.5 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="w-full flex items-center gap-2 bg-white/80 hover:bg-white border border-[#E4E4E7] hover:border-[#7C3AED]/30 text-[#71717A] hover:text-[#7C3AED] px-4 py-3 rounded-xl text-sm font-medium transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add a list
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCardDrag && (
              <div className="rotate-2 opacity-90">
                <TaskCard card={activeCardDrag} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Modal */}
      {openCardId && (
        <CardModal cardId={openCardId} onClose={() => setOpenCardId(null)} />
      )}
    </div>
  )
}