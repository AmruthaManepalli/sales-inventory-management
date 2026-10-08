import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import { getOrders } from "../../services/orderService";

import ToastMessage from "../../components/Toast/ToastMessage";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseToast = () => {
    setToast((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await getOrders();

      setOrders(data);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to load orders.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "success";

      case "PENDING_APPROVAL":
        return "warning";

      case "REJECTED":
        return "error";

      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Page Header */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          Orders
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          View and track all sales orders.
        </Typography>
      </Box>

      {/* Orders Table */}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                No orders found.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",

                  "& th": {
                    textAlign: "left",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: 600,
                    borderBottom:
                      "1px solid #e2e8f0",
                  },

                  "& td": {
                    padding: "16px",
                    borderBottom:
                      "1px solid #edf2f7",
                    fontSize: "14px",
                  },
                }}
              >
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer ID</th>
                    <th>Amount</th>
                    <th>Created By</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                        >
                          {order.order_number}
                        </Typography>
                      </td>

                      <td>
                        #{order.customer_id}
                      </td>

                      <td>
                        <Typography
                          fontWeight={600}
                        >
                          ₹
                          {Number(
                            order.total_amount
                          ).toLocaleString("en-IN")}
                        </Typography>
                      </td>

                      <td>
                        #{order.created_by}
                      </td>

                      <td>
                        <Chip
                          label={order.status.replace(
                            "_",
                            " "
                          )}
                          color={getStatusColor(
                            order.status
                          )}
                          size="small"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <ToastMessage
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}

export default Orders;