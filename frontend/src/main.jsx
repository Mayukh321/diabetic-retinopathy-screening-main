import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ClerkAuthWrapper } from "./components/auth/ClerkAuthWrapper";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkAuthWrapper>
        <App />
      </ClerkAuthWrapper>
    </BrowserRouter>
  </React.StrictMode>
);