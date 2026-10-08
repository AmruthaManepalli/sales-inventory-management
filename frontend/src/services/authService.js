import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: "USER",
  });

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};