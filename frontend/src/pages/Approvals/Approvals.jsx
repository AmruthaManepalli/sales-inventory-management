import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  getPendingApprovals,
  approveOrder,
  rejectOrder,
} from "../../services/approvalService";

import ToastMessage from "../../components/Toast/ToastMessage";

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedApproval, setSelectedApproval] =
    useState(null);

  const [rejectDialogOpen, setRejectDialogOpen] =
    useState(false);

  const [comments, setComments] = useState("");

  const [processingId, setProcessingId] =
    useState(null);

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

  const loadApprovals = async () => {
    try {
      setLoading(true);

      const data = await getPendingApprovals();

      setApprovals(data);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to load pending approvals.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (approval) => {
    try {
      setProcessingId(approval.id);

      await approveOrder(approval.id);

      showToast(
        `Order ${approval.order_number} approved successfully.`,
        "success"
      );

      await loadApprovals();
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to approve order.",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (approval) => {
    setSelectedApproval(approval);
    setComments("");
    setRejectDialogOpen(true);
  };

  const handleCloseReject = () => {
    setRejectDialogOpen(false);
    setSelectedApproval(null);
    setComments("");
  };

  const handleReject = async () => {
    if (!selectedApproval) {
      return;
    }

    try {
      setProcessingId(selectedApproval.id);

      await rejectOrder(
        selectedApproval.id,
        comments
      );

      handleCloseReject();

      showToast(
        `Order ${selectedApproval.order_number} rejected.`,
        "success"
      );

      await loadApprovals();
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to reject order.",
        "error"
      );
    } finally {
      setProcessingId(null);
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
          Manager Approvals
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Review order details before approving or
          rejecting high-value orders.
        </Typography>
      </Box>

      {/* Loading */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : approvals.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              py: 6,
              textAlign: "center",
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 48,
                color: "success.main",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={600}
            >
              No Pending Approvals
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              There are currently no orders waiting
              for your approval.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardContent>
                {/* Order Header */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                      xs: "flex-start",
                      md: "center",
                    },
                    flexDirection: {
                      xs: "column",
                      md: "row",
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {approval.order_number}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Customer:{" "}
                      {approval.customer_name}
                    </Typography>
                  </Box>

                  <Chip
                    label="Pending Approval"
                    color="warning"
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Order Summary */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Customer
                    </Typography>

                    <Typography
                      fontWeight={600}
                    >
                      {approval.customer_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Order Status
                    </Typography>

                    <Typography
                      fontWeight={600}
                    >
                      {approval.order_status}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Total Amount
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary"
                    >
                      ₹
                      {Number(
                        approval.total_amount
                      ).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                </Box>

                {/* Items */}

                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1 }}
                >
                  Order Items
                </Typography>

                <Box sx={{ overflowX: "auto" }}>
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      borderCollapse:
                        "collapse",

                      "& th": {
                        textAlign: "left",
                        padding: "12px",
                        backgroundColor:
                          "#f8fafc",
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: 600,
                      },

                      "& td": {
                        padding: "12px",
                        borderTop:
                          "1px solid #edf2f7",
                        fontSize: "14px",
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {approval.items.map(
                        (item) => (
                          <tr
                            key={`${approval.id}-${item.product_id}`}
                          >
                            <td>
                              <Typography
                                fontSize={14}
                                fontWeight={600}
                              >
                                {
                                  item.product_name
                                }
                              </Typography>
                            </td>

                            <td>
                              {item.sku}
                            </td>

                            <td>
                              {item.quantity}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.unit_price
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.subtotal
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Total */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    fontWeight={600}
                  >
                    Total Amount:
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary"
                  >
                    ₹
                    {Number(
                      approval.total_amount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </Typography>
                </Box>

                {/* Actions */}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={
                      <CancelIcon />
                    }
                    disabled={
                      processingId ===
                      approval.id
                    }
                    onClick={() =>
                      handleOpenReject(
                        approval
                      )
                    }
                  >
                    Reject
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      <CheckCircleIcon />
                    }
                    disabled={
                      processingId ===
                      approval.id
                    }
                    onClick={() =>
                      handleApprove(
                        approval
                      )
                    }
                  >
                    Approve
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Reject Dialog */}

      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseReject}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Reject Order
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Please provide a reason for rejecting
            this order.
          </Typography>

          <TextField
            label="Comments"
            value={comments}
            onChange={(event) =>
              setComments(event.target.value)
            }
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={handleCloseReject}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={
              !comments.trim() ||
              processingId ===
                selectedApproval?.id
            }
          >
            Reject Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}

      <ToastMessage
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}

export default Approvals;