import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerService";

import ToastMessage from "../../components/Toast/ToastMessage";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // -----------------------------
  // Toast helpers
  // -----------------------------

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

  // -----------------------------
  // Load customers
  // -----------------------------

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to load customers.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // -----------------------------
  // Form handling
  // -----------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------
  // Create customer
  // -----------------------------

  const handleOpenCreate = () => {
    setEditingCustomer(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setOpenDialog(true);
  };

  // -----------------------------
  // Edit customer
  // -----------------------------

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setOpenDialog(true);
  };

  // -----------------------------
  // Close create/edit dialog
  // -----------------------------

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
  };

  // -----------------------------
  // Create / Update customer
  // -----------------------------

  const handleSubmit = async () => {
    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
      };

      if (editingCustomer) {
        await updateCustomer(
          editingCustomer.id,
          customerData
        );

        showToast(
          "Customer updated successfully.",
          "success"
        );
      } else {
        await createCustomer(customerData);

        showToast(
          "Customer created successfully.",
          "success"
        );
      }

      handleCloseDialog();

      await loadCustomers();
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to save customer.",
        "error"
      );
    }
  };

  // -----------------------------
  // Open delete confirmation
  // -----------------------------

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // -----------------------------
  // Close delete confirmation
  // -----------------------------

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // -----------------------------
  // Confirm delete
  // -----------------------------

  const confirmDelete = async () => {
    if (!customerToDelete) {
      return;
    }

    try {
      await deleteCustomer(customerToDelete.id);

      handleCloseDeleteDialog();

      showToast(
        "Customer deleted successfully.",
        "success"
      );

      await loadCustomers();
    } catch (error) {
      handleCloseDeleteDialog();

      showToast(
        error.response?.data?.detail ||
          "Unable to delete customer.",
        "error"
      );
    }
  };

  return (
    <Box>
      {/* =========================
          Page Header
      ========================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Customers
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage customer information and contact details.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Customer
        </Button>
      </Box>

      {/* =========================
          Customers Table
      ========================= */}

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
          ) : customers.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                No customers found.
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
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>

                      <td>
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                        >
                          {customer.name}
                        </Typography>
                      </td>

                      <td>{customer.email}</td>

                      <td>
                        {customer.phone || "-"}
                      </td>

                      <td>
                        {customer.address || "-"}
                      </td>

                      <td>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleOpenEdit(customer)
                          }
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDelete(customer)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* =========================
          Create / Edit Dialog
      ========================= */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingCustomer
            ? "Edit Customer"
            : "Add Customer"}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Customer Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            {editingCustomer ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================
          Delete Confirmation Dialog
      ========================= */}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Customer
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>
              {customerToDelete?.name}
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================
          Toast
      ========================= */}

      <ToastMessage
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}

export default Customers;