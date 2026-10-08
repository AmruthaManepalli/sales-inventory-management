import api from "./api";

export const getPendingApprovals = async () => {
  const response = await api.get("/approvals/pending");

  return response.data;
};

export const approveOrder = async (
  approvalId,
  comments = ""
) => {
  const response = await api.post(
    `/approvals/${approvalId}/approve`,
    {
      comments,
    }
  );

  return response.data;
};

export const rejectOrder = async (
  approvalId,
  comments = ""
) => {
  const response = await api.post(
    `/approvals/${approvalId}/reject`,
    {
      comments,
    }
  );

  return response.data;
};