import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

import { getCustomers } from "../../services/customerService";
import { getProducts } from "../../services/productService";
import { createOrder } from "../../services/orderService";

import ToastMessage from "../../components/Toast/ToastMessage";

function CreateOrder() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [customerData, productData] =
          await Promise.all([
            getCustomers(),
            getProducts(),
          ]);

        setCustomers(customerData);
        setProducts(productData);
      } catch (error) {
        showToast(
          error.response?.data?.detail ||
            "Unable to load customers and products.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedProduct = products.find(
    (product) =>
      product.id === Number(selectedProductId)
  );

  const handleAddItem = () => {
    if (!selectedProductId) {
      showToast(
        "Please select a product.",
        "warning"
      );
      return;
    }

    const selectedQuantity = Number(quantity);

    if (selectedQuantity <= 0) {
      showToast(
        "Quantity must be greater than 0.",
        "warning"
      );
      return;
    }

    if (
      selectedQuantity >
      selectedProduct.stock_quantity
    ) {
      showToast(
        `Only ${selectedProduct.stock_quantity} units are available.`,
        "error"
      );
      return;
    }

    const existingItem = orderItems.find(
      (item) =>
        item.product_id === selectedProduct.id
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + selectedQuantity;

      if (
        newQuantity >
        selectedProduct.stock_quantity
      ) {
        showToast(
          `Only ${selectedProduct.stock_quantity} units are available.`,
          "error"
        );
        return;
      }

      setOrderItems((previous) =>
        previous.map((item) =>
          item.product_id === selectedProduct.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal:
                  newQuantity * item.unit_price,
              }
            : item
        )
      );
    } else {
      setOrderItems((previous) => [
        ...previous,
        {
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          quantity: selectedQuantity,
          unit_price: selectedProduct.price,
          subtotal:
            selectedQuantity * selectedProduct.price,
          stock_quantity:
            selectedProduct.stock_quantity,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    setOrderItems((previous) =>
      previous.filter(
        (item) => item.product_id !== productId
      )
    );
  };

  const totalAmount = useMemo(() => {
    return orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );
  }, [orderItems]);

  const requiresApproval = totalAmount > 50000;

  const handleCreateOrder = async () => {
    if (!customerId) {
      showToast(
        "Please select a customer.",
        "warning"
      );
      return;
    }

    if (orderItems.length === 0) {
      showToast(
        "Please add at least one product.",
        "warning"
      );
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        customer_id: Number(customerId),
        items: orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(orderData);

      if (response.status === "PENDING_APPROVAL") {
        showToast(
          `Order ${response.order_number} requires manager approval.`,
          "info"
        );
      } else {
        showToast(
          `Order ${response.order_number} created successfully.`,
          "success"
        );
      }

      setCustomerId("");
      setOrderItems([]);
      setSelectedProductId("");
      setQuantity(1);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to create order.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          Create Order
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Create a sales order by selecting a customer
          and adding products.
        </Typography>
      </Box>

      {/* Customer */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            Customer Details
          </Typography>

          <FormControl fullWidth>
            <InputLabel>
              Select Customer
            </InputLabel>

            <Select
              value={customerId}
              label="Select Customer"
              onChange={(event) =>
                setCustomerId(event.target.value)
              }
            >
              {customers.map((customer) => (
                <MenuItem
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name} — {customer.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Add Products */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            Add Products
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "2fr 1fr auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <FormControl fullWidth>
              <InputLabel>
                Select Product
              </InputLabel>

              <Select
                value={selectedProductId}
                label="Select Product"
                onChange={(event) =>
                  setSelectedProductId(
                    event.target.value
                  )
                }
              >
                {products.map((product) => (
                  <MenuItem
                    key={product.id}
                    value={product.id}
                    disabled={
                      product.stock_quantity === 0
                    }
                  >
                    {product.name} ({product.sku}) —
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}{" "}
                    — Stock: {product.stock_quantity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              inputProps={{ min: 1 }}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleAddItem}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Order Items */}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Order Items
            </Typography>
          </Box>

          <Divider />

          {orderItems.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                No products added to this order.
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
                    padding: "14px 16px",
                    backgroundColor: "#f8fafc",
                    fontSize: "13px",
                    color: "#64748b",
                  },

                  "& td": {
                    padding: "14px 16px",
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
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.product_id}>
                      <td>
                        <Typography
                          fontWeight={600}
                          fontSize={14}
                        >
                          {item.name}
                        </Typography>
                      </td>

                      <td>{item.sku}</td>

                      <td>{item.quantity}</td>

                      <td>
                        ₹
                        {Number(
                          item.unit_price
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        ₹
                        {Number(
                          item.subtotal
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleRemoveItem(
                              item.product_id
                            )
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

      {/* Order Summary */}

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                width: {
                  xs: "100%",
                  sm: 360,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography color="text.secondary">
                  Items
                </Typography>

                <Typography fontWeight={600}>
                  {orderItems.length}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Total
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="primary"
                >
                  ₹
                  {Number(
                    totalAmount
                  ).toLocaleString("en-IN")}
                </Typography>
              </Box>

              {requiresApproval && (
                <Typography
                  variant="body2"
                  color="warning.main"
                  sx={{ mb: 2 }}
                >
                  This order exceeds ₹50,000 and
                  requires manager approval.
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={
                  <ShoppingCartCheckoutIcon />
                }
                onClick={handleCreateOrder}
                disabled={submitting}
              >
                {submitting
                  ? "Creating Order..."
                  : "Create Order"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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

export default CreateOrder;