import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e1b2e",
            color: "#fff",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#a855f7", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
