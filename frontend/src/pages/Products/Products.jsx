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
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

import ToastMessage from "../../components/Toast/ToastMessage";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
  });

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

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to load products.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);

    setFormData({
      name: "",
      sku: "",
      price: "",
      stock_quantity: "",
    });

    setOpenDialog(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock_quantity: product.stock_quantity,
    });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
      };

      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          productData
        );

        showToast(
          "Product updated successfully.",
          "success"
        );
      } else {
        await createProduct(productData);

        showToast(
          "Product created successfully.",
          "success"
        );
      }

      handleCloseDialog();
      await loadProducts();
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to save product.",
        "error"
      );
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);

      showToast(
        "Product deleted successfully.",
        "success"
      );

      await loadProducts();
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to delete product.",
        "error"
      );
    }
  };

  return (
    <Box>
      {/* Page Header */}

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
            Products
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage products, pricing and inventory.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Product
        </Button>
      </Box>

      {/* Products Table */}

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
          ) : products.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                No products found.
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
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      <td>
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                        >
                          {product.name}
                        </Typography>
                      </td>

                      <td>{product.sku}</td>

                      <td>
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <Typography
                          fontWeight={600}
                          color={
                            product.stock_quantity <= 5
                              ? "error.main"
                              : "text.primary"
                          }
                        >
                          {product.stock_quantity}
                        </Typography>
                      </td>

                      <td>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleOpenEdit(product)
                          }
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDelete(product.id)
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

      {/* Create / Edit Dialog */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingProduct
            ? "Edit Product"
            : "Add Product"}
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
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              fullWidth
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
            {editingProduct ? "Update" : "Create"}
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

export default Products;