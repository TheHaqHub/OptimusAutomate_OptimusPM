import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useBoardStore from "../store/boardStore";
import useAuthStore from "../store/authStore";
import Navbar from "../components/ui/Navbar";

const BOARD_COLORS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-sky-600",
];

export default function Boards() {
  const navigate = useNavigate();
  const { boards, fetchBoards, addBoard, removeBoard, isLoading } =
    useBoardStore();
  const { user } = useAuthStore();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const board = await addBoard(form);
      setShowCreate(false);
      setForm({ title: "", description: "" });
      navigate(`/boards/${board._id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    await removeBoard(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#18181B]">My Boards</h1>
            <p className="text-[#71717A] text-sm mt-1">
              {boards.length} {boards.length === 1 ? "board" : "boards"}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Board
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && boards.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#7C3AED]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#18181B] mb-1">
              No boards yet
            </h3>
            <p className="text-[#71717A] text-sm mb-6">
              Create your first board to get started.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Create a board
            </button>
          </div>
        )}

        {/* Board Grid */}
        {!isLoading && boards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board, i) => (
              <div
                key={board._id}
                className="group relative bg-white rounded-xl border border-[#E4E4E7] overflow-hidden hover:shadow-md hover:border-[#7C3AED]/30 transition-all cursor-pointer"
                onClick={() => navigate(`/boards/${board._id}`)}
              >
                {/* Color banner */}
                <div
                  className={`h-20 bg-gradient-to-br ${BOARD_COLORS[i % BOARD_COLORS.length]}`}
                />

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-[#18181B] text-sm truncate">
                    {board.title}
                  </h3>
                  {board.description && (
                    <p className="text-[#71717A] text-xs mt-1 line-clamp-2">
                      {board.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#71717A] text-xs">
                      {board.members?.length || 1} member
                      {board.members?.length !== 1 ? "s" : ""}
                    </span>
                    {board.owner?._id === user?.id ||
                    board.owner?._id === user?._id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(board._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-[#EF4444] transition-all p-1 rounded"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {/* Add board tile */}
            <div
              onClick={() => setShowCreate(true)}
              className="h-[136px] rounded-xl border-2 border-dashed border-[#E4E4E7] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#F4F4F5] group-hover:bg-[#EDE9FE] flex items-center justify-center transition-colors">
                <svg
                  className="w-4 h-4 text-[#71717A] group-hover:text-[#7C3AED]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-sm text-[#71717A] group-hover:text-[#7C3AED] font-medium">
                New board
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#18181B]">Create board</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-[#71717A] hover:text-[#18181B] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#18181B] mb-1.5">
                  Board title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Roadmap"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#18181B] mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="What's this board for?"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 border border-[#E4E4E7] text-[#18181B] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !form.title.trim()}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  {creating ? "Creating…" : "Create board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#18181B] mb-2">
              Delete board?
            </h2>
            <p className="text-sm text-[#71717A] mb-6">
              This will permanently delete the board and all its lists and
              cards.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-[#E4E4E7] text-[#18181B] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-[#EF4444] hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
