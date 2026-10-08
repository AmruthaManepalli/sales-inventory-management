import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

function Layout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f5f7fb",
          }}
        >
          <Outlet />
        </Box>
      </Box>

    </Box>
  );
}

export default Layout;