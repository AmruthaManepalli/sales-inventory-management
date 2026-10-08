import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import { getProducts } from "../../services/productService";

import ToastMessage from "../../components/Toast/ToastMessage";

function Inventory() {
  const [products, setProducts] = useState([]);
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

  const loadInventory = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to load inventory.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        color: "error",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low Stock",
        color: "warning",
      };
    }

    return {
      label: "In Stock",
      color: "success",
    };
  };

  return (
    <Box>
      {/* Page Header */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          Inventory
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Monitor product stock levels and inventory
          availability.
        </Typography>
      </Box>

      {/* Inventory Table */}

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
                No inventory items found.
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
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stockStatus =
                      getStockStatus(
                        product.stock_quantity
                      );

                    return (
                      <tr key={product.id}>
                        <td>
                          <Typography
                            fontSize={14}
                            fontWeight={600}
                          >
                            {product.name}
                          </Typography>
                        </td>

                        <td>
                          {product.sku}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          <Typography
                            fontWeight={700}
                            color={
                              product.stock_quantity <=
                              5
                                ? "error.main"
                                : "text.primary"
                            }
                          >
                            {
                              product.stock_quantity
                            }
                          </Typography>
                        </td>

                        <td>
                          <Chip
                            label={
                              stockStatus.label
                            }
                            color={
                              stockStatus.color
                            }
                            size="small"
                          />
                        </td>
                      </tr>
                    );
                  })}
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

export default Inventory;