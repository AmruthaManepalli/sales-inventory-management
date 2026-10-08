import api from "./api";

export const getOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/orders/", orderData);
  return response.data;
};