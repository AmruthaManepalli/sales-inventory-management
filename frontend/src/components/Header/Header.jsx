import { useEffect, useState } from "react";

import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";

import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../../services/authService";
import { logout } from "../../utils/auth";

function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    };

    loadUser();
  }, []);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  const displayRole =
    user?.role === "MANAGER"
      ? "Manager"
      : "Sales Executive";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#1f2937",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
        }}
      >
        {/* Page Title */}

        <Typography
          variant="h6"
          fontWeight={600}
        >
          Sales & Inventory Management
        </Typography>

        {/* Right Section */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Notifications */}

          <IconButton>
            <NotificationsNoneIcon />
          </IconButton>

          {/* Profile */}

          {user ? (
            <Box
              onClick={handleProfileClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                px: 1,
                py: 0.5,
                borderRadius: 2,

                "&:hover": {
                  backgroundColor: "#f5f7fb",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor:
                    "primary.main",
                }}
              >
                {initials}
              </Avatar>

              <Box>
                <Typography
                  fontSize={14}
                  fontWeight={600}
                >
                  {user.name}
                </Typography>

                <Typography
                  fontSize={12}
                  color="text.secondary"
                >
                  {displayRole}
                </Typography>
              </Box>
            </Box>
          ) : (
            <CircularProgress
              size={24}
              color="primary"
            />
          )}
        </Box>
      </Toolbar>

      {/* Profile Menu */}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={handleCloseMenu}
        >
          <PersonIcon
            fontSize="small"
            sx={{ mr: 1.5 }}
          />

          Profile
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <LogoutIcon
            fontSize="small"
            sx={{ mr: 1.5 }}
          />

          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Header;