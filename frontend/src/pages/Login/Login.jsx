import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);

      localStorage.setItem("access_token", response.access_token);

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to login. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fb",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: 400,
          borderRadius: 3,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            textAlign="center"
            color="primary"
          >
            SalesPro
          </Typography>

          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 1, mb: 3 }}
          >
            Sales & Inventory Management
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.3,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 3, fontSize: 14 }}
          >
            Don't have an account?
          </Typography>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/register")}
            sx={{ mt: 0.5 }}
          >
            Create Account
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;