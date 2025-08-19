// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // ✅ Loads Tailwind styles
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<AppDataProvider>
				<App />
			</AppDataProvider>
		</BrowserRouter>
	</React.StrictMode>
);
