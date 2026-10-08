import api from "./api";

export const getCustomers = async () => {
  const response = await api.get("/customers/");
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post("/customers/", customerData);
  return response.data;
};

export const updateCustomer = async (customerId, customerData) => {
  const response = await api.put(
    `/customers/${customerId}`,
    customerData
  );

  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await api.delete(
    `/customers/${customerId}`
  );

  return response.data;
};