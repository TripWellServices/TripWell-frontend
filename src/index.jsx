// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TripProvider } from "./context/TripContext";
import { BrowserRouter } from "react-router-dom";

// 🚀 This is where your app starts
// 1. Wrap everything in <BrowserRouter> so routing works
// 2. Then wrap in <TripProvider> so we can hydrate user + trip
// 3. Finally render the main <App /> with all your pages

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>          {/* Step 1: Makes routing possible */}
			<TripProvider>         {/* Step 2: Authenticates + loads trip data */}
				<App />              {/* Step 3: Renders routes like /, /explainer */}
			</TripProvider>
		</BrowserRouter>
	</React.StrictMode>
);
