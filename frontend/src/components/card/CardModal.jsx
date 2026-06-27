import { useEffect, useState } from "react";
import { format } from "date-fns";
import useBoardStore from "../../store/boardStore";
import useAuthStore from "../../store/authStore";

const PRIORITY_OPTS = ["low", "medium", "high"];

const PRIORITY_STYLES = {
  high: "bg-red-50 text-[#EF4444] border-red-200",
  medium: "bg-amber-50 text-[#F59E0B] border-amber-200",
  low: "bg-emerald-50 text-[#22C55E] border-emerald-200",
};

export default function CardModal({ cardId, onClose }) {
 const {
  activeCard, comments,
  fetchCard, fetchComments, editCard, removeCard,
  addComment, removeComment, clearActiveCard, cards
} = useBoardStore();
  const { user } = useAuthStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descVal, setDescVal] = useState("");
  const [commentVal, setCommentVal] = useState("");
  const [listId, setListId] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchCard(cardId);
    fetchComments(cardId);
    return () => clearActiveCard();
  }, [cardId]);

  useEffect(() => {
    if (activeCard) {
      setTitleVal(activeCard.title);
      setDescVal(activeCard.description || "");
      for (const lid in cards) {
        if (cards[lid].some((c) => c._id === cardId)) {
          setListId(lid);
          break;
        }
      }
    }
  }, [activeCard]);

  const handleSaveTitle = async () => {
    if (!titleVal.trim() || titleVal === activeCard?.title) {
      setEditingTitle(false);
      return;
    }
    // Optimistic update
    useBoardStore.setState({
      activeCard: { ...activeCard, title: titleVal.trim() },
    });
    setEditingTitle(false);
    await editCard(cardId, { title: titleVal.trim() });
  };

  const handleSaveDesc = async () => {
    const newDesc = descVal;
    useBoardStore.setState({
      activeCard: { ...activeCard, description: newDesc },
    });
    setEditingDesc(false);
    await editCard(cardId, { description: newDesc });
  };

  const handlePriority = async (priority) => {
    // Optimistic update
    useBoardStore.setState({ activeCard: { ...activeCard, priority } });
    await editCard(cardId, { priority });
  };

  const handleDueDate = async (e) => {
    const dueDate = e.target.value || null;
    // Optimistic update
    useBoardStore.setState({ activeCard: { ...activeCard, dueDate } });
    await editCard(cardId, { dueDate });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentVal.trim()) return;
    setSubmittingComment(true);
    const text = commentVal.trim();
    setCommentVal("");
    await addComment(cardId, text);
    setSubmittingComment(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this card?")) return;
    await removeCard(cardId, listId);
    onClose();
  };

  const handleRemoveComment = async (commentId) => {
    await removeComment(commentId);
  };

  if (!activeCard)
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-4 border-b border-[#E4E4E7]">
          <div className="flex-1">
            {editingTitle ? (
              <input
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                className="w-full text-lg font-bold text-[#18181B] border-b-2 border-[#7C3AED] focus:outline-none py-0.5"
                autoFocus
              />
            ) : (
              <h2
                className="text-lg font-bold text-[#18181B] cursor-pointer hover:text-[#7C3AED] transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {activeCard.title}
              </h2>
            )}
            <p className="text-xs text-[#71717A] mt-1">Click title to edit</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="text-[#71717A] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-red-50 transition-all"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded-lg hover:bg-[#F4F4F5] transition-colors"
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
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Main */}
          <div className="col-span-2 space-y-5">
            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wide mb-2 block">
                Description
              </label>
              {editingDesc ? (
                <div>
                  <textarea
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    rows={4}
                    placeholder="Add a description…"
                    className="w-full px-3 py-2.5 border border-[#7C3AED] rounded-lg text-sm focus:outline-none resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveDesc}
                      className="bg-[#7C3AED] text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingDesc(false);
                        setDescVal(activeCard.description || "");
                      }}
                      className="text-[#71717A] text-xs px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="min-h-[60px] px-3 py-2.5 bg-[#F8FAFC] border border-[#E4E4E7] rounded-lg text-sm text-[#71717A] cursor-pointer hover:border-[#7C3AED]/40 transition-colors"
                >
                  {activeCard.description || (
                    <span className="italic">Click to add a description…</span>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wide mb-3 block">
                Comments ({comments.length})
              </label>
              <form onSubmit={handleComment} className="mb-4">
                <textarea
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  placeholder="Write a comment…"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentVal.trim() || submittingComment}
                  className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  {submittingComment ? "Posting…" : "Post comment"}
                </button>
              </form>

              <div className="space-y-3">
                {comments.map((c) => {
                  const isOwner =
                    c.author?._id === user?.id ||
                    c.author?._id === user?._id ||
                    c.author?.id === user?.id;

                  return (
                    <div key={c._id} className="flex gap-2.5 group">
                      <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                        {c.author?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#18181B]">
                              {c.author?.name}
                            </span>
                            <span className="text-[11px] text-[#71717A]">
                              {format(new Date(c.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveComment(c._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-[#71717A] hover:text-[#EF4444] transition-all"
                              title="Delete comment"
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
                          )}
                        </div>
                        <p className="text-sm text-[#18181B] bg-[#F8FAFC] px-3 py-2 rounded-lg border border-[#E4E4E7]">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wide mb-2 block">
                Priority
              </label>
              <div className="space-y-1.5">
                {PRIORITY_OPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriority(p)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                      activeCard.priority === p
                        ? PRIORITY_STYLES[p]
                        : "border-[#E4E4E7] text-[#71717A] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wide mb-2 block">
                Due date
              </label>
              <input
                type="date"
                value={
                  activeCard.dueDate ? activeCard.dueDate.split("T")[0] : ""
                }
                onChange={handleDueDate}
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
              />
              {activeCard.dueDate && (
                <button
                  onClick={() => handleDueDate({ target: { value: "" } })}
                  className="text-[11px] text-[#71717A] hover:text-[#EF4444] mt-1 transition-colors"
                >
                  Remove date
                </button>
              )}
            </div>

            {/* Meta */}
            <div className="pt-2 border-t border-[#E4E4E7]">
              <p className="text-[11px] text-[#71717A]">
                Created {format(new Date(activeCard.createdAt), "MMM d, yyyy")}
              </p>
              {activeCard.updatedAt !== activeCard.createdAt && (
                <p className="text-[11px] text-[#71717A]">
                  Updated {format(new Date(activeCard.updatedAt), "MMM d")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
