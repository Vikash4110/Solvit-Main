// File: src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { CounselorAuthProvider } from "./contexts/CounselorAuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CounselorAuthProvider>
        <App />
      </CounselorAuthProvider>
    </AuthProvider>
  </BrowserRouter>
);
