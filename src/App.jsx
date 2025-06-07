import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TripProvider } from "./context/TripContext"; // ✅ import this

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TripProvider> {/* ✅ wrap app in context */}
      <App />
    </TripProvider>
  </React.StrictMode>
);