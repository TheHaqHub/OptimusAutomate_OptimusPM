import apiClient from "./client.js";

export const createCard = (data) => apiClient.post("/cards", data);
export const getCardById = (id) => apiClient.get(`/cards/${id}`);
export const updateCard = (id, data) => apiClient.put(`/cards/${id}`, data);
export const deleteCard = (id) => apiClient.delete(`/cards/${id}`);
export const getComments = (id) => apiClient.get(`/cards/${id}/comments`);
export const addComment = (id, data) => apiClient.post(`/cards/${id}/comments`, data);
export const deleteComment = (id) => apiClient.delete(`/comments/${id}`);