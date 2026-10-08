import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ApprovalIcon from "@mui/icons-material/Approval";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";

import { useNavigate, useLocation } from "react-router-dom";

import { getUserFromToken } from "../../utils/auth";

const drawerWidth = 240;

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Products",
    path: "/products",
    icon: <InventoryIcon />,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: <PeopleIcon />,
  },
  {
    label: "Create Order",
    path: "/create-order",
    icon: <AddShoppingCartIcon />,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: <ShoppingCartIcon />,
  },
  {
    label: "Approvals",
    path: "/approvals",
    icon: <ApprovalIcon />,
    managerOnly: true,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: <InventoryIcon />,
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUserFromToken();
  const isManager = user?.role === "MANAGER";

  const visibleMenuItems = menuItems.filter(
    (item) => !item.managerOnly || isManager
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #e0e0e0",
        },
      }}
    >
      {/* Logo */}

      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 2.2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          {/* Logo Icon */}

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background:
                "linear-gradient(135deg, #42a5f5, #1565c0)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 3px 8px rgba(21, 101, 192, 0.25)",
            }}
          >
            <BarChartIcon fontSize="medium" />
          </Box>

          {/* Logo Text */}

          <Box>
            <Typography
              sx={{
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              <Box
                component="span"
                sx={{ color: "#1e293b" }}
              >
                Sales
              </Box>

              <Box
                component="span"
                sx={{ color: "#1976d2" }}
              >
                Pro
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: 9,
                color: "#64748b",
                mt: 0.4,
                letterSpacing: 0.3,
              }}
            >
              Sales & Inventory
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}

      <List sx={{ px: 1, mt: 1 }}>
        {visibleMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,

              "&.Mui-selected": {
                backgroundColor: "#e3f2fd",
                color: "primary.main",

                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              },

              "&:hover": {
                backgroundColor: "#f0f4f8",
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;