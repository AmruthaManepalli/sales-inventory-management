import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ApprovalIcon from "@mui/icons-material/Approval";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckIcon from "@mui/icons-material/Check";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getDashboardSummary } from "../../services/dashboardService";

import ToastMessage from "../../components/Toast/ToastMessage";


function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
}) {
  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 1,
                color: "#1e293b",
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "block",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              backgroundColor: iconBackground,
              color: iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}


function Dashboard() {
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_orders: 0,
    rejected_orders: 0,
    pending_approvals: 0,
    low_stock_products: 0,
  });

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  const showToast = (
    message,
    severity = "success"
  ) => {
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


  const loadDashboard = async () => {
    try {
      setLoading(true);

      const data = await getDashboardSummary();

      setSummary(data);
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          "Unable to load dashboard data.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


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


  const overviewData = [
    {
      name: "Confirmed",
      value: summary.total_orders,
    },
    {
      name: "Pending",
      value: summary.pending_approvals,
    },
    {
      name: "Rejected",
      value: summary.rejected_orders,
    },
    {
      name: "Low Stock",
      value: summary.low_stock_products,
    },
  ];


  const inventoryStatus =
    summary.low_stock_products === 0
      ? "Inventory looks healthy"
      : `${summary.low_stock_products} product${
          summary.low_stock_products !== 1
            ? "s"
            : ""
        } need attention`;


  return (
    <Box>

      {/* Page Header */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          Dashboard
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Overview of sales, orders, approvals and
          inventory.
        </Typography>
      </Box>


      {/* KPI Cards */}

      <Grid
        container
        spacing={2}
      >

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Total Sales"
            value={`₹${Number(
              summary.total_sales
            ).toLocaleString("en-IN")}`}
            subtitle="Confirmed sales"
            icon={<TrendingUpIcon />}
            iconBackground="#e8f5e9"
            iconColor="#2e7d32"
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Total Orders"
            value={summary.total_orders}
            subtitle="Confirmed orders"
            icon={<ShoppingCartIcon />}
            iconBackground="#e3f2fd"
            iconColor="#1565c0"
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Pending Approvals"
            value={summary.pending_approvals}
            subtitle="Awaiting manager action"
            icon={<ApprovalIcon />}
            iconBackground="#fff3e0"
            iconColor="#ef6c00"
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Low Stock"
            value={summary.low_stock_products}
            subtitle="Products requiring attention"
            icon={<InventoryIcon />}
            iconBackground="#fce4ec"
            iconColor="#c62828"
          />
        </Grid>

      </Grid>


      {/* Analytics Section */}

      <Grid
        container
        spacing={2}
        sx={{ mt: 1 }}
      >

        {/* Business Overview */}

        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Card
            sx={{
              height: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              boxShadow:
                "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                  >
                    Business Overview
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Current order and inventory activity
                  </Typography>
                </Box>

                <TrendingUpIcon color="primary" />
              </Box>


              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <BarChart
                  data={overviewData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#1565c0"
                    radius={[6, 6, 0, 0]}
                    barSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>

            </CardContent>
          </Card>
        </Grid>


        {/* Inventory Health */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Card
            sx={{
              height: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              boxShadow:
                "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>

              <Typography
                variant="h6"
                fontWeight={600}
              >
                Inventory Health
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Current inventory status
              </Typography>


              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    summary.low_stock_products > 0
                      ? "#fff8e1"
                      : "#e8f5e9",
                }}
              >
                {summary.low_stock_products > 0 ? (
                  <WarningAmberIcon
                    sx={{
                      color: "#ef6c00",
                      fontSize: 38,
                    }}
                  />
                ) : (
                  <CheckIcon
                    sx={{
                      color: "#2e7d32",
                      fontSize: 38,
                    }}
                  />
                )}

                <Box>
                  <Typography fontWeight={600}>
                    {inventoryStatus}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {summary.low_stock_products} low-stock
                    product
                    {summary.low_stock_products !== 1
                      ? "s"
                      : ""}
                  </Typography>
                </Box>
              </Box>


              <Box sx={{ mt: 3 }}>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Pending approvals
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    {summary.pending_approvals}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#f1f5f9",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width:
                        summary.pending_approvals > 0
                          ? "70%"
                          : "8%",
                      height: "100%",
                      borderRadius: 4,
                      backgroundColor:
                        summary.pending_approvals > 0
                          ? "#ef6c00"
                          : "#2e7d32",
                    }}
                  />
                </Box>

              </Box>


              <Box sx={{ mt: 3 }}>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Confirmed orders
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    {summary.total_orders}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#f1f5f9",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width:
                        summary.total_orders > 0
                          ? "85%"
                          : "5%",
                      height: "100%",
                      borderRadius: 4,
                      backgroundColor: "#1565c0",
                    }}
                  />
                </Box>

              </Box>

            </CardContent>
          </Card>
        </Grid>

      </Grid>


      {/* Quick Summary */}

      <Grid
        container
        spacing={2}
        sx={{ mt: 1 }}
      >

        <Grid
          size={{
            xs: 12,
          }}
        >
          <Card
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              boxShadow:
                "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>

              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                Quick Summary
              </Typography>

              <Grid
                container
                spacing={2}
              >

                {/* Sales */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Confirmed Sales
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ mt: 0.5 }}
                    >
                      ₹
                      {Number(
                        summary.total_sales
                      ).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                </Grid>


                {/* Confirmed Orders */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Orders Completed
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ mt: 0.5 }}
                    >
                      {summary.total_orders}
                    </Typography>
                  </Box>
                </Grid>


                {/* Pending Approvals */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor:
                        summary.pending_approvals > 0
                          ? "#fff8e1"
                          : "#f8fafc",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Approval Queue
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ mt: 0.5 }}
                    >
                      {summary.pending_approvals} pending
                    </Typography>
                  </Box>
                </Grid>


                {/* Rejected Orders */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor:
                        summary.rejected_orders > 0
                          ? "#ffebee"
                          : "#f8fafc",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Rejected Orders
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ mt: 0.5 }}
                    >
                      {summary.rejected_orders}
                    </Typography>
                  </Box>
                </Grid>

              </Grid>

            </CardContent>
          </Card>
        </Grid>

      </Grid>


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

export default Dashboard;