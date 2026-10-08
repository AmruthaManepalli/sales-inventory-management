import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Registers/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Products from "../pages/Products/Products";
import Customers from "../pages/Customers/Customers";
import CreateOrder from "../pages/CreateOrder/CreateOrder";
import Orders from "../pages/Orders/Orders";
import Approvals from "../pages/Approvals/Approvals";
import Inventory from "../pages/Inventory/Inventory";

import Layout from "../components/Layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/inventory" element={<Inventory />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;