import apiClient from "./client.js";

export const getBoards = () => apiClient.get("/boards");
export const createBoard = (data) => apiClient.post("/boards", data);
export const getBoardById = (id) => apiClient.get(`/boards/${id}`);
export const updateBoard = (id, data) => apiClient.put(`/boards/${id}`, data);
export const deleteBoard = (id) => apiClient.delete(`/boards/${id}`);
export const addMember = (id, data) => apiClient.post(`/boards/${id}/members`, data);