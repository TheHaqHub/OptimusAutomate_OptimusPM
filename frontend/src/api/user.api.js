import apiClient from "./client.js";

export const searchUsers = (q) => apiClient.get(`/users/search?q=${q}`);