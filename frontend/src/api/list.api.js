import apiClient from "./client.js";

export const createList = (data) => apiClient.post("/lists", data);
export const updateList = (id, data) => apiClient.put(`/lists/${id}`, data);
export const deleteList = (id) => apiClient.delete(`/lists/${id}`);