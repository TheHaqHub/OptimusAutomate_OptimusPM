import { create } from "zustand";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardById,
} from "../api/board.api";
import { createList, updateList, deleteList } from "../api/list.api";
import {
  createCard,
  getCardById,
  updateCard,
  deleteCard,
  getComments,
  addComment,
  deleteComment,
} from "../api/card.api";

const useBoardStore = create((set, get) => ({
  boards: [],
  activeBoard: null,
  lists: [],
  cards: {},
  activeCard: null,
  comments: [],
  isLoading: false,
  error: null,

  // ─── Boards ────────────────────────────────────────────────
  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getBoards();
      set({ boards: res.data.data.boards, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  addBoard: async (data) => {
    const res = await createBoard(data);
    const board = res.data.data.board;
    set((s) => ({ boards: [board, ...s.boards] }));
    return board;
  },

  editBoard: async (id, data) => {
    const res = await updateBoard(id, data);
    const board = res.data.data.board;
    set((s) => ({ boards: s.boards.map((b) => (b._id === id ? board : b)) }));
  },

  removeBoard: async (id) => {
    await deleteBoard(id);
    set((s) => ({ boards: s.boards.filter((b) => b._id !== id) }));
  },

  // ─── Board Detail ───────────────────────────────────────────
  fetchBoardDetail: async (id) => {
    set({ isLoading: true, error: null, activeBoard: null, lists: [], cards: {} });
    try {
      const res = await getBoardById(id);
      const { board, lists: rawLists } = res.data.data;
      const cards = {};
      rawLists.forEach((list) => {
        cards[list._id] = list.cards || [];
      });
      set({ activeBoard: board, lists: rawLists, cards, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  // ─── Lists ──────────────────────────────────────────────────
  addList: async (boardId, title) => {
  const res = await createList({
    boardId: boardId,   // ← board ki jagah boardId
    title,
    position: get().lists.length,
  });
  const list = res.data.data.list;   // ← .data.data.list
  set((s) => ({
    lists: [...s.lists, list],
    cards: { ...s.cards, [list._id]: [] },
  }));
},

  editList: async (id, data) => {
    const res = await updateList(id, data);
    const list = res.data.data;
    set((s) => ({
      lists: s.lists.map((l) => (l._id === id ? { ...l, ...list } : l)),
    
    }));
  },

  removeList: async (id) => {
    await deleteList(id);
    set((s) => {
      const cards = { ...s.cards };
      delete cards[id];
      return { lists: s.lists.filter((l) => l._id !== id), cards };
    });
  },

  // ─── Cards ──────────────────────────────────────────────────
  addCard: async (data) => {
  const { listId, boardId, title } = data;
  
  // Optimistic — pehle UI mein add karo
  const tempCard = {
    _id: `temp-${Date.now()}`,
    title,
    list: listId,
    board: boardId,
    priority: 'medium',
    position: (get().cards[listId] || []).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  set((s) => ({
    cards: { ...s.cards, [listId]: [...(s.cards[listId] || []), tempCard] },
  }))

  // Phir API call
  try {
    const res = await createCard({ listId, boardId, title })
    const card = res.data.data.card
    // Temp card ko real card se replace karo
    set((s) => ({
      cards: {
        ...s.cards,
        [listId]: s.cards[listId].map((c) => c._id === tempCard._id ? card : c)
      }
    }))
  } catch (e) {
    // Error pe temp card hata do
    set((s) => ({
      cards: {
        ...s.cards,
        [listId]: s.cards[listId].filter((c) => c._id !== tempCard._id)
      }
    }))
  }
},

editCard: async (cardId, data) => {
  const res = await updateCard(cardId, data)
  const updated = res.data.data.card  // ← .card add karo
  set((s) => {
    const cards = { ...s.cards }
    for (const listId in cards) {
      cards[listId] = cards[listId].map((c) =>
        c._id === cardId ? { ...c, ...updated } : c
      )
    }
    return {
      cards,
      activeCard:
        s.activeCard?._id === cardId
          ? { ...s.activeCard, ...updated }
          : s.activeCard,
    }
  
})
},
  removeCard: async (cardId, listId) => {
    await deleteCard(cardId);
    set((s) => ({
      cards: {
        ...s.cards,
        [listId]: s.cards[listId].filter((c) => c._id !== cardId),
      },
      activeCard: null,
    }));
  },

  fetchCard: async (cardId) => {
  const res = await getCardById(cardId)
  set({ activeCard: res.data.data.card })
  return res.data.data.card
},

  // ─── Drag & Drop ────────────────────────────────────────────
  moveCard: (cardId, fromListId, toListId, toIndex) => {
    set((s) => {
      const from = [...(s.cards[fromListId] || [])];
      const cardIdx = from.findIndex((c) => c._id === cardId);
      if (cardIdx === -1) return {};
      const [card] = from.splice(cardIdx, 1);
      const to =
        fromListId === toListId ? from : [...(s.cards[toListId] || [])];
      to.splice(toIndex, 0, card);
      return {
        cards: {
          ...s.cards,
          [fromListId]: fromListId === toListId ? to : from,
          [toListId]: to,
        },
      };
    });
  },

  // ─── Comments ───────────────────────────────────────────────
  fetchComments: async (cardId) => {
  const res = await getComments(cardId);
  set({ comments: res.data.data.comments });  // ← .comments
},

addComment: async (cardId, content) => {
  const res = await addComment(cardId, { content });
  set((s) => ({ comments: [...s.comments, res.data.data.comment] }));  // ← .comment
},

  removeComment: async (commentId) => {
    await deleteComment(commentId);
    set((s) => ({ comments: s.comments.filter((c) => c._id !== commentId) }));
  },

  clearActiveCard: () => set({ activeCard: null, comments: [] }),
  setError: (error) => set({ error }),
}));

export default useBoardStore;