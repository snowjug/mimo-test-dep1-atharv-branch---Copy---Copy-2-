import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "./app/components/theme-provider.tsx";

// ✅ IMPORT GOOGLE PROVIDER
import { GoogleOAuthProvider } from "@react-oauth/google";

// 🔥 Replace with your real client ID
const GOOGLE_CLIENT_ID = "171540706123-0kbe2tufoa1nqs9hkb1dp2o1i0k8795d.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);